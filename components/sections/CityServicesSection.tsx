import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { navIcons } from "@/components/layout/navIcons";
import type { CityServiceCard } from "@/data/cities";

interface CityServicesSectionProps {
  heading: string;
  cards: CityServiceCard[];
  id: string;
}

/**
 * City-page services band: light cards with city-specific copy, each linking
 * to the matching existing service page. Distinct from the homepage
 * ServiceCard (photo tiles) on purpose — these carry longer, city-written
 * paragraphs where a photo background would fight legibility.
 */
export function CityServicesSection({ heading, cards, id }: CityServicesSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="bg-offwhite py-16 sm:py-24 lg:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            title={heading}
            align="center"
            className="max-w-3xl"
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, i) => {
            const Icon = navIcons[card.icon];
            return (
              <Reveal key={card._key} delay={i * 0.06}>
                <Link
                  href={card.href}
                  className="group flex h-full flex-col rounded-2xl border border-grey-300/60 bg-white p-7 shadow-card transition-shadow duration-300 hover:shadow-card-lg"
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-red-100">
                    <Icon aria-hidden="true" className="size-5 text-red-600" />
                  </span>
                  <h3 className="mt-5 text-xl font-extrabold tracking-tight text-navy-900">
                    {card.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-grey-700">
                    {card.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900 transition-colors group-hover:text-red-600">
                    Get Started
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 text-red-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
