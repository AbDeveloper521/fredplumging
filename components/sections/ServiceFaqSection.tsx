import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ServiceFaqSection as FaqData } from "@/data/serviceSections";

interface ServiceFaqSectionProps {
  section: FaqData;
  id: string;
}

/**
 * Per-service FAQ accordion built on native <details>/<summary> — same visual
 * language as the homepage FAQ but with NO client boundary; the answers are
 * server-rendered and always in the HTML for crawlers. The page-level
 * FAQPage JSON-LD is generated from these exact strings.
 */
export function ServiceFaqSection({ section, id }: ServiceFaqSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="bg-offwhite py-16 sm:py-24 lg:py-28">
      <Container className="max-w-[880px]">
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            title={section.heading}
            align="center"
          />
        </Reveal>

        <div className="mt-12 space-y-3">
          {section.faqs.map((faq, i) => (
            <Reveal key={faq._key} delay={i * 0.04}>
              <details className="group rounded-xl border border-grey-100 bg-white transition-colors duration-200 open:border-red-600/30 open:shadow-(--shadow-card)">
                <summary className="flex min-h-14 w-full cursor-pointer list-none items-center justify-between gap-4 px-6 py-4.5 text-left [&::-webkit-details-marker]:hidden">
                  <h3 className="text-[16px] font-bold tracking-tight text-navy-900 sm:text-[17px]">
                    {faq.question}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-grey-100 text-navy-900 transition-all duration-200 group-open:rotate-45 group-open:bg-red-600 group-open:text-white"
                  >
                    <Plus className="size-4" />
                  </span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-[15px] leading-relaxed text-grey-500">
                    {faq.answer}
                  </p>
                  {faq.href && (
                    <Link
                      href={faq.href}
                      className="group/faqlink mt-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-navy-900 underline decoration-red-600/50 underline-offset-4 transition-colors hover:text-red-600"
                    >
                      {faq.linkLabel ?? "Learn more"}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 text-red-600 transition-transform duration-200 group-hover/faqlink:translate-x-0.5 group-hover/faqlink:-translate-y-0.5"
                      />
                    </Link>
                  )}
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
