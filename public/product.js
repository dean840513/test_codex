import { api, getParam, money, showError } from './common.js';

async function load() {
  const id = getParam('id');
  const { product } = await api(`/api/product?id=${encodeURIComponent(id)}`);
  document.querySelector('#product').innerHTML = `
    <div class="detail-layout">
      <img src="${product.imageUrl}" alt="${product.name}" />
      <div>
        <p class="eyebrow">${product.region}</p>
        <h1>${product.name} ${product.vintage}</h1>
        <p class="muted">${product.producer}</p>
        <p>${product.description}</p>
        <p><strong>Tasting Notes:</strong> ${product.tastingNotes}</p>
        <p class="price">${money(product.priceCents)}</p>
        <p class="stock">库存：${product.stock} 瓶</p>
        <label>Quantity <input id="qty" type="number" min="1" max="${product.stock}" value="1" /></label>
        <button id="buy" class="primary">Buy Now</button>
      </div>
    </div>`;
  document.querySelector('#buy').addEventListener('click', () => {
    const qty = Math.max(1, Number(document.querySelector('#qty').value || 1));
    window.location.href = `/checkout.html?productId=${product.id}&qty=${qty}`;
  });
}

load().catch((error) => showError('#product', error));
