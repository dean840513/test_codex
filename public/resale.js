import { api, money, showError } from './common.js';

async function buy(listingId) {
  await api('/api/resales/buy', { method: 'POST', body: JSON.stringify({ listingId }) });
  alert('二手商品购买成功，已加入我的酒窖。');
  await load();
}

async function load() {
  const { resales } = await api('/api/resales');
  document.querySelector('#resales').innerHTML = resales.length ? resales.map((item) => `
    <article class="list-item">
      <img src="${item.product.imageUrl}" alt="${item.product.name}" />
      <div><h3>${item.product.name} ${item.product.vintage}</h3><p class="muted">卖家：${item.seller.name} · 数量：${item.quantity} 瓶</p><p class="price">${money(item.priceCents)}</p></div>
      <button class="primary" data-buy="${item.id}">Buy Resale</button>
    </article>
  `).join('') : '<p class="muted">暂无 active 转售商品。</p>';
  document.querySelectorAll('[data-buy]').forEach((button) => button.addEventListener('click', () => buy(button.dataset.buy)));
}

load().catch((error) => showError('#resales', error));
