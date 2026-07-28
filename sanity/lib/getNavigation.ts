import "server-only";
import { serverClient } from "@/sanity/lib/serverClient";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { sanityFetchOptions } from "@/sanity/lib/cacheOptions";
import { NAVIGATION_QUERY } from "@/sanity/queries";
import type { NAVIGATION_QUERY_RESULT } from "@/sanity.types";
import {
  STATIC_NAVIGATION,
  NAV_ICON_NAMES,
  type NavGroup,
  type NavIconName,
  type Navigation,
} from "@/data/navigation";

/** Cache tag invalidated by the /api/revalidate webhook. */
export const NAVIGATION_TAG = "navigation";

function toIconName(value: string | null | undefined): NavIconName | undefined {
  return value && (NAV_ICON_NAMES as readonly string[]).includes(value)
    ? (value as NavIconName)
    : undefined;
}

/**
 * Maps the Sanity document onto the app's `Navigation` shape. Returns null if
 * anything structurally required is missing — the caller then serves the full
 * static fallback, because a partially broken menu is worse than a stale one.
 */
function toNavigation(result: NAVIGATION_QUERY_RESULT): Navigation | null {
  if (!result?.items?.length || !result.cta?.label || !result.cta.href) {
    return null;
  }

  const items: NavGroup[] = [];
  for (const group of result.items) {
    if (!group.label || !group.href || !group.children?.length) return null;

    const children = [];
    for (const child of group.children) {
      if (!child.label || !child.href) return null;
      children.push({
        _key: child._key,
        label: child.label,
        href: child.href,
        description: child.description ?? undefined,
        icon: toIconName(child.icon),
      });
    }

    items.push({
      _key: group._key,
      label: group.label,
      href: group.href,
      layout: group.layout === "mega" ? "mega" : "list",
      showServiceAreaCities: group.showServiceAreaCities ?? undefined,
      children,
    });
  }

  return { items, cta: { label: result.cta.label, href: result.cta.href } };
}

/**
 * Navigation accessor — same seam pattern as `getSite()`. Tag invalidation is
 * primary; the 24h revalidate is a backstop against a silently broken webhook.
 */
export async function getNavigation(): Promise<Navigation> {
  let result: NAVIGATION_QUERY_RESULT;
  try {
    result = await serverClient.fetch(
      NAVIGATION_QUERY,
      {},
      sanityFetchOptions(NAVIGATION_TAG),
    );
  } catch (error) {
    logFallback({
      fetcher: "getNavigation",
      fallbackFile: "data/navigation.ts (STATIC_NAVIGATION)",
      affects: "header navigation on EVERY page",
      error,
    });
    return STATIC_NAVIGATION;
  }

  if (!result) {
    console.error(
      "[sanity] navigation document not found — serving fallback from data/navigation.ts. " +
        "Publish the Navigation Menu document in /studio.",
    );
    return STATIC_NAVIGATION;
  }

  const navigation = toNavigation(result);
  if (!navigation) {
    console.error(
      "[sanity] navigation document is incomplete (missing labels, links, or CTA) — " +
        "serving fallback from data/navigation.ts.",
    );
    return STATIC_NAVIGATION;
  }

  return navigation;
}
