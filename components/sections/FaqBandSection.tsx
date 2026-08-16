import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { FaqBandSection as FaqBandData } from "@/data/faqSets";
import { cn } from "@/lib/utils";

interface FaqBandSectionProps {
  section: FaqBandData;
  id: string;
}

/**
 * The shared Q&A band — native <details>/<summary>, no client boundary.
 *
 * Native disclosure is deliberate: keyboard operation (Enter/Space), the
 * correct screen-reader role and expanded state, and browser find-in-page
 * reaching collapsed answers all come for free and can't drift. Answers are
 * server-rendered, so they're in the HTML for crawlers whether open or not.
 * Do not replace this with divs and onClick.
 *
 * Every item starts CLOSED: six open answers would bury the page's closing
 * CTA and make the bottom of the page unscannable.
 */
export function FaqBandSection({ section, id }: FaqBandSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="bg-offwhite py-16 sm:py-24 lg:py-28"
    >
      <Container className="max-w-[880px]">
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            title={section.heading}
            description={section.intro}
            align="center"
          />
        </Reveal>

        <div className="mt-12 overflow-hidden rounded-xl border border-grey-300/70 bg-white">
          {section.items.map((item, i) => (
            <Reveal key={item._key} delay={i * 0.04}>
              {/* Each item is wrapped by its own Reveal, so a `first:` variant
                  would match every row — the divider is driven by the index. */}
              <details
                className={cn(
                  "group",
                  i > 0 && "border-t border-grey-300/70",
                )}
              >
                {/* No outline reset: the global :focus-visible ring is the
                    keyboard affordance, and the tint is additive. */}
                <summary className="flex w-full cursor-pointer list-none items-start justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-grey-100/60 focus-visible:bg-grey-100/60 sm:px-6 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-[16px] font-bold tracking-tight text-navy-900 sm:text-[17px]">
                    {item.question}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-grey-100 text-navy-900 transition-[transform,background-color,color] duration-200 group-open:rotate-180 group-open:bg-red-600 group-open:text-white motion-reduce:transition-none"
                  >
                    <ChevronDown className="size-4" />
                  </span>
                </summary>
                <div className="px-5 pb-5 sm:px-6">
                  {/* Held to a readable measure rather than the full band. */}
                  <p className="max-w-[70ch] text-[15px] leading-relaxed text-grey-700">
                    {item.answer}
                  </p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
