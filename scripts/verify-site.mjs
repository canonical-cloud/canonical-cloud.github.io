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
// Supabase and the pricing gate belong to /prices/ only; the home page must not carry them.
if (/supabase|PUBLIC_PRICES_OTP|prices-gate/i.test(home)) throw new Error('home page references the pricing gate or Supabase');

const prices = await readFile(join(root, 'dist/prices/index.html'), 'utf8');
for (const marker of ['id="prices-gate"', 'id="email-form"', 'id="code-form"', 'id="prices-content"', 'Foundation', 'Growth', 'Scale']) {
  if (!prices.includes(marker)) throw new Error(`prices page missing marker: ${marker}`);
}
// The tier data on the page must be the synced catalog, tier for tier.
const catalog = JSON.parse(await readFile(join(root, 'src/data/service-tiers.json'), 'utf8'));
for (const tier of catalog.tiers) {
  const price = `$${tier.monthlyPriceUsd.toLocaleString('en-US')}`;
  if (!prices.includes(tier.name) || !prices.includes(price)) throw new Error(`prices page missing ${tier.name} at ${price}`);
}
// The /prices/ bundle is the only place the gate script may be emitted.
const home2 = home.toLowerCase();
if (home2.includes('auth/v1/')) throw new Error('home page bundles the Supabase Auth call');
console.log('Verified Astro routes, navigation, access links, footer, and the isolated pricing gate.');
