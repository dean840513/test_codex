import { api, money, showError } from './common.js';

async function load() {
  const { cellar } = await api('/api/cellar');
  document.querySelector('#cellar').innerHTML = cellar.length ? cellar.map((item) => `
    <article class="list-item">
      <img src="${item.product.imageUrl}" alt="${item.product.name}" />
      <div><h3>${item.product.name} ${item.product.vintage}</h3><p class="muted">持有 ${item.quantity} 瓶 · 参考价 ${money(item.product.priceCents)}</p></div>
      <a class="button primary" href="/resell.html?productId=${item.product.id}">Resell</a>
    </article>
  `).join('') : '<p class="muted">酒窖为空，请先完成支付。</p>';
}

load().catch((error) => showError('#cellar', error));
