import { api, getParam, money, showError } from './common.js';

async function load() {
  const productId = getParam('productId');
  const qty = Math.max(1, Number(getParam('qty', '1')));
  const { product } = await api(`/api/product?id=${encodeURIComponent(productId)}`);
  const total = product.priceCents * qty;
  document.querySelector('#checkout').innerHTML = `
    <h1>Checkout</h1>
    <p>${product.name} ${product.vintage}</p>
    <p>数量：${qty}</p>
    <p>单价：${money(product.priceCents)}</p>
    <p class="price">合计：${money(total)}</p>
    <button id="pay" class="primary">Proceed to Payment</button>`;
  document.querySelector('#pay').addEventListener('click', async () => {
    const { order } = await api('/api/orders/create', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id, quantity: qty }),
    });
    window.location.href = `/payment.html?orderId=${order.id}`;
  });
}

load().catch((error) => showError('#checkout', error));
