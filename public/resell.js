import { api, getParam, money, showError } from './common.js';

async function load() {
  const productId = getParam('productId');
  const [{ product }, { cellar }] = await Promise.all([
    api(`/api/product?id=${encodeURIComponent(productId)}`),
    api('/api/cellar'),
  ]);
  const item = cellar.find((entry) => String(entry.product.id) === String(productId));
  const available = item?.quantity || 0;
  document.querySelector('#resell').innerHTML = `
    <h1>Resell ${product.name}</h1>
    <p>可转售数量：<strong>${available}</strong> 瓶</p>
    <form id="form">
      <label>Quantity <input id="quantity" name="quantity" type="number" min="1" max="${available}" value="1" /></label>
      <label>Price <input name="price" type="number" min="1" step="0.01" value="${(product.priceCents / 100 * 1.08).toFixed(2)}" /></label>
      <button class="primary" ${available < 1 ? 'disabled' : ''}>Create Resale Listing</button>
    </form>`;
  document.querySelector('#form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const quantity = Number(form.get('quantity'));
    if (quantity > available) throw new Error('转售数量不能超过酒窖可用数量');
    await api('/api/resales/create', { method: 'POST', body: JSON.stringify({ productId, quantity, price: form.get('price') }) });
    window.location.href = '/resale.html';
  });
}

load().catch((error) => showError('#resell', error));
