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

`/prices/` is a real route, not an anchor. It renders the three service tiers,
their bundled Statement of Work packages, and the support-target table from
`src/data/service-tiers.json`. That file is a synced copy of the governed
catalog in `canonical-cloud/canonical-docs` (`data/legal/service-tiers.json`),
which is also what the legal corpus renders its SLA, support addendum, and
pricing schedule from. Do not edit it here; change the catalog in
`canonical-docs` and run

```sh
python3 scripts/render_legal_data.py --site-dir ../canonical-cloud.github.io
```

from that repository, then commit the refreshed copy here.

### Access gate

The page asks for a work email, sends a one-time code through Supabase Auth
(`POST /auth/v1/otp`, using the browser's built-in `fetch` — no Supabase SDK
and no dependency on the rest of the site), and unlocks when the visitor
enters the code. The accepted code is the build-time `PUBLIC_PRICES_OTP`; a
code issued by Supabase itself is also accepted when Supabase is configured,
which is the upgrade path to real verification.

This is a **soft gate**: the code is inlined into the `/prices/` bundle, so it
deters casual browsing and captures a lead — it is not access control. Do not
put anything on the page that must stay private.

Only `src/pages/prices/index.astro` reads these variables or talks to
Supabase; `npm test` fails if any other source file does, and
`scripts/verify-site.mjs` fails if the built home page references them.

| Variable | Where it is set | Purpose |
| --- | --- | --- |
| `PUBLIC_CANONICAL_SUPABASE_URL` | GitHub repository **variable** `CANONICAL_SUPABASE_URL` | Supabase project URL (public) |
| `PUBLIC_CANONICAL_SUPABASE_PUBLISHABLE_KEY` | GitHub repository **variable** `CANONICAL_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (public by design) |
| `PUBLIC_PRICES_OTP` | GitHub repository **secret** `PRICES_OTP` | The accepted one-time code; kept out of the repo and logs |

The variable names follow the organization standard in
`canonical-cloud/.github/LEGAL_GOVERNANCE.md`. Both workflows (`.github/workflows/ci.yml`, `.github/workflows/pages.yml`)
pass them to `npm run build`, where Astro inlines `import.meta.env.PUBLIC_*`
into the page. Locally, copy `.env.example` to `.env`. When the variables are
absent the page still builds and tells the visitor the gate is not configured.

Supabase side: enable the Email provider, set the "Magic Link" / OTP email
template to include `{{ .Token }}` so the message carries a code, and either
use the built-in mailer for testing or configure custom SMTP for volume. Each
email that requests a code becomes an auth user in the project, which is the
lead record.
