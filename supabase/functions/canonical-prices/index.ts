// Supabase Edge Function: serves the governed service-tier catalog to a
// visitor whose email Supabase Auth has verified (the /prices/ page sends the
// session bearer token). The payload is `catalog.json` beside this file — a
// byte-for-byte copy of `src/data/service-tiers.json`, which is itself synced
// from canonical-cloud/canonical-docs `data/legal/service-tiers.json` by
// `python3 scripts/render_legal_data.py --site-dir`. Never edit either copy by
// hand; `node scripts/sync-prices-function.mjs` refreshes this one and
// `npm test` fails when they differ.
//
// Deploy: supabase functions deploy canonical-prices --no-verify-jwt is NOT
// used; the function verifies the session itself against /auth/v1/user so a
// missing or expired token never reaches the catalog.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import catalog from "./catalog.json" with { type: "json" };

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const ALLOWED_ORIGINS = new Set([
  "https://canonical.plus",
  "https://www.canonical.plus",
  "https://canonical-cloud.github.io",
  "http://localhost:4321",
]);

function cors(origin: string | null): Record<string, string> {
  return {
    "access-control-allow-origin": origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://canonical.plus",
    "access-control-allow-headers": "authorization, apikey, content-type",
    "access-control-allow-methods": "GET, OPTIONS",
    vary: "Origin",
  };
}

function json(status: number, body: unknown, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "content-type": "application/json; charset=utf-8", "cache-control": "no-store, max-age=0" },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json(403, { error: "origin_not_allowed" }, origin);
    return new Response(null, { status: 204, headers: cors(origin) });
  }
  if (req.method !== "GET") return json(405, { error: "method_not_allowed" }, origin);
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json(403, { error: "origin_not_allowed" }, origin);

  const authorization = req.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return json(401, { error: "authentication_required" }, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) return json(503, { error: "auth_verifier_not_configured" }, origin);

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { authorization, apikey: anonKey } });
  if (!userResponse.ok) return json(401, { error: "invalid_or_expired_session" }, origin);
  const user = await userResponse.json();
  if (!user || typeof user.email !== "string" || user.email.length < 3) return json(401, { error: "verified_email_required" }, origin);

  return json(200, catalog, origin);
});
