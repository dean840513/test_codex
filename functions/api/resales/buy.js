import { assertPositiveInteger, errorJson, getDemoUser, json, readJson, requireDb } from '../_shared.js';

export async function onRequestPost({ env, request }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const listingId = assertPositiveInteger(body.listingId, '转售 ID');
    const buyer = await getDemoUser(db);
    const listing = await db.prepare(`
      SELECT r.id, r.user_id AS seller_id, r.product_id, r.quantity, r.price_cents, r.status
      FROM resale_listings r
      WHERE r.id = ?
    `).bind(listingId).first();

    if (!listing) return json({ error: '二手商品不存在' }, { status: 404 });
    if (listing.status !== 'active' || listing.quantity < 1) return json({ error: '二手商品不可购买' }, { status: 409 });

    const orderResult = await db.prepare('INSERT INTO orders (user_id, total_cents, status) VALUES (?, ?, ?)')
      .bind(buyer.id, listing.price_cents, 'paid')
      .run();
    const orderId = orderResult.meta.last_row_id;

    await db.batch([
      db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES (?, ?, ?, ?)').bind(orderId, listing.product_id, 1, listing.price_cents),
      db.prepare(`INSERT INTO cellar_items (user_id, product_id, quantity, source_order_id)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity`).bind(buyer.id, listing.product_id, 1, orderId),
      db.prepare(`UPDATE resale_listings
        SET quantity = quantity - 1,
            status = CASE WHEN quantity - 1 <= 0 THEN 'sold' ELSE status END
        WHERE id = ? AND status = 'active' AND quantity > 0`).bind(listing.id),
      db.prepare('UPDATE cellar_items SET quantity = quantity - 1 WHERE user_id = ? AND product_id = ? AND quantity > 0').bind(listing.seller_id, listing.product_id),
    ]);

    return json({ order: { id: orderId, status: 'paid' }, message: '二手商品购买成功' });
  } catch (error) {
    return errorJson(error, error.message?.includes('必须') ? 400 : 500);
  }
}
