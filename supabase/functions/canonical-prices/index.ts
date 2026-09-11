import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const ALLOWED_ORIGINS = new Set([
  "https://canonical.plus",
  "https://canonical-cloud.github.io",
  "http://localhost:4321",
]);

const TIERS = {
  schema: "canonical-cloud.service-tier-catalog/v1",
  currency: "USD",
  pricingStatus: "2026 planning/list pricing; signed SOW controls",
  sourceDocument: "canonical-cloud/canonical-docs:docs/legal/external/service-tiers-and-pricing.md",
  tiers: [
    {
      code: "foundation",
      name: "Foundation",
      monthlyFeeUsd: 4000,
      minimumTermMonths: 6,
      frameworkScope: "1 primary framework",
      advisoryHoursPerMonth: 6,
      operatingCadence: "Monthly evidence-health and control-operations review",
      features: [
        "Canonical Compliance Workspace",
        "Control-owner and evidence calendar administration",
        "Monthly evidence freshness and exception review",
        "Monthly risk and remediation working session",
        "Standard exports for customer and independent-evaluator review",
      ],
    },
    {
      code: "growth",
      name: "Growth",
      monthlyFeeUsd: 8000,
      minimumTermMonths: 6,
      frameworkScope: "Up to 2 active frameworks",
      advisoryHoursPerMonth: 12,
      operatingCadence: "Biweekly evidence, remediation, risk, and owner review",
      features: [
        "Everything in Foundation",
        "Quarterly executive security and compliance review",
        "Expanded customer-questionnaire and evaluator coordination",
        "Prioritized connector and evidence-source onboarding",
      ],
    },
    {
      code: "scale",
      name: "Scale",
      monthlyFeeUsd: 12000,
      minimumTermMonths: 12,
      frameworkScope: "Up to 4 active frameworks",
      advisoryHoursPerMonth: 20,
      operatingCadence: "Weekly operating review plus monthly executive/vCISO-style review",
      features: [
        "Everything in Growth",
        "Multi-framework control reuse with framework-specific review",
        "Bounded audit/readiness room coordination",
        "Quarterly operating-model and evidence-quality assessment",
      ],
    },
  ],
};

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
    headers: {
      ...cors(origin),
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
    },
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

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { authorization, apikey: anonKey },
  });
  if (!userResponse.ok) return json(401, { error: "invalid_or_expired_session" }, origin);

  const user = await userResponse.json();
  if (!user || typeof user.email !== "string" || user.email.length < 3) {
    return json(401, { error: "verified_email_required" }, origin);
  }

  return json(200, TIERS, origin);
});
