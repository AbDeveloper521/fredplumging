import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_HOST, SITE_URL } from "@/lib/siteUrl";

/**
 * HOST CANONICALISATION — one site, one address.
 *
 * ⚠️ File naming: this is `proxy.ts`, not `middleware.ts`. Next 16 deprecated
 * and renamed the `middleware` file convention to `proxy` (the exported
 * function is `proxy` too) — see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 *
 * Before this existed, the same site answered on THREE hosts, all HTTP 200:
 *
 *   fredsplumbing.com          ← canonical (apex)
 *   www.fredsplumbing.com      ← duplicate
 *   fredplumging.vercel.app    ← duplicate (the old deployment alias, and
 *                                 note the typo — there is no `b`)
 *
 * Three addresses serving identical HTML is duplicate content: it splits
 * ranking signals and lets a search engine index the address the business
 * does not want on a van. Every non-canonical host is answered with a **308**
 * — permanent, so ranking signal transfers, and method-and-body preserving,
 * unlike a 302.
 *
 * Vercel's own domain settings do NOT currently redirect either host (checked
 * at cutover: all three returned 200). If a platform-level redirect is added
 * later this file becomes belt-and-braces rather than the only mechanism, and
 * it is safe to leave in place — a request that arrives already on the
 * canonical host falls straight through.
 */

/**
 * Hosts that must hand their traffic to the canonical one.
 *
 * Listed EXPLICITLY rather than matched as `*.vercel.app`: Vercel gives every
 * branch and every deployment its own `*.vercel.app` hostname, and blanket
 * -redirecting them would bounce every preview deployment to production —
 * destroying the ability to review a branch before it ships. Only the one
 * production alias is named here.
 *
 * The canonical host itself is NOT typed inline — it comes from `SITE_HOST`
 * (lib/siteUrl.ts), i.e. from `NEXT_PUBLIC_SITE_URL`. Point that env var at a
 * different domain and this redirect follows it.
 */
const LEGACY_HOSTS = new Set([
  "fredplumging.vercel.app",
  `www.${SITE_HOST}`,
]);

export function proxy(request: NextRequest) {
  // `host` carries the address the client actually asked for, including the
  // port in development. Absent on some synthetic requests — nothing to
  // canonicalise then.
  const host = request.headers.get("host");
  if (!host) return NextResponse.next();

  // Compare without the port so `localhost:3000` and a preview host are
  // judged on the hostname alone.
  const hostname = host.split(":")[0].toLowerCase();

  // Local development is never redirected: a dev server bounced to production
  // would make the site impossible to work on.
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return NextResponse.next();
  }

  // Anything not on the explicit list — the canonical host itself, and every
  // branch-preview deployment — is served as-is.
  if (!LEGACY_HOSTS.has(hostname)) return NextResponse.next();

  // Same path, same query string, canonical origin. `request.nextUrl` already
  // carries both, so rewriting only the origin cannot drop a UTM parameter or
  // a deep link.
  const destination = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    SITE_URL,
  );

  return NextResponse.redirect(destination, 308);
}

export const config = {
  /**
   * Matched narrowly so the redirect costs nothing on assets and never gets
   * between a machine and an endpoint it is authenticated against.
   *
   * Excluded:
   *   api        — `/api/revalidate` is the target of a SIGNED Sanity webhook.
   *                A 308 does preserve the POST method and body, but whether
   *                Sanity's delivery agent follows redirects at all (and
   *                forwards the signature header when it does) is not
   *                something to bet the CMS's live updates on. The webhook URL
   *                should be repointed at the real domain in sanity.io/manage
   *                regardless — see WEBHOOK-SETUP.md. `/api/*` is `Disallow`ed
   *                in robots.txt, so leaving it un-canonicalised costs no SEO.
   *   studio     — the embedded Sanity Studio. It is `Disallow`ed in
   *                robots.txt too, so it is not duplicate content and has
   *                nothing to canonicalise. It IS, however, browser-CORS-bound
   *                to whichever origin is registered in sanity.io/manage, and
   *                at cutover only `fredplumging.vercel.app` was registered —
   *                redirecting Studio traffic to an unregistered origin would
   *                lock the owner out of the CMS. Once fredsplumbing.com is
   *                added as a CORS origin this exclusion can be dropped.
   *   _next/*    — build assets and the image optimiser.
   *   file paths — anything with an extension (favicon.ico, sitemap.xml,
   *                robots.txt, /logos/*.png, and the email logo in particular,
   *                which is fetched from inboxes by URLs already sent out).
   */
  matcher: ["/((?!api|studio|_next/static|_next/image|.*\\.[\\w]+$).*)"],
};
