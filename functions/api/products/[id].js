import { assertPositiveInteger, errorJson, json, normalizeProduct, requireDb } from '../_shared.js';

export async function onRequestGet({ env, params }) {
  try {
    const db = requireDb(env);
    const product = await db.prepare('SELECT * FROM products WHERE id = ?').bind(assertPositiveInteger(params.id, '商品 ID')).first();
    if (!product) return json({ error: '商品不存在' }, { status: 404 });
    return json({ product: normalizeProduct(product) });
  } catch (error) {
    return errorJson(error, error.message?.includes('必须') ? 400 : 500);
  }
}
