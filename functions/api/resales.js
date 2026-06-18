import { centsToYuan, errorJson, json, requireDb } from './_shared.js';

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const { results } = await db.prepare(`
      SELECT r.id, r.quantity, r.price_cents, r.status, r.created_at,
        u.id AS seller_id, u.name AS seller_name,
        p.id AS product_id, p.name, p.producer, p.vintage, p.image_url
      FROM resale_listings r
      JOIN users u ON u.id = r.user_id
      JOIN products p ON p.id = r.product_id
      WHERE r.status = 'active' AND r.quantity > 0
      ORDER BY r.created_at DESC, r.id DESC
    `).all();

    return json({ resales: results.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      priceCents: item.price_cents,
      price: centsToYuan(item.price_cents),
      status: item.status,
      createdAt: item.created_at,
      seller: { id: item.seller_id, name: item.seller_name },
      product: { id: item.product_id, name: item.name, producer: item.producer, vintage: item.vintage, imageUrl: item.image_url },
    })) });
  } catch (error) {
    return errorJson(error);
  }
}
