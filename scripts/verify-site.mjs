import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const required = ['index.html', 'product/index.html', 'prices/index.html', 'trust/index.html', 'about/index.html'];
for (const route of required) { await stat(join(root, 'dist', route)); }
const home = await readFile(join(root, 'dist/index.html'), 'utf8');
for (const marker of ['Canonical Cloud', '<header', '<footer', 'Log in', 'Sign up', 'Built with Astro', 'href="/prices/"']) {
  if (!home.includes(marker)) throw new Error(`missing built marker: ${marker}`);
}
if (/jekyll|hugo/i.test(home)) throw new Error('legacy generator marker found in built site');

const prices = await readFile(join(root, 'dist/prices/index.html'), 'utf8');
for (const marker of ['Work email', 'One-time code', 'Email me a code', '/auth/v1/otp', '/auth/v1/verify', 'canonical-prices']) {
  if (!prices.includes(marker)) throw new Error(`missing prices gate marker: ${marker}`);
}
for (const leakedPrice of ['$4,000/month', '$8,000/month', '$12,000/month']) {
  if (prices.includes(leakedPrice)) throw new Error(`static prices page leaks gated tier payload: ${leakedPrice}`);
}
console.log('Verified Astro routes, separate prices page, OTP gate, navigation, access links, and footer.');
