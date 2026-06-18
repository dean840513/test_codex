import { api, getParam, money, showError } from './common.js';

async function load() {
  const orderId = getParam('orderId');
  const { orders } = await api('/api/orders');
  const order = orders.find((item) => String(item.id) === String(orderId));
  if (!order) throw new Error('订单不存在');
  document.querySelector('#payment').innerHTML = `
    <div class="stripe-brand">stripe</div>
    <h1>模拟支付</h1>
    <p>Order #${order.id} · ${order.productName} × ${order.quantity}</p>
    <p class="price">${money(order.totalCents)}</p>
    <label>Card number <input value="4242 4242 4242 4242" /></label>
    <label>Expiry <input value="12 / 34" /></label>
    <label>CVC <input value="123" /></label>
    <button id="pay" class="primary">Pay Successfully</button>`;
  document.querySelector('#pay').addEventListener('click', async () => {
    await api('/api/orders/pay', { method: 'POST', body: JSON.stringify({ orderId: order.id }) });
    window.location.href = '/orders.html';
  });
}

load().catch((error) => showError('#payment', error));
