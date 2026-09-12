# `/prices/` authentication and pricing-data boundary

The public Astro site remains static. The `/prices/` route therefore does **not** embed the price catalog in generated HTML or JavaScript.

## Flow

1. Visitor enters an email address on `/prices/`.
2. The browser calls Supabase Auth `/auth/v1/otp` using the project **publishable** key.
3. The visitor enters the emailed OTP. The browser verifies it with `/auth/v1/verify`.
4. The access token is kept in memory only; the page does not persist it to localStorage/sessionStorage.
5. The browser calls the `canonical-prices` Supabase Edge Function with `Authorization: Bearer <user JWT>` and the publishable key in `apikey`.
6. The Edge Function validates the caller against `/auth/v1/user` before returning the catalog.

The Edge Function is the price-data boundary. A hardcoded client-side OTP would only hide the DOM, not the static source, so it is intentionally not used as a production security mechanism.

## Required GitHub Actions repository variables

The Pages workflow consumes these repository **variables**:

- `CANONICAL_SUPABASE_URL` — approved Supabase project URL.
- `CANONICAL_SUPABASE_PUBLISHABLE_KEY` — `sb_publishable_...` preferred; a legacy anon key is accepted for migration compatibility.

The workflow maps them to Astro's public build variables:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `PUBLIC_CANONICAL_PRICING_FUNCTION=canonical-prices`

A Supabase `sb_secret_...` key or service-role key must never be exposed to GitHub Pages. The workflow rejects obvious secret/service-role shapes before building.

The GitHub integration used to prepare this PR cannot mutate repository Actions variables, so the deployment workflow intentionally fails closed until an authorized repository administrator supplies the two public variables. This is a configuration gate, not a reason to commit a secret or bypass the gate.

## Supabase project configuration

The Auth email template must contain the OTP token variable so passwordless email sends a code rather than only a magic link. Use a production SMTP provider before relying on the flow for public traffic and keep Auth rate limits/abuse controls enabled.

`canonical-prices` permits only the Canonical origins declared in the function and returns `Cache-Control: private, no-store`. It validates the bearer session before returning the catalog.

## Verification

`npm run build` runs `scripts/verify-site.mjs`, which proves:

- `/prices/index.html` exists;
- OTP send and verify endpoints are wired;
- the authenticated function call is wired;
- the public navigation exposes a real `/prices/` route; and
- the generated static HTML does not contain the three gated dollar amounts.

A complete production verification additionally requires an approved Supabase Auth project/email-template configuration and a real email OTP/browser flow after the repository variables are installed.

## Catalog source

The function's payload (`supabase/functions/canonical-prices/catalog.json`) is a
byte-for-byte copy of `src/data/service-tiers.json`, which is synced from the
governed catalog in `canonical-cloud/canonical-docs` (`data/legal/service-tiers.json`
— TypeSpec + JSON Schema peer authorities under `contracts/`). Tiers, prices,
terms, support targets and bundled SOW packages change there and only there;
`node scripts/sync-prices-function.mjs --check` (part of `npm test`) proves the
function payload is current, and the page rejects any response that is not a
three-tier catalog with `schemaVersion`.
