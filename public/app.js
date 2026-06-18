const state = { user: null, products: [] };
const money = (cents) => `¥${(cents / 100).toFixed(2)}`;
const api = async (url, options) => {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) {
    throw new Error(payload.error || '请求失败');
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`接口 ${url} 没有返回 JSON。请确认 Cloudflare Pages Functions 已部署，并已绑定 D1 数据库 DB。`);
  }

  return payload;
};

async function login() {
  const data = await api('/api/login', { method: 'POST' });
  state.user = data.user;
  document.querySelector('#userBadge').textContent = `${data.user.name}（模拟登录）`;
}

async function loadProducts() {
  const { products } = await api('/api/products');
  state.products = products;
  const root = document.querySelector('#products');
  const template = document.querySelector('#productCard');
  root.replaceChildren(...products.map((product) => {
    const card = template.content.cloneNode(true);
    card.querySelector('img').src = product.imageUrl;
    card.querySelector('img').alt = product.name;
    card.querySelector('h3').textContent = `${product.name} ${product.vintage}`;
    card.querySelector('.muted').textContent = `${product.producer} · ${product.region}`;
    card.querySelector('strong').textContent = money(product.priceCents);
    card.querySelector('.stock').textContent = `库存：${product.stock} 瓶`;
    card.querySelector('.detailBtn').addEventListener('click', () => showDetail(product.id));
    card.querySelector('.buyBtn').addEventListener('click', () => buy(product.id));
    return card;
  }));
}

async function showDetail(id) {
  const { product } = await api(`/api/products/${id}`);
  document.querySelector('#detail').innerHTML = `
    <h2>${product.name}</h2>
    <p class="muted">${product.producer} · ${product.region} · ${product.vintage}</p>
    <p>${product.description}</p>
    <p><strong>品鉴：</strong>${product.tastingNotes}</p>
    <p><strong>价格：</strong>${money(product.priceCents)} · <strong>库存：</strong>${product.stock} 瓶</p>
  `;
}

async function buy(productId) {
  if (!state.user) await login();
  const data = await api('/api/order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ productId, quantity: 1 }),
  });
  alert(data.message);
  await Promise.all([loadProducts(), loadCellar()]);
}

async function loadCellar() {
  const { cellar } = await api('/api/cellar');
  const root = document.querySelector('#cellar');
  if (!cellar.length) {
    root.innerHTML = '<p class="muted">酒窖为空，请先模拟下单。</p>';
    return;
  }
  root.replaceChildren(...cellar.map((item) => {
    const row = document.createElement('div');
    row.className = 'cellar-item';
    row.innerHTML = `
      <div>
        <strong>${item.product.name} ${item.product.vintage}</strong>
        <p class="muted">持有 ${item.quantity} 瓶 · 原价 ${money(item.product.priceCents)}</p>
      </div>
      <form>
        <input name="price" type="number" min="1" step="0.01" value="${(item.product.priceCents / 100 * 1.08).toFixed(2)}" aria-label="转售价" />
        <button class="primary">转售上架</button>
      </form>
    `;
    row.querySelector('form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const price = new FormData(event.currentTarget).get('price');
      const data = await api('/api/resale', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId: item.product.id, quantity: 1, price }),
      });
      alert(`${data.message}，挂牌编号 #${data.listing.id}`);
    });
    return row;
  }));
}

document.querySelector('#loginBtn').addEventListener('click', login);
document.querySelector('#refreshCellar').addEventListener('click', loadCellar);
loadProducts().catch((error) => alert(error.message));
loadCellar().catch((error) => {
  document.querySelector('#cellar').innerHTML = `<p class="muted">${error.message}</p>`;
});
