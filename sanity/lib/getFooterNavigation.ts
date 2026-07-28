import "server-only";
import { serverClient } from "@/sanity/lib/serverClient";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { sanityFetchOptions } from "@/sanity/lib/cacheOptions";
import { FOOTER_NAVIGATION_QUERY } from "@/sanity/queries";
import type { FOOTER_NAVIGATION_QUERY_RESULT } from "@/sanity.types";
import {
  STATIC_FOOTER_NAVIGATION,
  type FooterNavigation,
} from "@/data/navigation";

/** Stored on the `navigation` singleton — shares its cache tag. */
const NAVIGATION_TAG = "navigation";

/**
 * All-or-nothing like the header nav: any structural gap (missing heading,
 * empty column, no legal links) serves the full static fallback. A footer
 * with holes never renders.
 */
function toFooterNavigation(
  result: FOOTER_NAVIGATION_QUERY_RESULT,
): FooterNavigation | null {
  if (!result?.footerColumns?.length || !result.legalLinks?.length) return null;

  const columns = [];
  for (const column of result.footerColumns) {
    if (!column.heading || !column.links?.length) return null;
    const links = [];
    for (const link of column.links) {
      if (!link.label || !link.href) return null;
      links.push({ _key: link._key, label: link.label, href: link.href });
    }
    columns.push({ _key: column._key, heading: column.heading, links });
  }

  const legal = [];
  for (const link of result.legalLinks) {
    if (!link.label || !link.href) return null;
    legal.push({ _key: link._key, label: link.label, href: link.href });
  }

  return { columns, legal };
}

export async function getFooterNavigation(): Promise<FooterNavigation> {
  let result: FOOTER_NAVIGATION_QUERY_RESULT;
  try {
    result = await serverClient.fetch(
      FOOTER_NAVIGATION_QUERY,
      {},
      sanityFetchOptions(NAVIGATION_TAG),
    );
  } catch (error) {
    logFallback({
      fetcher: "getFooterNavigation",
      fallbackFile: "data/navigation.ts (STATIC_FOOTER_NAVIGATION)",
      affects: "footer link columns on every page",
      error,
    });
    return STATIC_FOOTER_NAVIGATION;
  }

  const footer = result ? toFooterNavigation(result) : null;
  if (!footer) {
    console.error(
      "[sanity] navigation document has no complete footer section — serving the static " +
        "footer from data/navigation.ts. Fill in “Footer links” on the Navigation Menu document.",
    );
    return STATIC_FOOTER_NAVIGATION;
  }
  return footer;
}
