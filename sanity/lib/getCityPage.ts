import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logEmpty, logFallback } from "@/sanity/lib/fallbackLog";
import { toCitySections } from "@/sanity/lib/citySections";
import { CITY_PAGE_QUERY } from "@/sanity/queries";
import type { CITY_PAGE_QUERY_RESULT } from "@/sanity.types";
import { cities, cityHref, type CityPageContent } from "@/data/cities";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const CITY_PAGE_TAG = "cityPage";

/**
 * One city page's section stack by slug — the slug-keyed analog of the
 * singleton stack fetchers (`getCareersPage` etc.):
 *
 * - Thrown fetch → the static entry from `data/cities.ts` (loud).
 * - Successful fetch, document not published yet → the static entry with a
 *   quieter note. A slug with no document AND no static entry → null, and
 *   the route 404s.
 * - Document without a `sections` array → the static stack, with a pointer
 *   at the migration script (old-shape document, or a fresh empty one).
 * - Published stack → mapped by `toCitySections`; when every item is hidden
 *   that is a deliberate owner choice and the page renders no bands rather
 *   than resurrecting the default stack over their intent.
 *
 * No per-field default fill across cities: an emptied field degrades or
 * drops its band — the fallback stack only ever serves whole (doorway-page
 * rule: never another city's words).
 */
export async function getCityPage(
  slug: string,
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<CityPageContent | null> {
  const fb = cities.find((city) => city.slug === slug);

  let result: CITY_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      CITY_PAGE_QUERY,
      { slug },
      CITY_PAGE_TAG,
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: `getCityPage(${slug})`,
      fallbackFile: "data/cities.ts",
      affects: `${cityHref(slug)} section order, copy and photos`,
      error,
    });
    return fb ?? null;
  }

  if (!result) {
    if (fb) {
      // Expected until the document is first published — not an error.
      console.warn(
        `[sanity] cityPage "${slug}" not published yet — ${cityHref(slug)} renders from data/cities.ts.`,
      );
      return fb;
    }
    logEmpty(`getCityPage(${slug})`, `${cityHref(slug)} has no content and 404s.`);
    return null;
  }

  const base = {
    city: result.city ?? fb?.city ?? slug,
    slug,
    seoTitle: result.seoTitle ?? fb?.seoTitle,
    seoDescription: result.seoDescription ?? fb?.seoDescription,
  };

  if (!result.sections) {
    if (fb) {
      console.warn(
        `[sanity] cityPage "${slug}" has no \`sections\` array — ${cityHref(slug)} ` +
          "renders the default stack from data/cities.ts. Run " +
          "scripts/migrate-city-sections.ts to move the document onto the " +
          "section stack.",
      );
      return { ...base, sections: fb.sections };
    }
    logEmpty(
      `getCityPage(${slug})`,
      `${cityHref(slug)} has a document but no sections and no fallback — it 404s.`,
    );
    return null;
  }

  const sections = toCitySections(result.sections, `cityPage "${slug}"`);
  if (!sections) {
    const allHidden =
      result.sections.length > 0 &&
      result.sections.every(
        (item) => (item as { hidden?: boolean }).hidden === true,
      );
    if (allHidden) return { ...base, sections: [] };
    if (fb) {
      console.warn(
        `[sanity] cityPage "${slug}" sections are published but none survived ` +
          `validation — ${cityHref(slug)} renders the default stack from data/cities.ts.`,
      );
      return { ...base, sections: fb.sections };
    }
    return { ...base, sections: [] };
  }

  return { ...base, sections };
}
