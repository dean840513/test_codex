import { errorJson, json, normalizeProduct, requireDb } from './_shared.js';

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const { results } = await db.prepare('SELECT * FROM products ORDER BY id').all();
    return json({ products: results.map(normalizeProduct) });
  } catch (error) {
    return errorJson(error);
  }
}
