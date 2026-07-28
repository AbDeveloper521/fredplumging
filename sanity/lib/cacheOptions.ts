import "server-only";

/**
 * Single source of truth for how Sanity fetches are cached.
 *
 * The two environments deliberately differ:
 * - In development the owner is watching the screen and wants a publish to
 *   show up on the very next refresh, so nothing is cached at all.
 * - In production every response is cached and tagged; the /api/revalidate
 *   webhook invalidates the matching tag the moment something is published,
 *   and the `revalidate` window below is the safety net for a missing or
 *   broken webhook.
 *
 * The safety net is 60 seconds, and it is worth being honest about what
 * that buys. Time-based revalidation is stale-while-revalidate: once the
 * window expires, the NEXT visitor still receives the old page while a
 * fresh one builds in the background, and the visitor after that sees the
 * new content. So 60 seconds means "fresh within about a minute, PLUS one
 * page load" — a safety net, not instant. What it costs: at most one
 * Sanity query per cache tag per minute across the whole site, which for a
 * brochure site of this size is negligible but is not zero — a deliberate
 * trade against the previous 24-hour window, which made a missing webhook
 * look like "the site never updates".
 *
 * Option spelling verified against the local Next 16 docs
 * (node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md):
 * `cache: "no-store"` and `next.revalidate` are mutually exclusive on one
 * fetch — supplying both makes Next ignore both — so dev uses only
 * `cache: "no-store"`. Tags stay attached in both modes: a tag on an
 * uncached fetch is harmless, and dropping it would break production
 * webhook revalidation.
 */
export function sanityFetchOptions(
  tag: string | string[],
  { revalidate = 60 }: { revalidate?: number } = {},
): { cache?: RequestCache; next: { revalidate?: number; tags: string[] } } {
  const tags = Array.isArray(tag) ? tag : [tag];
  if (process.env.NODE_ENV === "development") {
    return { cache: "no-store", next: { tags } };
  }
  return { next: { revalidate, tags } };
}
