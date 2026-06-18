import { json, normalizeProduct, missingDbResponse, requireDb } from './_shared.js';

export async function onRequestGet({ env }) {
  const db = requireDb(env);
  if (!db) return missingDbResponse();
  const { results } = await db.prepare('SELECT * FROM products ORDER BY id').all();
  return json({ products: results.map(normalizeProduct) });
}
