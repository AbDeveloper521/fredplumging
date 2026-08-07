/**
 * THE canonical public origin of this site — the one value `metadataBase`,
 * every canonical tag, the Open Graph URLs, `sitemap.xml`, `robots.txt` and
 * the JSON-LD `url` fields are built from.
 *
 * Deliberately environment-driven and NOT editable in Sanity: which domain
 * serves the site is a deployment fact, not editorial copy, and a stale CMS
 * value would silently publish canonicals pointing at the wrong host. Set
 * `NEXT_PUBLIC_SITE_URL` on the host to the origin that actually resolves —
 * see .env.example.
 *
 * ⚠️  A canonical pointing at a domain that does not resolve yet HURTS
 * indexing. While the site is served from the Vercel preview URL, set
 * `NEXT_PUBLIC_SITE_URL` to that preview origin, and switch it to
 * https://fredsplumbing.com at DNS cutover.
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
