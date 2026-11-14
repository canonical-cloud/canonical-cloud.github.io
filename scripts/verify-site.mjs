import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const roles = ['ceo', 'coo', 'cfo', 'cto', 'cro', 'security'];
const required = ['index.html', 'product/index.html', 'prices/index.html', 'trust/index.html', 'about/index.html', 'roles/index.html', ...roles.map((slug) => `roles/${slug}/index.html`)];
for (const route of required) { await stat(join(root, 'dist', route)); }
const home = await readFile(join(root, 'dist/index.html'), 'utf8');
for (const marker of ['Canonical Cloud', '<header', '<footer', 'Built with Astro', 'Explore Canonical Plus']) {
  if (!home.includes(marker)) throw new Error(`missing built marker: ${marker}`);
}
if (!home.includes('href="/prices/"')) throw new Error('home navigation does not expose the standalone /prices/ route');
if (!home.includes('href="/roles/"')) throw new Error('home navigation does not expose the role index');
for (const slug of roles) {
  if (!home.includes(`href="/roles/${slug}/"`)) throw new Error(`homepage missing role: ${slug}`);
}
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

const roleIndex = await readFile(join(root, 'dist/roles/index.html'), 'utf8');
for (const slug of roles) {
  const roleHtml = await readFile(join(root, 'dist', 'roles', slug, 'index.html'), 'utf8');
  for (const marker of ['<h1', 'Canonical Cloud', 'Canonical Plus', 'independent', 'https://canonical.plus/quote/']) {
    if (!roleHtml.includes(marker)) throw new Error(`role ${slug} missing required content: ${marker}`);
  }
  if (!roleHtml.includes(`https://canonical-cloud.github.io/roles/${slug}/`)) {
    throw new Error(`role ${slug} missing canonical URL`);
  }
  if (!roleIndex.includes(`href="/roles/${slug}/"`)) throw new Error(`role index missing ${slug}`);
  if (roleHtml.includes('href="https://auth.canonical-cloud.github.io/"')) throw new Error(`role ${slug} exposes login`);
  if (!roleHtml.includes('href="https://calendly.com/hello-canonical/30min"')) {
    throw new Error(`role ${slug} has no booking CTA`);
  }
  if (!roleHtml.includes('href="https://canonical.plus/quote/"')) {
    throw new Error(`role ${slug} has no estimator CTA`);
  }
  if (!roleHtml.includes('email delivery may be unavailable')) {
    throw new Error(`role ${slug} is missing estimator availability disclosure`);
  }
}
// Validate actual rendered routes and navigation, not only source-code strings.
const builtPages = [['/', home], ['/roles/', roleIndex]];
for (const slug of roles) {
  builtPages.push([`/roles/${slug}/`, await readFile(join(root, 'dist', 'roles', slug, 'index.html'), 'utf8')]);
}
const seenDescriptions = new Set();
for (const [pagePath, html] of builtPages) {
  const headings = [...html.matchAll(/<h1(?:\s|>)/g)];
  if (headings.length !== 1) throw new Error(`${pagePath} must have exactly one h1, found ${headings.length}`);
  const canonical = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
  if (canonical.length !== 1 || canonical[0][1] !== `https://canonical-cloud.github.io${pagePath}`) {
    throw new Error(`${pagePath} has incorrect/duplicate canonical metadata`);
  }
  const description = [...html.matchAll(/<meta name="description" content="([^"]+)"/g)];
  if (description.length !== 1 || description[0][1].length < 70 || description[0][1].length > 165) {
    throw new Error(`${pagePath} must have one useful meta description`);
  }
  if (seenDescriptions.has(description[0][1])) throw new Error(`${pagePath} repeats a meta description`);
  seenDescriptions.add(description[0][1]);
  if (!html.includes(`<meta property="og:url" content="${canonical[0][1]}"`)) {
    throw new Error(`${pagePath} OpenGraph URL does not match canonical`);
  }
  if (/<meta[^>]*name="robots"[^>]*noindex/i.test(html)) throw new Error(`${pagePath} is accidentally noindex`);
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    const target = new URL(href, `https://canonical-cloud.github.io${pagePath}`);
    const internalFile = join(root, 'dist', target.pathname.replace(/^\/+/, ''), 'index.html');
    let targetHtml;
    try { targetHtml = await readFile(internalFile, 'utf8'); }
    catch { throw new Error(`${pagePath} contains broken internal link: ${href}`); }
    if (target.hash) {
      const anchor = decodeURIComponent(target.hash.slice(1));
      if (!targetHtml.includes(`id="${anchor}"`)) throw new Error(`${pagePath} contains broken fragment link: ${href}`);
    }
  }
}
for (const slug of roles) {
  const html = builtPages.find(([path]) => path === `/roles/${slug}/`)[1];
  if (!html.includes('aria-current="page"')) throw new Error(`missing current breadcrumb in ${slug}`);
}
console.log('Verified Astro routes, all role pages, accessible links, canonical metadata, CTAs, pricing OTP gate, and no static price leakage.');
