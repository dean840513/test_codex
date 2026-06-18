import { centsToYuan, errorJson, getDemoUser, json, requireDb } from './_shared.js';

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const user = await getDemoUser(db);
    const { results } = await db.prepare(`
      SELECT c.id, c.quantity, c.created_at, p.id AS product_id, p.name, p.producer, p.vintage, p.price_cents, p.image_url
      FROM cellar_items c
      JOIN products p ON p.id = c.product_id
      WHERE c.user_id = ? AND c.quantity > 0
      ORDER BY c.created_at DESC, c.id DESC
    `).bind(user.id).all();

    return json({ cellar: results.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      createdAt: item.created_at,
      product: {
        id: item.product_id,
        name: item.name,
        producer: item.producer,
        vintage: item.vintage,
        priceCents: item.price_cents,
        price: centsToYuan(item.price_cents),
        imageUrl: item.image_url,
      },
    })) });
  } catch (error) {
    return errorJson(error);
  }
}
