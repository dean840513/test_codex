import { getDemoUser, json, readJson, missingDbResponse, requireDb } from './_shared.js';

export async function onRequestPost({ env, request }) {
  const db = requireDb(env);
  if (!db) return missingDbResponse();
  const body = await readJson(request);
  const productId = Number(body.productId);
  const quantity = Math.max(1, Number(body.quantity || 1));
  const priceCents = Math.round(Number(body.price || 0) * 100);

  if (!Number.isInteger(productId) || !Number.isInteger(quantity) || priceCents <= 0) {
    return json({ error: '参数错误' }, { status: 400 });
  }

  const user = await getDemoUser(db);
  const cellar = await db.prepare('SELECT quantity FROM cellar_items WHERE user_id = ? AND product_id = ?').bind(user.id, productId).first();
  if (!cellar || cellar.quantity < quantity) {
    return json({ error: '酒窖库存不足，无法转售' }, { status: 409 });
  }

  const result = await db.prepare('INSERT INTO resale_listings (user_id, product_id, quantity, price_cents) VALUES (?, ?, ?, ?)')
    .bind(user.id, productId, quantity, priceCents)
    .run();

  return json({ listing: { id: result.meta.last_row_id, productId, quantity, priceCents, status: 'active' }, message: '已上架转售' });
}
