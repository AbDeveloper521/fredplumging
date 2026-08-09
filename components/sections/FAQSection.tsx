"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import type { Faq } from "@/data/faqs";
import { homePageDefaults, type HomeFaqContent } from "@/data/homePage";
import { cn } from "@/lib/utils";

export function FAQSection({
  faqs,
  content = homePageDefaults.faq,
  titleId = "faq-heading",
}: {
  faqs: Faq[];
  content?: HomeFaqContent;
  /** Unique per instance — sections can be duplicated in the Studio; the accordion item ids derive from it. */
  titleId?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      aria-labelledby={titleId}
      className="bg-offwhite py-16 sm:py-24 lg:py-28"
    >
      <Container className="max-w-[880px]">
        <Reveal>
          <SectionHeading
            titleId={titleId}
            eyebrow={content.eyebrow}
            title={content.heading}
            align="center"
          />
        </Reveal>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={faq.question} delay={index * 0.04}>
                <div
                  className={cn(
                    "rounded-xl border bg-white transition-colors duration-200",
                    isOpen
                      ? "border-red-600/30 shadow-(--shadow-card)"
                      : "border-grey-100",
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      id={`${titleId}-trigger-${index}`}
                      aria-expanded={isOpen}
                      aria-controls={`${titleId}-panel-${index}`}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex min-h-14 w-full items-center justify-between gap-4 px-6 py-4.5 text-left"
                    >
                      <span className="text-[16px] font-bold text-navy-900 sm:text-[17px]">
                        {faq.question}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-200",
                          isOpen ? "rotate-45 bg-red-600 text-white" : "bg-grey-100 text-navy-900",
                        )}
                      >
                        <Plus className="size-4" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`${titleId}-panel-${index}`}
                    role="region"
                    aria-labelledby={`${titleId}-trigger-${index}`}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-[15px] leading-relaxed text-grey-500">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
