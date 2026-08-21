/**
 * THE canonical public origin of this site — the one value `metadataBase`,
 * every canonical tag, the Open Graph URLs, `sitemap.xml`, `robots.txt`, the
 * JSON-LD `url` fields and the absolute URLs in outbound email are built
 * from.
 *
 * Deliberately environment-driven and NOT editable in Sanity: which domain
 * serves the site is a deployment fact, not editorial copy, and a stale CMS
 * value would silently publish canonicals pointing at the wrong host. Set
 * `NEXT_PUBLIC_SITE_URL` on the host to the origin that actually resolves —
 * see .env.example.
 *
 * As of the domain cutover, https://fredsplumbing.com IS live and serving,
 * so the default below is the real canonical rather than a placeholder: an
 * unset `NEXT_PUBLIC_SITE_URL` now falls back to a domain that resolves.
 * The apex is canonical — `www.` and the old `fredplumging.vercel.app`
 * deployment alias are 308-redirected here by `proxy.ts`.
 */
const DEFAULT_SITE_URL = "https://fredsplumbing.com";

/** No trailing slash — every caller concatenates a leading-slash path. */
function normalise(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

const configured = process.env.NEXT_PUBLIC_SITE_URL;

export const SITE_URL = normalise(
  configured && configured.trim() !== "" ? configured : DEFAULT_SITE_URL,
);

/**
 * Just the hostname of `SITE_URL` (e.g. "fredsplumbing.com"), for comparing
 * against an incoming request's `host` header — which carries no scheme.
 *
 * Exists so `proxy.ts` can canonicalise the host WITHOUT typing the domain
 * inline: there is one place the canonical domain is configured, and the
 * redirect that enforces it reads from that same place.
 */
export const SITE_HOST = new URL(SITE_URL).host;
