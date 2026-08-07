import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { resolvePhoto } from "@/sanity/lib/image";
import { LEGAL_PAGE_QUERY } from "@/sanity/queries";
import type { LEGAL_PAGE_QUERY_RESULT } from "@/sanity.types";
import type { RichBody } from "@/data/services";
import {
  legalPages,
  type LegalContactCard,
  type LegalPageContent,
  type LegalSlug,
} from "@/data/legalPages";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const LEGAL_PAGE_TAG = "legalPage";

function toContact(
  raw: NonNullable<LEGAL_PAGE_QUERY_RESULT>["contact"],
): LegalContactCard | undefined {
  if (!raw?.name && !raw?.phoneDisplay && !raw?.website) return undefined;
  return {
    name: raw.name ?? "",
    phoneDisplay: raw.phoneDisplay ?? "",
    website: raw.website ?? "",
  };
}

/**
 * One legal document by slug. The static entry in `data/legalPages.ts` is the
 * fallback and carries the client's verbatim copy, so both pages render
 * correctly before Sanity is ever seeded:
 *
 * - Thrown fetch → the static document (loud).
 * - Successful fetch, no document yet → the static document, quieter note.
 * - Published document → its fields win, each falling back to the static
 *   value when empty. An empty `body` falls back rather than rendering a
 *   blank legal page: a legal document with no text is never intentional.
 */
export async function getLegalPage(
  slug: LegalSlug,
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<LegalPageContent> {
  const fb = legalPages[slug];

  let result: LEGAL_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      LEGAL_PAGE_QUERY,
      { slug },
      LEGAL_PAGE_TAG,
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: `getLegalPage(${slug})`,
      fallbackFile: "data/legalPages.ts",
      affects: `/${slug} — the document text`,
      error,
    });
    return fb;
  }

  if (!result) {
    // Expected until the document is first published — not an error.
    console.warn(
      `[sanity] legalPage "${slug}" not published yet — /${slug} renders the verbatim copy from data/legalPages.ts.`,
    );
    return fb;
  }

  const body = result.body?.length ? (result.body as RichBody) : undefined;
  if (!body) {
    console.warn(
      `[sanity] legalPage "${slug}" has no document text — /${slug} renders the ` +
        "verbatim copy from data/legalPages.ts. Run scripts/seed-legal-pages.ts, " +
        "or paste the text into the document in /studio and publish.",
    );
  }

  const intro = result.intro?.filter(
    (paragraph): paragraph is string =>
      typeof paragraph === "string" && paragraph.trim() !== "",
  );

  return {
    slug,
    title: result.title ?? fb.title,
    eyebrow: result.eyebrow ?? fb.eyebrow,
    intro: intro?.length ? intro : fb.intro,
    body: body ?? fb.body,
    contact: toContact(result.contact) ?? fb.contact,
    bannerPhoto: resolvePhoto(
      result.bannerPhoto,
      2400,
      `legalPage "${slug}" → Banner background photo`,
      16 / 9,
    ),
    // Absent means on — only an explicit Studio opt-out drops the gradient.
    darkOverlay: result.darkOverlay !== false,
    lastUpdated: result.lastUpdated ?? undefined,
    seoTitle: result.seoTitle ?? fb.seoTitle,
    seoDescription: result.seoDescription ?? fb.seoDescription,
  };
}
