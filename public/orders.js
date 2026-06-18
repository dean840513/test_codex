import { api, money, showError } from './common.js';

async function load() {
  const { orders } = await api('/api/orders');
  document.querySelector('#orders').innerHTML = orders.length ? `
    <table><thead><tr><th>Order ID</th><th>商品</th><th>数量</th><th>金额</th><th>状态</th><th>创建时间</th></tr></thead><tbody>
    ${orders.map((order) => `<tr>
      <td>#${order.id}</td><td>${order.productName}</td><td>${order.quantity}</td><td>${money(order.totalCents)}</td>
      <td><span class="badge ${order.status}">${order.status}</span></td><td>${order.createdAt}</td>
    </tr>`).join('')}
    </tbody></table>` : '<p class="muted">暂无订单。</p>';
}

load().catch((error) => showError('#orders', error));
