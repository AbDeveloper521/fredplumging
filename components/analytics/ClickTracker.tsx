"use client";

import { useEffect } from "react";
import { LOCATION_ATTR, currentPagePath, trackEvent } from "@/lib/analytics";

/**
 * ONE delegated listener on `document` that reports every `tel:` and
 * `mailto:` click on the site — the header, hero, emergency bands, footer,
 * sticky mobile bar, CMS body copy, all of them — without a handler on any
 * individual link. A phone link added tomorrow is tracked the moment it
 * exists; the only thing to remember is a `data-analytics-location`
 * attribute (on the link or an ancestor) so the report says WHERE it was
 * clicked.
 *
 * Runs in the capture phase so nothing that stops propagation can hide a
 * click, and reads only the link's protocol and its location label — never
 * the number, the address or any text the visitor typed.
 */
export function ClickTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[href^="tel:"], a[href^="mailto:"]');
      if (!link) return;

      const name = link.getAttribute("href")?.startsWith("tel:")
        ? "phone_click"
        : "email_click";

      trackEvent(name, {
        link_location: locationOf(link),
        page_path: currentPagePath(),
      });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

/**
 * The label on the link or its nearest labelled ancestor; failing that, the
 * landmark it sits in, so an unlabelled link still reads as something
 * ("header", "footer") rather than nothing.
 */
function locationOf(link: HTMLAnchorElement): string {
  const labelled = link.closest<HTMLElement>(`[${LOCATION_ATTR}]`);
  const label = labelled?.getAttribute(LOCATION_ATTR)?.trim();
  if (label) return label;
  if (link.closest("header")) return "header";
  if (link.closest("footer")) return "footer";
  return "unlabelled";
}
