import { assertPositiveInteger, errorJson, getDemoUser, json, readJson, requireDb } from '../_shared.js';

export async function onRequestPost({ env, request }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const productId = assertPositiveInteger(body.productId, '商品 ID');
    const quantity = assertPositiveInteger(body.quantity || 1, '转售数量');
    const priceCents = Math.round(Number(body.price || 0) * 100);
    if (!Number.isInteger(priceCents) || priceCents <= 0) return json({ error: '转售价格必须大于 0' }, { status: 400 });

    const user = await getDemoUser(db);
    const cellar = await db.prepare('SELECT quantity FROM cellar_items WHERE user_id = ? AND product_id = ?').bind(user.id, productId).first();
    const listed = await db.prepare("SELECT COALESCE(SUM(quantity), 0) AS quantity FROM resale_listings WHERE user_id = ? AND product_id = ? AND status = 'active'").bind(user.id, productId).first();
    const available = (cellar?.quantity || 0) - (listed?.quantity || 0);
    if (available < quantity) return json({ error: '酒窖可转售库存不足，无法转售' }, { status: 409 });

    const result = await db.prepare('INSERT INTO resale_listings (user_id, product_id, quantity, price_cents, status) VALUES (?, ?, ?, ?, ?)')
      .bind(user.id, productId, quantity, priceCents, 'active')
      .run();

    return json({ listing: { id: result.meta.last_row_id, productId, quantity, priceCents, status: 'active' }, message: '已上架转售' }, { status: 201 });
  } catch (error) {
    return errorJson(error, error.message?.includes('必须') ? 400 : 500);
  }
}
