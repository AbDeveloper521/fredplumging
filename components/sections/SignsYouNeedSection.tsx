import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { navIcons } from "@/components/layout/navIcons";
import type { SignsYouNeedSection as SignsData } from "@/data/serviceSections";

interface SignsYouNeedSectionProps {
  section: SignsData;
  id: string;
}

/**
 * Symptom cards phrased as the questions property managers actually search —
 * question as h3, answer-first body, so each card extracts cleanly into AI
 * answers.
 */
export function SignsYouNeedSection({ section, id }: SignsYouNeedSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="bg-white py-16 sm:py-24 lg:py-28">
      <Container>
        <Reveal>
          <SectionHeading titleId={`${id}-heading`} title={section.heading} />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {section.cards.map((card, i) => {
            const Icon = navIcons[card.icon];
            return (
              <Reveal key={card._key} delay={(i % 2) * 0.06}>
                <article className="h-full rounded-2xl border border-grey-100 bg-white p-7 shadow-(--shadow-card) sm:p-8">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-red-100">
                    <Icon aria-hidden="true" className="size-[22px] text-red-600" />
                  </span>
                  <h3 className="mt-5 text-[19px] leading-snug font-bold tracking-tight text-navy-900">
                    {card.question}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-grey-700">
                    {card.answer}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-11 flex justify-center">
            <Button href={section.ctaHref} variant="secondary" size="lg" withArrow>
              {section.ctaLabel}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
