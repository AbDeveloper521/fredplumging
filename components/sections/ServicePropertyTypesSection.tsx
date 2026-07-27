import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { navIcons } from "@/components/layout/navIcons";
import { industryHref } from "@/data/industries";
import type { PropertyTypesSection as PropertyTypesData } from "@/data/serviceSections";

interface ServicePropertyTypesSectionProps {
  section: PropertyTypesData;
  id: string;
}

/**
 * Compact link cards into the property-type pages (/multifamily/…) —
 * internal links that keep those pages reachable from every service page.
 */
export function ServicePropertyTypesSection({
  section,
  id,
}: ServicePropertyTypesSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="relative isolate overflow-hidden bg-navy-900 py-16 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_55%_at_85%_15%,rgb(211_33_39/0.12),transparent_60%)]"
      />
      <Container className="relative">
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            title={section.heading}
            theme="dark"
          />
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.cards.map((card, i) => {
            const Icon = navIcons[card.icon];
            return (
              <li key={card._key}>
                <Reveal delay={i * 0.06} className="h-full">
                  <Link
                    href={industryHref(card.slug)}
                    className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors duration-200 hover:border-white/25 hover:bg-white/10"
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/5">
                      <Icon aria-hidden="true" className="size-5 text-red-500" />
                    </span>
                    <h3 className="mt-5 text-[17px] font-bold tracking-tight text-white">
                      {card.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[14px] leading-relaxed text-grey-300">
                      {card.blurb}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-white">
                      See how we help
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 text-red-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
