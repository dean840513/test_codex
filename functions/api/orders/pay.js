import { assertPositiveInteger, errorJson, getDemoUser, json, readJson, requireDb } from '../_shared.js';

export async function onRequestPost({ env, request }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const orderId = assertPositiveInteger(body.orderId, '订单 ID');
    const user = await getDemoUser(db);
    const order = await db.prepare(`
      SELECT o.id, o.status, o.total_cents, oi.product_id, oi.quantity, p.stock
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE o.id = ? AND o.user_id = ?
    `).bind(orderId, user.id).first();

    if (!order) return json({ error: '订单不存在' }, { status: 404 });
    if (order.status === 'paid') return json({ order: { id: order.id, status: 'paid' }, message: '订单已支付' });
    if (order.status !== 'pending') return json({ error: `订单状态 ${order.status} 不能支付` }, { status: 409 });
    if (order.stock < order.quantity) return json({ error: '库存不足，无法完成支付' }, { status: 409 });

    const results = await db.batch([
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?').bind(order.quantity, order.product_id, order.quantity),
      db.prepare('UPDATE orders SET status = ? WHERE id = ? AND status = ?').bind('paid', order.id, 'pending'),
    ]);
    if (!results[0].meta.changes || !results[1].meta.changes) return json({ error: '支付失败，请重试' }, { status: 409 });

    await db.prepare(`INSERT INTO cellar_items (user_id, product_id, quantity, source_order_id)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity`)
      .bind(user.id, order.product_id, order.quantity, order.id)
      .run();

    return json({ order: { id: order.id, status: 'paid' }, message: '支付成功，库存已扣减并写入酒窖' });
  } catch (error) {
    return errorJson(error, error.message?.includes('必须') ? 400 : 500);
  }
}
