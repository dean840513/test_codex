import { assertPositiveInteger, errorJson, json, normalizeProduct, requireDb } from './_shared.js';

export async function onRequestGet({ env, request }) {
  try {
    const db = requireDb(env);
    const id = assertPositiveInteger(new URL(request.url).searchParams.get('id'), '商品 ID');
    const product = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    if (!product) return json({ error: '商品不存在' }, { status: 404 });
    return json({ product: normalizeProduct(product) });
  } catch (error) {
    return errorJson(error, error.message?.includes('必须') ? 400 : 500);
  }
}
