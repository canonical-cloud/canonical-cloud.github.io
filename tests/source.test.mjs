import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
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
test('pricing is a real route linked from the header, footer, and sitemap', async () => {
  const [header, footer, sitemap] = await Promise.all([read('src/components/Header.astro'), read('src/components/Footer.astro'), read('public/sitemap.xml')]);
  assert.match(header, /href="\/prices\/"/); assert.match(footer, /href="\/prices\/"/); assert.match(sitemap, /\/prices\/<\/loc>/);
  const page = await read('src/pages/prices/index.astro');
  assert.match(page, /id="prices-gate"/); assert.match(page, /auth\/v1\//); assert.match(page, /supabase\('otp'/); assert.match(page, /PUBLIC_PRICES_OTP/);
  assert.doesNotMatch(page, /@supabase\/supabase-js/, 'the gate uses built-in fetch, not the Supabase SDK');
});
test('only the prices page talks to Supabase or reads the gate variables', async () => {
  const offenders = [];
  async function walk(dir) {
    for (const entry of await readdir(new URL(`../${dir}/`, import.meta.url), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) { await walk(path); continue; }
      if (path === 'src/pages/prices/index.astro') continue;
      const text = await read(path);
      if (/supabase|PUBLIC_PRICES_OTP|PUBLIC_SUPABASE/i.test(text)) offenders.push(path);
    }
  }
  await walk('src');
  assert.deepEqual(offenders, []);
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.dependencies['@supabase/supabase-js'], undefined, 'no Supabase dependency on the whole site');
});
test('the tier catalog is the governed three-tier schedule', async () => {
  const catalog = JSON.parse(await read('src/data/service-tiers.json'));
  assert.equal(catalog.sourceRepository, 'canonical-cloud/canonical-docs');
  assert.equal(catalog.tiers.length, 3);
  const prices = catalog.tiers.map((t) => t.monthlyPriceUsd);
  assert.deepEqual([...prices].sort((a, b) => a - b), prices);
  assert.equal(new Set(prices).size, 3, 'three distinct price points');
  for (const tier of catalog.tiers) {
    assert.ok(catalog.supportTiers.some((s) => s.id === tier.supportTierId), `${tier.id} support tier exists`);
    assert.ok(catalog.sowPackages.some((s) => s.id === tier.sowPackageId), `${tier.id} SOW package exists`);
  }
});
test('the pages workflow injects the gate variables at build time only', async () => {
  const pages = await read('.github/workflows/pages.yml');
  assert.match(pages, /PUBLIC_CANONICAL_SUPABASE_URL: \$\{\{ vars\.CANONICAL_SUPABASE_URL \}\}/);
  assert.match(pages, /PUBLIC_CANONICAL_SUPABASE_PUBLISHABLE_KEY: \$\{\{ vars\.CANONICAL_SUPABASE_PUBLISHABLE_KEY \}\}/);
  assert.match(pages, /PUBLIC_PRICES_OTP: \$\{\{ secrets\.PRICES_OTP \}\}/);
});
