import "server-only";

/**
 * Single source of truth for how Sanity fetches are cached.
 *
 * The two environments deliberately differ:
 * - In development the owner is watching the screen and wants a publish to
 *   show up on the very next refresh, so nothing is cached at all.
 * - In production an uncached fetch would mean a Sanity API call for every
 *   visitor; instead responses are cached long-term and the /api/revalidate
 *   webhook invalidates the matching tag the moment something is published.
 *   The `revalidate` window is only a backstop for a broken webhook.
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
  { revalidate = 86400 }: { revalidate?: number } = {},
): { cache?: RequestCache; next: { revalidate?: number; tags: string[] } } {
  const tags = Array.isArray(tag) ? tag : [tag];
  if (process.env.NODE_ENV === "development") {
    return { cache: "no-store", next: { tags } };
  }
  return { next: { revalidate, tags } };
}
