import { errorJson, getDemoUser, json, requireDb } from './_shared.js';

export async function onRequestPost({ env }) {
  try {
    const user = await getDemoUser(requireDb(env));
    return json({ user: { id: user.id, name: user.name, email: user.email }, token: 'demo-session-token' });
  } catch (error) {
    return errorJson(error);
  }
}
