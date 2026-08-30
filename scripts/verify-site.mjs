import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const required = ['index.html', 'product/index.html', 'trust/index.html', 'about/index.html'];
for (const route of required) { await stat(join(root, 'dist', route)); }
const home = await readFile(join(root, 'dist/index.html'), 'utf8');
for (const marker of ['Canonical Cloud', '<header', '<footer', 'Log in', 'Sign up', 'Built with Astro']) {
  if (!home.includes(marker)) throw new Error(`missing built marker: ${marker}`);
}
if (/jekyll|hugo/i.test(home)) throw new Error('legacy generator marker found in built site');
console.log('Verified Astro routes, navigation, access links, and footer.');
