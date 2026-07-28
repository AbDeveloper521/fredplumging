import "server-only";
import type { QueryParams } from "next-sanity";
import {
  defineLive,
  resolvePerspectiveFromCookies,
  type LivePerspective,
} from "next-sanity/live";
import { cookies, draftMode } from "next/headers";
import { client } from "@/sanity/client";

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `[sanity] Missing required environment variable ${name}. ` +
        `Copy .env.example to .env.local and fill in the values.`,
    );
  }
  return value;
}

const token = requireEnv(
  process.env.SANITY_API_READ_TOKEN,
  "SANITY_API_READ_TOKEN",
);

/**
 * Sanity Live under Cache Components (next-sanity v13; see the repo skill
 * .agents/skills/sanity-live-cache-components/). `sanityFetch` caches via
 * `'use cache'`/`cacheTag` internally; `<SanityLive>` (rendered once, in
 * app/(site)/layout.tsx) holds an EventSource to the Content Lake and
 * revalidates those tags the moment a publish happens — no webhook, no
 * timer. `strict: true` makes `perspective`/`stega` required on every fetch
 * so neither can be silently hardcoded somewhere new.
 */
export const { SanityLive, sanityFetch } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
  strict: true,
});

export interface DynamicFetchOptions {
  perspective: LivePerspective;
  stega: boolean;
}

/**
 * What every ordinary visitor gets: published content, no stega. This app
 * has no draft-mode entry point today, so this is also the only value the
 * fetchers ever receive — but they take it as a parameter (not a hardcode)
 * so Visual Editing can be wired in later without touching them.
 */
export const PUBLISHED_FETCH_OPTIONS: DynamicFetchOptions = {
  perspective: "published",
  stega: false,
};

/**
 * Resolves perspective/stega from draft mode + the preview cookie. Reads
 * `cookies()` (a dynamic API) — only call it inside a Suspense boundary or
 * a route with a sibling loading.tsx, never in a static-shell layout body.
 */
export async function getDynamicFetchOptions(): Promise<DynamicFetchOptions> {
  const { isEnabled: isDraftMode } = await draftMode();
  if (!isDraftMode) {
    return PUBLISHED_FETCH_OPTIONS;
  }
  const jar = await cookies();
  const perspective = await resolvePerspectiveFromCookies({ cookies: jar });
  return { perspective: perspective ?? "drafts", stega: true };
}

/**
 * The one cache boundary all `sanity/lib/get*.ts` fetchers go through.
 *
 * - `'use cache'` here (not in the fetchers) keeps each fetcher's try/catch
 *   OUTSIDE the boundary, so a transient Sanity error is thrown to the
 *   caller's fallback path and never cached.
 * - `tag` keeps the /api/revalidate webhook working: the custom tag is
 *   appended to sanityFetch's own cacheTag() call, so `revalidateTag(_type)`
 *   still lands. Live revalidation via syncTags is automatic on top.
 * - TypeGen typing flows through: `query` keeps its literal type, so `data`
 *   is the generated `*_RESULT` type for that query.
 */
export async function fetchSanityCached<const QueryString extends string>(
  query: QueryString,
  params: QueryParams,
  tag: string | string[],
  { perspective, stega }: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
) {
  "use cache";
  const { data } = await sanityFetch({
    query,
    params,
    perspective,
    stega,
    tags: Array.isArray(tag) ? tag : [tag],
  });
  return data;
}
