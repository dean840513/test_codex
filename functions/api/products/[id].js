import { json, normalizeProduct, missingDbResponse, requireDb } from '../_shared.js';

export async function onRequestGet({ env, params }) {
  const db = requireDb(env);
  if (!db) return missingDbResponse();
  const product = await db.prepare('SELECT * FROM products WHERE id = ?').bind(params.id).first();
  if (!product) {
    return json({ error: '商品不存在' }, { status: 404 });
  }
  return json({ product: normalizeProduct(product) });
}
