import { assertPositiveInteger, errorJson, getDemoUser, json, readJson, requireDb } from '../_shared.js';

export async function onRequestPost({ env, request }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const productId = assertPositiveInteger(body.productId, '商品 ID');
    const quantity = assertPositiveInteger(body.quantity || 1, '购买数量');
    const user = await getDemoUser(db);
    const product = await db.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first();
    if (!product) return json({ error: '商品不存在' }, { status: 404 });
    if (product.stock < quantity) return json({ error: '库存不足' }, { status: 409 });

    const total = product.price_cents * quantity;
    const orderResult = await db.prepare('INSERT INTO orders (user_id, total_cents, status) VALUES (?, ?, ?)')
      .bind(user.id, total, 'pending')
      .run();
    const orderId = orderResult.meta.last_row_id;
    await db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES (?, ?, ?, ?)')
      .bind(orderId, productId, quantity, product.price_cents)
      .run();

    return json({ order: { id: orderId, status: 'pending', totalCents: total, quantity } }, { status: 201 });
  } catch (error) {
    return errorJson(error, error.message?.includes('必须') ? 400 : 500);
  }
}
