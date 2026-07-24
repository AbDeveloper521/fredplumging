/** True when `pathname` is the section landing page or anything beneath it. */
export function isSectionActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** True only for an exact route match. */
export function isExactActive(pathname: string, href: string): boolean {
  return pathname === href;
}
