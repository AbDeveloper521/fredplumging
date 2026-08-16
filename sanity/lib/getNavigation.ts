import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
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
 *
 * The one exception is a menu item with neither a page address nor dropdown
 * links: schema validation stops NEW ones, but it never rewrites documents
 * saved before the rule existed, so an old one can still arrive here. That
 * single item is dropped and logged (the same treatment the section mapper
 * gives a malformed section) rather than rendering a dead link or taking the
 * whole menu down with it.
 */
function toNavigation(result: NAVIGATION_QUERY_RESULT): Navigation | null {
  if (!result?.items?.length || !result.cta?.label || !result.cta.href) {
    return null;
  }

  const items: NavGroup[] = [];
  for (const group of result.items) {
    if (!group.label) return null;

    const children = [];
    for (const child of group.children ?? []) {
      if (!child.label || !child.href) return null;
      children.push({
        _key: child._key,
        label: child.label,
        href: child.href,
        description: child.description ?? undefined,
        icon: toIconName(child.icon),
      });
    }

    if (!group.href && children.length === 0) {
      console.warn(
        `[sanity] navigation: menu item “${group.label}” (key ${group._key}) has ` +
          "no page address and no dropdown links — it has nowhere to go, so it is " +
          "NOT shown in the header. Fix: open Navigation Menu in /studio, either " +
          "fill in “Page address” on that item or add at least one link under " +
          "“Links in this menu”, then Publish.",
      );
      continue;
    }

    items.push({
      _key: group._key,
      label: group.label,
      href: group.href ?? undefined,
      layout: group.layout === "mega" ? "mega" : "list",
      showServiceAreaCities: group.showServiceAreaCities ?? undefined,
      children,
    });
  }

  // Every item dropped (or none published) leaves no menu at all — the static
  // fallback is the better failure than an empty header.
  if (items.length === 0) return null;

  return { items, cta: { label: result.cta.label, href: result.cta.href } };
}

/**
 * Navigation accessor — same seam pattern as `getSite()`. Tag invalidation is
 * primary; the 24h revalidate is a backstop against a silently broken webhook.
 */
export async function getNavigation(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<Navigation> {
  let result: NAVIGATION_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      NAVIGATION_QUERY,
      {},
      NAVIGATION_TAG,
      options,
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
