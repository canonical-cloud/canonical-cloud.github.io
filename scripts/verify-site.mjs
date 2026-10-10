import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const required = ['index.html', 'product/index.html', 'prices/index.html', 'trust/index.html', 'about/index.html'];
for (const route of required) { await stat(join(root, 'dist', route)); }
const home = await readFile(join(root, 'dist/index.html'), 'utf8');
for (const marker of ['Canonical Cloud', '<header', '<footer', 'Built with Astro', 'Explore Canonical Plus']) {
  if (!home.includes(marker)) throw new Error(`missing built marker: ${marker}`);
}
if (!home.includes('href="/prices/"')) throw new Error('home navigation does not expose the standalone /prices/ route');
const header = home.split('</header>')[0];
if (header.includes('>Product</a>')) throw new Error('Product navigation must not appear in the public header');
for (const label of ['Log in', 'Sign up', 'Create an account', 'User login', 'Organization login']) {
  if (header.includes(label)) throw new Error(`public header must not advertise ${label}`);
}
if (home.includes('href="https://auth.canonical-cloud.github.io/"') || home.includes('href="https://user.canonical-cloud.github.io/"')) {
  throw new Error('public marketing homepage must not advertise login or account creation');
}
if (/jekyll|hugo/i.test(home)) throw new Error('legacy generator marker found in built site');

const prices = await readFile(join(root, 'dist/prices/index.html'), 'utf8');
for (const marker of ['Send a one-time code', 'Enter the code', 'Verify and view pricing', 'canonical-prices', 'id="sow-grid"', 'id="support-body"']) {
  if (!prices.includes(marker)) throw new Error(`missing prices gate marker: ${marker}`);
}
const catalog = JSON.parse(await readFile(join(root, 'src/data/service-tiers.json'), 'utf8'));
const forbiddenAmounts = catalog.tiers.flatMap((t) => [`$${t.monthlyPriceUsd.toLocaleString('en-US')}`, `monthlyPriceUsd":${t.monthlyPriceUsd}`, `monthlyPriceUsd: ${t.monthlyPriceUsd}`]);
for (const forbidden of forbiddenAmounts) {
  if (prices.includes(forbidden)) throw new Error(`static prices page leaked gated amount: ${forbidden}`);
}
if (!prices.includes('/auth/v1/otp') || !prices.includes('/auth/v1/verify')) {
  throw new Error('prices page is missing Supabase OTP send/verify calls');
}
if (!prices.includes('/functions/v1/')) throw new Error('prices page is missing authenticated pricing-function request');

console.log('Verified Astro routes, navigation, OTP gate, authenticated pricing fetch, and no static price leakage.');
