import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
test('site stays Astro-only with a shared sticky header and footer', async () => {
  const [pkg, header, footer, css] = await Promise.all([read('package.json'), read('src/components/Header.astro'), read('src/components/Footer.astro'), read('src/styles/global.css')]);
  assert.match(pkg, /"astro"/); assert.doesNotMatch(pkg, /jekyll|hugo|react/i);
  assert.match(header, /site-header/); assert.match(footer, /site-footer/); assert.match(css, /position:sticky/);
});
test('login and signup use separate public boundaries', async () => {
  const data = await read('src/data/site.ts');
  assert.match(data, /userUrl/); assert.match(data, /orgUrl/); assert.match(data, /authUrl/);
});
test('pricing is a separate OTP-gated route without a Supabase SDK in the shared package graph', async () => {
  const [pkg, header, prices] = await Promise.all([
    read('package.json'),
    read('src/components/Header.astro'),
    read('src/pages/prices/index.astro'),
  ]);
  assert.match(header, /href="\/prices\/"/);
  assert.match(prices, /auth\/v1\/otp/);
  assert.match(prices, /auth\/v1\/verify/);
  assert.match(prices, /sessionStorage/);
  assert.match(prices, /PUBLIC_CANONICAL_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(pkg, /@supabase\/supabase-js/);
  assert.doesNotMatch(prices, /service_role|SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(prices, /\$4,000\/month|\$8,000\/month|\$12,000\/month/);
});
