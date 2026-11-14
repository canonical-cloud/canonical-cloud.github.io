import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
test('site stays Astro-only with a shared sticky header and footer', async () => {
  const [pkg, header, footer, css] = await Promise.all([read('package.json'), read('src/components/Header.astro'), read('src/components/Footer.astro'), read('src/styles/global.css')]);
  assert.match(pkg, /"astro"/); assert.doesNotMatch(pkg, /jekyll|hugo|react/i);
  assert.match(header, /site-header/); assert.match(footer, /site-footer/); assert.match(css, /position:sticky/);
});
test('public marketing navigation has no Product, login, or account creation actions', async () => {
  const [header, footer, home, about] = await Promise.all([
    read('src/components/Header.astro'),
    read('src/components/Footer.astro'),
    read('src/pages/index.astro'),
    read('src/pages/about/index.astro'),
  ]);
  assert.equal(header.includes('>Product</a>'), false);
  for (const source of [header, footer, home, about]) {
    for (const authPath of ['userUrl', 'orgUrl', 'authUrl']) {
      assert.equal(source.includes('href={site.' + authPath + '}'), false);
    }
    assert.doesNotMatch(source, /<(?:a|button)\b[^>]*>\s*(?:Sign in|Sign up|Log in|Create an account|Create account|User login|Organization login)/i);
  }
  assert.ok(header.includes('href="/people/"'));
  assert.ok(home.includes('https://canonical.plus/quote/'));
});
test('prices is a real route linked from the header, footer, and sitemap', async () => {
  const [header, footer, sitemap] = await Promise.all([read('src/components/Header.astro'), read('src/components/Footer.astro'), read('public/sitemap.xml')]);
  assert.match(header, /href="\/prices\/"/); assert.match(footer, /href="\/prices\/"/); assert.match(sitemap, /\/prices\/<\/loc>/);
});
test('people is a real route linked from the header, footer, and sitemap', async () => {
  const [people, header, footer, sitemap] = await Promise.all([read('src/pages/people/index.astro'), read('src/components/Header.astro'), read('src/components/Footer.astro'), read('public/sitemap.xml')]);
  assert.match(header, /href="\/people\/"/); assert.match(footer, /href="\/people\/"/); assert.match(sitemap, /\/people\/<\/loc>/);
  assert.match(people, /Sam Stone/); assert.match(people, /Accounts & Sales/);
  assert.match(people, /Cody Dyson/); assert.match(people, /Sales Engineer/);
  assert.match(people, /Rebecca Toni/);
  assert.match(people, /Georgiana Fabrecce/);
  assert.match(people, /Utkarsh Shukla/);
  assert.match(people, /Infosec Expert/);
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

test('Pages deployment permits only safe unconfigured pricing and the gate is hidden server-side', async () => {
  const [workflow, prices] = await Promise.all([
    read('.github/workflows/pages.yml'),
    read('src/pages/prices/index.astro'),
  ]);
  assert.ok(workflow.includes('publishing marketing pages with pricing access disabled'));
  assert.ok(workflow.includes('Pricing configuration must include both'));
  assert.ok(workflow.includes('CANONICAL_SUPABASE_URL must be an approved'));
  assert.ok(workflow.includes('sb_secret_*|*service_role*'));
  assert.ok(prices.includes('id="configuration-error" class="gate-message error" hidden={configured}'));
  assert.ok(prices.includes('id="email-form" class="gate-card" hidden={!configured}'));
  assert.ok(prices.includes('if (!configured)'));
  assert.ok(prices.includes('emailForm.hidden = true'));
});


test('role landing pages are real Astro routes with one authoritative persona catalog', async () => {
  const [data, hub, detail, header, footer, home, sitemap] = await Promise.all([
    read('src/data/roles.ts'),
    read('src/pages/roles/index.astro'),
    read('src/pages/roles/[slug]/index.astro'),
    read('src/components/Header.astro'),
    read('src/components/Footer.astro'),
    read('src/pages/index.astro'),
    read('public/sitemap.xml'),
  ]);
  for (const slug of ['ceo', 'coo', 'cfo', 'cto', 'cro', 'security']) {
    assert.ok(data.includes(`slug: '${slug}'`), `missing persona ${slug}`);
    assert.ok(sitemap.includes(`/roles/${slug}/</loc>`), `missing indexed persona ${slug}`);
    assert.ok(home.includes(`href="/roles/${slug}/"`), `homepage missing persona ${slug}`);
  }
  assert.match(detail, /getStaticPaths/);
  assert.match(detail, /roles\.map/);
  assert.match(detail, /role\.priorities\.map/);
  assert.match(detail, /role\.cloud\.bullets\.map/);
  assert.match(detail, /role\.plus\.bullets\.map/);
  assert.match(detail, /role\.steps\.map/);
  assert.match(detail, /role\.question/);
  assert.match(hub, /role-grid/);
  assert.match(header, /href="\/roles\/"/);
  assert.match(footer, /href="\/roles\/"/);
  assert.match(sitemap, /\/roles\/<\/loc>/);
});

test('role positioning distinguishes operational visibility from readiness and independent assurance', async () => {
  const [hub, detail, data] = await Promise.all([
    read('src/pages/roles/index.astro'),
    read('src/pages/roles/[slug]/index.astro'),
    read('src/data/roles.ts'),
  ]);
  for (const source of [hub, detail]) {
    assert.match(source, /site\.readinessUrl/);
    assert.match(source, /Canonical Cloud/);
    assert.match(source, /Canonical Plus/);
    assert.match(source, /independent/i);
    assert.doesNotMatch(source, /href=\{site\.(?:authUrl|userUrl|orgUrl)\}/);
  }
  assert.match(data, /enterprise/i);
  assert.match(data, /evidence/i);
  assert.match(data, /remediation/i);
  assert.doesNotMatch(data, /guaranteed certification|guaranteed sales growth/i);
});

test('all six personas have complete, unique, specific copy and valid related links', async () => {
  const ts = (await import('typescript')).default;
  const source = await read('src/data/roles.ts');
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const { roles, roleSlugs, roleBySlug } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
  assert.deepEqual(roleSlugs, ['ceo', 'coo', 'cfo', 'cto', 'cro', 'security']);
  assert.equal(roles.length, roleSlugs.length);
  assert.equal(roleBySlug.size, roles.length);
  assert.equal(new Set(roles.map((role) => role.slug)).size, roles.length);
  assert.equal(new Set(roles.map((role) => role.headline)).size, roles.length);
  assert.equal(new Set(roles.map((role) => role.seoDescription)).size, roles.length);
  assert.equal(new Set(roles.map((role) => role.consultationLabel)).size, roles.length);
  for (const role of roles) {
    assert.ok(roleSlugs.includes(role.slug), role.slug);
    assert.match(role.slug, /^[a-z]+$/);
    assert.ok(role.seoDescription.length >= 90 && role.seoDescription.length <= 160, `SEO description length for ${role.slug}`);
    for (const field of ['label', 'audience', 'headline', 'summary', 'problem', 'trigger', 'question', 'answer', 'consultationLabel']) {
      assert.ok(role[field].trim().length > 15 || field === 'label', `missing ${field}: ${role.slug}`);
    }
    assert.equal(role.priorities.length, 3);
    assert.equal(role.steps.length, 3);
    for (const offer of [role.cloud, role.plus]) {
      assert.ok(offer.headline.length > 10 && offer.summary.length > 40);
      assert.equal(offer.bullets.length, 3);
      assert.equal(new Set(offer.bullets).size, 3);
    }
    assert.equal(role.relatedSlugs.length, 3);
    assert.equal(new Set(role.relatedSlugs).size, 3);
    assert.ok(role.relatedSlugs.every((slug) => slug !== role.slug && roleBySlug.has(slug)));
    assert.doesNotMatch(role.headline + role.summary + role.answer, /guaranteed (?:audit|certification|deal)/i);
  }
  assert.doesNotMatch(roleBySlug.get('ceo').question, /SOC 2 certified/i);
  assert.match(roleBySlug.get('ceo').answer, /independent CPA firm/);
  assert.match(roleBySlug.get('cfo').answer, /verification is configured/);
  assert.match(roleBySlug.get('cfo').answer, /email delivery may be unavailable/);
});

test('role UX uses clear accessible cards, genuine consultation links, and transparent estimate boundaries', async () => {
  const [hub, detail, site, css] = await Promise.all([
    read('src/pages/roles/index.astro'),
    read('src/pages/roles/[slug]/index.astro'),
    read('src/data/site.ts'),
    read('src/styles/global.css'),
  ]);
  assert.match(hub, /aria-labelledby/);
  assert.match(hub, /aria-describedby/);
  assert.match(hub, /role-\$\{role\.slug\}-title/);
  assert.match(hub, /role-\$\{role\.slug\}-problem/);
  assert.match(detail, /role\.relatedSlugs\.map/);
  assert.doesNotMatch(detail, /roles\.filter\(\(item\)/);
  assert.match(detail, /description=\{role\.seoDescription\}/);
  for (const source of [hub, detail]) {
    assert.match(source, /site\.consultationUrl/);
    assert.match(source, /site\.quoteUrl/);
    assert.match(source, /role-cta-note/);
    assert.match(source, /email delivery may be unavailable/i);
    assert.doesNotMatch(source, /href=\{site\.(?:authUrl|userUrl|orgUrl)\}/);
  }
  assert.match(site, /calendly\.com\/hello-canonical\/30min/);
  assert.match(css, /scroll-margin-top:6rem/);
  assert.match(css, /role-card:focus-visible/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(detail, /role\.slug === 'cfo'/);
});
