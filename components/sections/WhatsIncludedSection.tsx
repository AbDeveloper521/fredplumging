import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { navIcons } from "@/components/layout/navIcons";
import type { WhatsIncludedSection as WhatsIncludedData } from "@/data/serviceSections";

interface WhatsIncludedSectionProps {
  section: WhatsIncludedData;
  id: string;
}

/**
 * The page's informational core: a compact scope list (icon, bold title,
 * one-line description) — deliberately NOT cards-with-buttons; this is a
 * scope list, not a menu.
 */
export function WhatsIncludedSection({ section, id }: WhatsIncludedSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="relative bg-offwhite py-16 sm:py-24 lg:py-28"
    >
      <div aria-hidden="true" className="bg-grid-light absolute inset-0" />
      <Container className="relative">
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            title={section.heading}
            description={section.intro}
          />
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 lg:mt-14">
          {section.items.map((item, i) => {
            const Icon = navIcons[item.icon];
            const title = item.href ? (
              <Link
                href={item.href}
                className="underline decoration-red-600/40 underline-offset-4 transition-colors hover:text-red-600"
              >
                {item.title}
              </Link>
            ) : (
              item.title
            );
            return (
              <li key={item._key}>
                <Reveal delay={(i % 2) * 0.06} className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-grey-300 bg-white shadow-(--shadow-card)">
                    <Icon aria-hidden="true" className="size-5 text-red-600" />
                  </span>
                  <div>
                    <h3 className="text-[17px] font-bold tracking-tight text-navy-900">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-grey-500">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
