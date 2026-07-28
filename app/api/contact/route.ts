import { NextResponse, type NextRequest } from "next/server";
import { leadSchema } from "@/lib/validations";
import { deliverLead } from "@/lib/leadDelivery";

/**
 * Lead capture endpoint for every form on the site. Public, so nothing the
 * client sends is trusted: the payload is re-validated with the same zod
 * schemas the forms use, spam is filtered without a CAPTCHA (honeypot +
 * timing + rate limit), and submitted values are never echoed back.
 */
// Runs on the Node.js runtime — that is Next 16's default for route
// handlers, and the `runtime` segment-config export is rejected by the
// compiler under Cache Components, so it is deliberately not exported.

/**
 * Best-effort per-IP rate limit. Honest caveat: this Map lives in one
 * serverless instance's memory — it resets on every cold start and is not
 * shared across concurrent instances on Vercel. It is a speed bump against
 * naive floods, not real protection; anything stronger needs an external
 * store or the platform's WAF rules.
 */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // unbounded-growth guard
  return recent.length > RATE_MAX;
}

/** Minimum plausible time between page load and a human submitting a form. */
const MIN_ELAPSED_MS = 3000;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { message: "Too many requests — please call us instead." },
      { status: 429 },
    );
  }

  const { website, elapsedMs, source, ...fields } = body;

  // Honeypot filled or submitted faster than a human can type: pretend it
  // worked so a bot learns nothing, and deliver nothing.
  const looksLikeBot =
    (typeof website === "string" && website.trim() !== "") ||
    (typeof elapsedMs === "number" && elapsedMs < MIN_ELAPSED_MS);
  if (looksLikeBot) {
    return NextResponse.json({ ok: true });
  }

  const parsed = leadSchema.safeParse(fields);
  if (!parsed.success) {
    // Field names only — never the submitted values.
    return NextResponse.json(
      {
        message: "Some fields are missing or invalid.",
        fields: parsed.error.issues.map((issue) => issue.path.join(".")),
      },
      { status: 422 },
    );
  }

  try {
    await deliverLead({
      source: typeof source === "string" ? source : "website-form",
      fields: Object.fromEntries(
        Object.entries(parsed.data).map(([key, value]) => [
          key,
          String(value ?? ""),
        ]),
      ),
    });
  } catch {
    return NextResponse.json(
      { message: "We couldn't send your request — please call us." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
