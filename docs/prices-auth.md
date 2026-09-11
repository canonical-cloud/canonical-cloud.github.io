# `/prices/` authentication and deployment configuration

The prices page is a real Astro route (`/prices/`), not a hash/anchor on the
home page. The static route ships the email/OTP UI but **does not ship the
service-tier payload**. Tier data is returned only after Supabase Auth verifies
an email session and the authenticated `canonical-prices` Edge Function accepts
the bearer token.

## Architecture

```text
browser /prices/
  -> POST <Supabase>/auth/v1/otp
  -> user enters email OTP
  -> POST <Supabase>/auth/v1/verify
  -> session access token
  -> GET <Supabase>/functions/v1/canonical-prices
       Authorization: Bearer <session token>
  -> three-tier pricing payload
```

The main page does not import a Supabase SDK or make Supabase requests. The
prices page uses built-in browser `fetch`, so there is no page-specific package
dependency to leak into the general site bundle.

## GitHub Actions repository variables

Configure these **Actions variables** on `canonical-cloud/canonical-cloud.github.io`:

| Variable | Value |
| --- | --- |
| `CANONICAL_SUPABASE_URL` | Supabase project API URL |
| `CANONICAL_SUPABASE_PUBLISHABLE_KEY` | Browser-safe Supabase publishable key (`sb_publishable_...`) |
| `CANONICAL_PRICES_FUNCTION_URL` | `<SUPABASE_URL>/functions/v1/canonical-prices` |

The Pages workflow maps them to Astro's public build variables:

- `PUBLIC_CANONICAL_SUPABASE_URL`
- `PUBLIC_CANONICAL_SUPABASE_PUBLISHABLE_KEY`
- `PUBLIC_CANONICAL_PRICES_FUNCTION_URL`

A publishable key is intentionally public and belongs in a repository/environment
**variable**, not a secret. Never expose a Supabase `service_role` or secret key
to Astro `PUBLIC_*` variables, page source, browser storage, logs, or GitHub
Pages artifacts.

## Email OTP template

Supabase Auth must send a one-time code rather than relying only on a magic-link
button. Configure the project's email template to include the Supabase token
placeholder (`{{ .Token }}`). Test both request and verification flows before
publishing the pricing link broadly.

The default Supabase email provider is appropriate only for low-volume testing.
Use an approved custom SMTP provider before treating the gate as production
sales infrastructure.

## Function boundary

The deployed `canonical-prices` Edge Function performs its own authentication
check so CORS preflight can remain usable. It:

- permits only the Canonical production/GitHub Pages origins plus localhost for
  development;
- requires an `Authorization: Bearer ...` session on the data request;
- verifies that token with Supabase Auth before returning pricing;
- requires a verified session carrying an email;
- sends `Cache-Control: no-store`; and
- returns no credential material.

Keep the Edge Function tier payload in parity with
`canonical-cloud/canonical-docs/contracts/service-tiers/instances/ServiceTierCatalog/valid/catalog.json`.
The legal/SOW Markdown and the website are projections; a signed SOW controls.

## Local development

Set the three `PUBLIC_*` values in the local process environment before running
`npm run dev`. Do not commit a `.env` file containing secret credentials.

## Security boundary

Email possession is a lightweight commercial-content gate, not identity proof
for privileged customer operations. Do not use this pricing session to grant
access to customer workspaces, evidence, audit records, billing data, or
administrative functions.
