import { getDemoUser, json, missingDbResponse, requireDb } from './_shared.js';

export async function onRequestPost({ env }) {
  const db = requireDb(env);
  if (!db) return missingDbResponse();
  const user = await getDemoUser(db);
  return json({ user: { id: user.id, name: user.name, email: user.email }, token: 'demo-session-token' });
}
