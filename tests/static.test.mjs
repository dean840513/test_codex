import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile('migrations/0001_initial.sql', 'utf8');
const index = await readFile('public/index.js', 'utf8');
const product = await readFile('public/product.js', 'utf8');
const checkout = await readFile('public/checkout.js', 'utf8');
const payment = await readFile('public/payment.js', 'utf8');
const ordersPage = await readFile('public/orders.js', 'utf8');
const cellarPage = await readFile('public/cellar.js', 'utf8');
const resalePage = await readFile('public/resale.js', 'utf8');
const resellPage = await readFile('public/resell.js', 'utf8');
const common = await readFile('public/common.js', 'utf8');
const routes = await readFile('public/_routes.json', 'utf8');
const createOrder = await readFile('functions/api/orders/create.js', 'utf8');
const payOrder = await readFile('functions/api/orders/pay.js', 'utf8');
const createResale = await readFile('functions/api/resales/create.js', 'utf8');
const buyResale = await readFile('functions/api/resales/buy.js', 'utf8');

const frontend = [index, product, checkout, payment, ordersPage, cellarPage, resalePage, resellPage, common].join('\n');

test('D1 schema contains commerce tables and seed products', () => {
  for (const table of ['users', 'products', 'orders', 'order_items', 'cellar_items', 'resale_listings']) {
    assert.match(migration, new RegExp(`CREATE TABLE ${table}`));
  }
  assert.match(migration, /INSERT INTO products/);
});

test('frontend uses required multi-page URLs and API endpoints', () => {
  for (const page of ['product.html', 'checkout.html', 'payment.html', 'orders.html', 'cellar.html', 'resale.html', 'resell.html']) {
    assert.match(frontend, new RegExp(page));
  }
  for (const endpoint of ['/api/products', '/api/product', '/api/orders/create', '/api/orders/pay', '/api/orders', '/api/cellar', '/api/resales', '/api/resales/create', '/api/resales/buy']) {
    assert.match(frontend, new RegExp(endpoint));
  }
});

test('order payment flow creates pending order then pays with stock decrement and cellar write', () => {
  assert.match(createOrder, /'pending'/);
  assert.doesNotMatch(createOrder, /UPDATE products SET stock/);
  assert.match(payOrder, /UPDATE products SET stock = stock - \?/);
  assert.match(payOrder, /UPDATE orders SET status = \?/);
  assert.match(payOrder, /INSERT INTO cellar_items/);
});

test('resale flow prevents oversell and supports active listing purchase', () => {
  assert.match(createResale, /SUM\(quantity\)/);
  assert.match(createResale, /available < quantity/);
  assert.match(buyResale, /UPDATE resale_listings/);
  assert.match(buyResale, /UPDATE cellar_items SET quantity = quantity - 1/);
});

test('Pages routes explicitly send API traffic to Functions and frontend guards JSON parsing', () => {
  assert.match(routes, /"\/api\/\*"/);
  assert.match(common, /没有返回 JSON/);
});
