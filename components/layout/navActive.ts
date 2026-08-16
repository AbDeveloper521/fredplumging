import type { NavGroup } from "@/data/navigation";

/** True when `pathname` is the section landing page or anything beneath it. */
export function isSectionActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** True only for an exact route match. */
export function isExactActive(pathname: string, href: string): boolean {
  return pathname === href;
}

/**
 * Whether the visitor is currently inside a header menu item — the marker for
 * the item itself (red left bar on mobile, tinted pill on desktop).
 *
 * A menu item's own `href` decides it whenever there is one, which covers both
 * a plain top-level link and every section parent on this site. A dropdown
 * whose name opens the panel instead of navigating has no `href` of its own,
 * so it falls back to its children: the item is active when any of them is.
 */
export function isGroupActive(pathname: string, group: NavGroup): boolean {
  if (group.href) return isSectionActive(pathname, group.href);
  return group.children.some((child) => isSectionActive(pathname, child.href));
}

/**
 * The filled-pill treatment — the exact page the visitor is on.
 *
 * Reserved for a plain link, which has no child rows of its own. On a dropdown
 * parent the pill would stack under the filled child row for the same page and
 * produce the double-highlight the mobile menu was fixed for; that item keeps
 * the section bar only.
 */
export function isGroupExactActive(pathname: string, group: NavGroup): boolean {
  return (
    group.children.length === 0 &&
    group.href !== undefined &&
    isExactActive(pathname, group.href)
  );
}
