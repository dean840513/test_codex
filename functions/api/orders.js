import { centsToYuan, errorJson, getDemoUser, json, requireDb } from './_shared.js';

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const user = await getDemoUser(db);
    const { results } = await db.prepare(`
      SELECT o.id, o.total_cents, o.status, o.created_at, oi.quantity, p.id AS product_id, p.name, p.vintage
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC, o.id DESC
    `).bind(user.id).all();

    return json({ orders: results.map((order) => ({
      id: order.id,
      productId: order.product_id,
      productName: `${order.name} ${order.vintage}`,
      quantity: order.quantity,
      totalCents: order.total_cents,
      total: centsToYuan(order.total_cents),
      status: order.status,
      createdAt: order.created_at,
    })) });
  } catch (error) {
    return errorJson(error);
  }
}
