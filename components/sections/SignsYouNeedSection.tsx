import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { navIcons } from "@/components/layout/navIcons";
import { cn } from "@/lib/utils";
import type { SignsYouNeedSection as SignsData } from "@/data/serviceSections";

interface SignsYouNeedSectionProps {
  section: SignsData;
  id: string;
}

/**
 * Symptom cards phrased as the questions property managers actually search —
 * question as h3, answer-first body, so each card extracts cleanly into AI
 * answers. Background configurable (white default, dark navy band); the
 * dark variant carries no grid overlay — the page's grid budget goes to the
 * hero, what's-included, and final CTA.
 */
export function SignsYouNeedSection({ section, id }: SignsYouNeedSectionProps) {
  const dark = section.background === "dark";
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "relative isolate overflow-hidden py-16 sm:py-24 lg:py-28",
        dark ? "bg-navy-900" : "bg-white",
      )}
    >
      {dark && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_15%_20%,rgb(27_48_73/0.9),transparent_65%)]"
        />
      )}
      <Container className="relative">
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            title={section.heading}
            theme={dark ? "dark" : "light"}
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {section.cards.map((card, i) => {
            const Icon = navIcons[card.icon];
            return (
              <Reveal key={card._key} delay={(i % 2) * 0.06}>
                <article
                  className={cn(
                    "h-full rounded-2xl border p-7 sm:p-8",
                    dark
                      ? "border-white/10 bg-white/5"
                      : "border-grey-100 bg-white shadow-(--shadow-card)",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-xl",
                      dark ? "border border-white/15 bg-white/5" : "bg-red-100",
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className={cn("size-[22px]", dark ? "text-red-500" : "text-red-600")}
                    />
                  </span>
                  <h3
                    className={cn(
                      "mt-5 text-[19px] leading-snug font-bold tracking-tight",
                      dark ? "text-white" : "text-navy-900",
                    )}
                  >
                    {card.question}
                  </h3>
                  <p
                    className={cn(
                      "mt-3 text-[15px] leading-relaxed",
                      dark ? "text-grey-300" : "text-grey-700",
                    )}
                  >
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
