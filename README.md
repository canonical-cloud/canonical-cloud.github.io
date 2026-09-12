# Canonical Cloud

Astro-only public marketing site for [canonical-cloud](https://github.com/canonical-cloud).

## Development

```sh
npm ci --ignore-scripts
npm test
npm run build
```

The static site keeps public marketing separate from the user, organization, and Shared Auth surfaces.

## Pricing page (`/prices/`)

`/prices/` is a real route, not an anchor. The static page ships only the
email/one-time-code gate; the tier catalog is returned by the authenticated
`canonical-prices` Supabase Edge Function after Supabase Auth verifies the
visitor's email (`docs/prices-auth.md` has the flow and the GitHub Actions
variable boundary). Both the page and the function use built-in `fetch` — no
Supabase SDK anywhere on the site.

The catalog the function serves is governed data, not prose:
`src/data/service-tiers.json` is a synced copy of
`canonical-cloud/canonical-docs` → `data/legal/service-tiers.json`, the same
file the legal corpus renders its pricing schedule, SLA/support tables and SOW
package menu from. Refresh it from that repository with

```sh
python3 scripts/render_legal_data.py --site-dir ../canonical-cloud.github.io
node scripts/sync-prices-function.mjs   # copies it into the function payload
```

`npm test` fails if the function payload drifts from the synced copy, if the
static page imports the catalog, or if any page other than `/prices/` talks to
Supabase; `scripts/verify-site.mjs` fails if a tier price appears in the built
HTML. Deploy the function with the Supabase CLI after every catalog change.
