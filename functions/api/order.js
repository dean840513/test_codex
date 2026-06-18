import { getDemoUser, json, readJson, requireDb } from './_shared.js';

export async function onRequestPost({ env, request }) {
  const db = requireDb(env);
  const body = await readJson(request);
  const productId = Number(body.productId);
  const quantity = Math.max(1, Number(body.quantity || 1));

  if (!Number.isInteger(productId) || !Number.isInteger(quantity)) {
    return json({ error: '参数错误' }, { status: 400 });
  }

  const user = await getDemoUser(db);
  const product = await db.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first();
  if (!product) return json({ error: '商品不存在' }, { status: 404 });
  if (product.stock < quantity) return json({ error: '库存不足' }, { status: 409 });

  const total = product.price_cents * quantity;
  const orderResult = await db.batch([
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?').bind(quantity, productId, quantity),
    db.prepare('INSERT INTO orders (user_id, total_cents) VALUES (?, ?)').bind(user.id, total),
  ]);

  if (!orderResult[0].meta.changes) return json({ error: '库存不足' }, { status: 409 });
  const orderId = orderResult[1].meta.last_row_id;
  await db.batch([
    db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES (?, ?, ?, ?)').bind(orderId, productId, quantity, product.price_cents),
    db.prepare(`INSERT INTO cellar_items (user_id, product_id, quantity, source_order_id)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity`).bind(user.id, productId, quantity, orderId),
  ]);

  return json({ order: { id: orderId, totalCents: total, quantity }, message: '下单成功，已加入我的酒窖' });
}
