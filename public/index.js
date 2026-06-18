import { api, money, showError } from './common.js';

async function load() {
  const { products } = await api('/api/products');
  document.querySelector('#products').innerHTML = products.map((product) => `
    <article class="card">
      <a href="/product.html?id=${product.id}"><img src="${product.imageUrl}" alt="${product.name}" /></a>
      <div class="card-body">
        <p class="eyebrow">${product.region}</p>
        <h3><a href="/product.html?id=${product.id}">${product.name} ${product.vintage}</a></h3>
        <p class="muted">${product.producer}</p>
        <strong>${money(product.priceCents)}</strong>
        <p class="stock">库存：${product.stock} 瓶</p>
        <a class="button primary" href="/product.html?id=${product.id}">View Product</a>
      </div>
    </article>
  `).join('');
}

load().catch((error) => showError('#products', error));
