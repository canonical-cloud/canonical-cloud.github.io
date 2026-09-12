#!/usr/bin/env node
// Keeps the Edge Function's catalog payload byte-identical to the synced
// governed catalog. `--check` fails instead of writing (used by `npm test`).
import { readFile, writeFile } from 'node:fs/promises';

const source = new URL('../src/data/service-tiers.json', import.meta.url);
const target = new URL('../supabase/functions/canonical-prices/catalog.json', import.meta.url);
const check = process.argv.includes('--check');
const wanted = await readFile(source, 'utf8');
const current = await readFile(target, 'utf8').catch(() => '');
if (wanted === current) { console.log('prices function catalog is current'); process.exit(0); }
if (check) { console.error('supabase/functions/canonical-prices/catalog.json is stale; run node scripts/sync-prices-function.mjs'); process.exit(1); }
await writeFile(target, wanted);
console.log('prices function catalog refreshed');
