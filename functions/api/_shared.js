export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function requireDb(env) {
  if (!env.DB) {
    return null;
  }
  return env.DB;
}

export function missingDbResponse() {
  return json({
    error: 'D1 数据库未绑定。请在 Cloudflare Pages 项目 Settings > Functions > D1 database bindings 中添加 binding 名称 DB。',
  }, { status: 500 });
}

export function centsToYuan(cents) {
  return Number((cents / 100).toFixed(2));
}

export function normalizeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    producer: row.producer,
    region: row.region,
    vintage: row.vintage,
    priceCents: row.price_cents,
    price: centsToYuan(row.price_cents),
    stock: row.stock,
    imageUrl: row.image_url,
    description: row.description,
    tastingNotes: row.tasting_notes,
  };
}

export async function getDemoUser(db) {
  let user = await db.prepare('SELECT * FROM users WHERE email = ?').bind('demo@example.com').first();
  if (!user) {
    const result = await db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').bind('测试买家', 'demo@example.com').run();
    user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(result.meta.last_row_id).first();
  }
  return user;
}
