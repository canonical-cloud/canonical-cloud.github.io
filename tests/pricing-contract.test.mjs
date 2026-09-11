import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('protected pricing function exposes exactly the three canonical planning tiers', async () => {
  const source = await read('supabase/functions/canonical-prices/index.ts');
  for (const code of ['foundation', 'growth', 'scale']) assert.match(source, new RegExp(`code: "${code}"`));
  for (const price of [4000, 8000, 12000]) assert.match(source, new RegExp(`monthlyFeeUsd: ${price}\\b`));
  assert.match(source, /minimumTermMonths: 6/);
  assert.match(source, /minimumTermMonths: 12/);
  assert.match(source, /auth\/v1\/user/);
  assert.match(source, /Authorization|authorization/);
  assert.match(source, /verified_email_required/);
  assert.match(source, /cache-control/);
  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY|service_role/);
});

test('pricing payload records the private legal source without exposing contract prose', async () => {
  const source = await read('supabase/functions/canonical-prices/index.ts');
  assert.match(source, /canonical-cloud\/canonical-docs:docs\/legal\/external\/service-tiers-and-pricing\.md/);
  assert.doesNotMatch(source, /limitation of liability|indemnif|governing law/i);
});
