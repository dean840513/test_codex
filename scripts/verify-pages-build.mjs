import { access, stat } from 'node:fs/promises';

const required = [
  'public/index.html',
  'public/product.html',
  'public/checkout.html',
  'public/payment.html',
  'public/orders.html',
  'public/cellar.html',
  'public/resale.html',
  'public/resell.html',
  'public/common.js',
  'public/styles.css',
  'public/_routes.json',
];
await Promise.all(required.map((file) => access(file)));
const output = await stat('public');
if (!output.isDirectory()) {
  throw new Error('Cloudflare Pages output directory "public" is not a directory.');
}
console.log('Cloudflare Pages multi-page static output is ready in ./public.');
