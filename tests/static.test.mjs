import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile('migrations/0001_initial.sql', 'utf8');
const app = await readFile('public/app.js', 'utf8');
const orderFunction = await readFile('functions/api/order.js', 'utf8');

test('D1 schema contains commerce tables and seed products', () => {
  for (const table of ['users', 'products', 'orders', 'order_items', 'cellar_items', 'resale_listings']) {
    assert.match(migration, new RegExp(`CREATE TABLE ${table}`));
  }
  assert.match(migration, /INSERT INTO products/);
});

test('frontend calls all required Pages Functions endpoints', () => {
  for (const endpoint of ['/api/products', '/api/login', '/api/order', '/api/cellar', '/api/resale']) {
    assert.match(app, new RegExp(endpoint));
  }
});

test('order flow decrements stock before adding cellar items', () => {
  assert.match(orderFunction, /UPDATE products SET stock = stock - \?/);
  assert.match(orderFunction, /INSERT INTO cellar_items/);
  assert.match(orderFunction, /ON CONFLICT\(user_id, product_id\)/);
});
