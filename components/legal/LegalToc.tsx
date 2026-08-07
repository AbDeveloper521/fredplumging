"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LegalHeading } from "@/lib/legalHeadings";

/**
 * "On this page" — navigation DERIVED from the document's own `h2` headings,
 * never separate content: rename a heading in Studio and this follows.
 *
 * Plain `#id` anchors, so it works without JS and the smooth scroll comes
 * from the global `html { scroll-behavior: smooth }` rule, which already has
 * a `prefers-reduced-motion` override in app/globals.css. The only JS here is
 * the IntersectionObserver that highlights the section you are reading.
 *
 * Below `lg` it collapses into a closed-by-default <details> disclosure; from
 * `lg` up it is a sticky sidebar. Sections are numbered here and never in the
 * headings themselves — those are the client's words.
 */
export function LegalToc({ headings }: { headings: LegalHeading[] }) {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (headings.length === 0) return;
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    /**
     * The section you are actually inside: the last heading at or above the
     * line just under the sticky header. Computed from live positions rather
     * than from the entries themselves — an anchor jump lands its target ABOVE
     * the observer band (scroll-margin-top puts it at 100px), so "whichever
     * entry is intersecting" would leave nothing highlighted on arrival.
     */
    const pick = () => {
      const line = 140;
      let current: HTMLElement | undefined;
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= line) current = element;
        else break;
      }
      setActiveId(current?.id);
    };

    // Two signals, one calculation. The observer catches headings entering or
    // leaving the viewport (including layout shifts as images settle); the
    // rAF-throttled scroll listener keeps the highlight live between those
    // crossings — a long section can be scrolled through without any
    // intersection changing at all. No negative rootMargin: a percentage one
    // collapses to nothing on a short viewport and silently kills the
    // highlight.
    const observer = new IntersectionObserver(pick, { threshold: 0 });
    elements.forEach((element) => observer.observe(element));

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        pick();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    pick();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  const list = (
    <ol className="space-y-1">
      {headings.map((heading, i) => {
        const isActive = heading.id === activeId;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "flex gap-2.5 rounded-md border-l-2 py-1.5 pr-2 pl-3 text-[14px] leading-snug transition-colors",
                isActive
                  ? "border-red-600 font-semibold text-navy-900"
                  : "border-grey-300/70 text-grey-500 hover:border-grey-500 hover:text-navy-900",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "shrink-0 tabular-nums",
                  isActive ? "text-red-600" : "text-grey-500/80",
                )}
              >
                {i + 1}.
              </span>
              {heading.text}
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      {/* Below lg: a closed disclosure, so the document starts immediately. */}
      <details
        data-print-hide
        className="group mb-10 rounded-xl border border-grey-300/70 bg-offwhite p-4 lg:hidden"
      >
        <summary className="flex cursor-pointer items-center justify-between gap-3 text-[14px] font-bold tracking-tight text-navy-900 marker:content-none [&::-webkit-details-marker]:hidden">
          On this page
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-red-600 transition-transform group-open:rotate-180"
          />
        </summary>
        <nav aria-label="On this page" className="mt-4">
          {list}
        </nav>
      </details>

      {/* lg and up: sticky sidebar, clearing the fixed header. */}
      <nav
        data-print-hide
        aria-label="On this page"
        className="hidden lg:sticky lg:top-28 lg:block lg:self-start"
      >
        <p className="mb-4 text-[12px] font-bold tracking-[0.12em] text-grey-500 uppercase">
          On this page
        </p>
        {list}
      </nav>
    </>
  );
}
