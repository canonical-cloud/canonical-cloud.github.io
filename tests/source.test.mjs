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
test('prices is a real route linked from the header, footer, and sitemap', async () => {
  const [header, footer, sitemap] = await Promise.all([read('src/components/Header.astro'), read('src/components/Footer.astro'), read('public/sitemap.xml')]);
  assert.match(header, /href="\/prices\/"/); assert.match(footer, /href="\/prices\/"/); assert.match(sitemap, /\/prices\/<\/loc>/);
});
test('the prices page authenticates with Supabase using built-in fetch and never inlines the catalog', async () => {
  const page = await read('src/pages/prices/index.astro');
  assert.match(page, /auth\/v1\/otp/); assert.match(page, /auth\/v1\/verify/); assert.match(page, /functions\/v1\//);
  assert.doesNotMatch(page, /import .*service-tiers\.json/, 'gated data must not be imported into the static page');
  assert.doesNotMatch(page, /@supabase\/supabase-js/, 'the gate uses built-in fetch, not the Supabase SDK');
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.dependencies['@supabase/supabase-js'], undefined, 'no Supabase dependency on the whole site');
});
test('only the prices page and its function talk to Supabase or read the gate variables', async () => {
  const { readdir } = await import('node:fs/promises');
  const offenders = [];
  async function walk(dir) {
    for (const entry of await readdir(new URL(`../${dir}/`, import.meta.url), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) { await walk(path); continue; }
      if (path === 'src/pages/prices/index.astro') continue;
      if (/supabase|PUBLIC_CANONICAL_PRICING_FUNCTION/i.test(await read(path))) offenders.push(path);
    }
  }
  await walk('src');
  assert.deepEqual(offenders, []);
});
test('the tier catalog is the governed three-tier schedule and the function serves exactly it', async () => {
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
  assert.equal(await read('supabase/functions/canonical-prices/catalog.json'), await read('src/data/service-tiers.json'));
  assert.match(await read('supabase/functions/canonical-prices/index.ts'), /import catalog from "\.\/catalog\.json"/);
});
