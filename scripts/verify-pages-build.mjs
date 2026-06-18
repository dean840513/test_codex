import { access, stat } from 'node:fs/promises';

const required = ['public/index.html', 'public/app.js', 'public/styles.css'];
await Promise.all(required.map((file) => access(file)));
const output = await stat('public');
if (!output.isDirectory()) {
  throw new Error('Cloudflare Pages output directory "public" is not a directory.');
}
console.log('Cloudflare Pages static output is ready in ./public.');
