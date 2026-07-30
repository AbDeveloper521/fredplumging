"use client";

import { useEffect, useRef, useState } from "react";
import type { Testimonial } from "@/data/testimonials";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialCard } from "@/components/ui/TestimonialCard";

const BATCH_SIZE = 20;

interface TestimonialsExplorerProps {
  testimonials: Testimonial[];
}

/**
 * Progressive reveal for the full review list on /about/testimonials: the
 * first 20 render immediately, "Show more reviews" appends 20 per click.
 *
 * Layout is a plain grid (not CSS columns) on purpose — `columns-*` masonry
 * rebalances every card into new columns when a batch is appended, which
 * visibly reshuffles what the reader was just looking at. `items-start` keeps
 * cards at their natural height despite the shared grid rows.
 *
 * Appended cards deliberately skip the scroll-in animation: `Reveal` is for
 * content that enters by scrolling, and a card revealed by click must never
 * depend on an intersection observer that may have already fired.
 */
export function TestimonialsExplorer({ testimonials }: TestimonialsExplorerProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  // Index of the first card of the newest batch — receives focus after a
  // click so keyboard and screen-reader users land on the revealed content.
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const focusTargetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (focusIndex !== null) focusTargetRef.current?.focus();
  }, [focusIndex]);

  const visible = testimonials.slice(0, visibleCount);
  const remaining = testimonials.length - visible.length;

  const showMore = () => {
    setFocusIndex(visibleCount);
    setVisibleCount((count) =>
      Math.min(count + BATCH_SIZE, testimonials.length),
    );
  };

  return (
    <div>
      <ul className="grid list-none grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((testimonial, i) => (
          <li key={testimonial.id}>
            {i < BATCH_SIZE ? (
              <Reveal delay={Math.min(i, 5) * 0.05}>
                <TestimonialCard testimonial={testimonial} />
              </Reveal>
            ) : (
              <div
                ref={i === focusIndex ? focusTargetRef : undefined}
                tabIndex={i === focusIndex ? -1 : undefined}
                className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500"
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Visually hidden but kept: the polite announcement after "Show more"
          depends on this live region. */}
      <p aria-live="polite" className="sr-only">
        Showing {visible.length} of {testimonials.length} reviews
      </p>
      {remaining > 0 && (
        <div className="mt-10 text-center">
          <Button type="button" variant="secondary" size="lg" onClick={showMore}>
            Show more reviews
          </Button>
        </div>
      )}
    </div>
  );
}
