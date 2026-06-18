export const money = (cents = 0) => `¥${(Number(cents) / 100).toFixed(2)}`;

export function getParam(name, fallback = '') {
  return new URLSearchParams(window.location.search).get(name) || fallback;
}

export function renderNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  const links = [
    ['index.html', 'Home'],
    ['orders.html', 'My Orders'],
    ['cellar.html', 'My Cellar'],
    ['resale.html', 'Resale Market'],
  ];
  document.querySelector('#nav').innerHTML = links.map(([href, label]) => (
    `<a class="${current === href ? 'active' : ''}" href="/${href}">${label}</a>`
  )).join('');
}

export async function api(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body ? { 'content-type': 'application/json' } : {}),
      ...options?.headers,
    },
  });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : { error: await response.text() };

  if (!contentType.includes('application/json')) {
    throw new Error(`接口 ${url} 没有返回 JSON。请确认 Cloudflare Pages Functions 已部署，并且 /api/* 没有被静态页面接管。`);
  }
  if (!response.ok) {
    throw new Error(payload.error || '请求失败');
  }
  return payload;
}

export function showError(target, error) {
  document.querySelector(target).innerHTML = `<div class="notice error">${error.message}</div>`;
}

export function setText(selector, value) {
  document.querySelector(selector).textContent = value;
}

renderNav();
