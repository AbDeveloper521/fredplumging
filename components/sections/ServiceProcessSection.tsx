import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import type { ProcessStepsSection as ProcessData } from "@/data/serviceSections";

interface ServiceProcessSectionProps {
  section: ProcessData;
  id: string;
}

/**
 * Numbered timeline: red numbered circles joined by a connecting line on
 * desktop, stacked with a vertical rail on mobile. Background configurable
 * (dark navy default, white variant styled after the homepage process
 * section). Neither variant carries a grid overlay — the page's .bg-grid
 * budget goes to the hero, what's-included, and final CTA.
 */
export function ServiceProcessSection({ section, id }: ServiceProcessSectionProps) {
  const dark = section.background !== "white";
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
            align="center"
          />
        </Reveal>

        <div className="relative mt-14 lg:mt-16">
          {/* Connecting line — desktop */}
          <div
            aria-hidden="true"
            className={cn(
              "absolute top-7 right-[12.5%] left-[12.5%] hidden h-px lg:block",
              dark
                ? "bg-gradient-to-r from-white/10 via-red-500/60 to-white/10"
                : "bg-gradient-to-r from-grey-300 via-red-500/50 to-grey-300",
            )}
          />
          <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {section.steps.map((step, i) => (
              <li key={step._key} className="relative">
                {/* Vertical rail — mobile */}
                {i < section.steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className={cn(
                      "absolute top-16 left-7 h-[calc(100%-2.5rem)] w-px lg:hidden",
                      dark ? "bg-white/15" : "bg-grey-300",
                    )}
                  />
                )}
                <Reveal
                  delay={i * 0.08}
                  className="flex gap-5 lg:flex-col lg:gap-0 lg:text-center"
                >
                  <div className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full bg-red-600 shadow-[0_8px_20px_rgb(211_33_39/0.35)] lg:mx-auto">
                    <span className="font-heading text-lg font-extrabold text-white">
                      {i + 1}
                    </span>
                  </div>
                  <div className="lg:mt-6">
                    <h3
                      className={cn(
                        "text-lg font-bold tracking-tight",
                        dark ? "text-white" : "text-navy-900",
                      )}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-2 text-[15px] leading-relaxed",
                        dark ? "text-grey-300" : "text-grey-500",
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
