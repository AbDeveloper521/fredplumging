import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { navIcons } from "@/components/layout/navIcons";
import { homePage, type HomeProcessContent } from "@/data/homePage";

export function ProcessSection({
  content = homePage.process,
}: {
  content?: HomeProcessContent;
}) {
  // Step numbers derive from position — reordering in the Studio renumbers.
  const steps = content.steps.map((step, i) => ({
    number: String(i + 1).padStart(2, "0"),
    title: step.title,
    description: step.description,
    icon: navIcons[step.icon],
  }));
  return (
    <section
      aria-labelledby="process-heading"
      className="bg-offwhite py-16 sm:py-24 lg:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            titleId="process-heading"
            eyebrow={content.eyebrow}
            title={content.heading}
            align="center"
          />
        </Reveal>

        <div className="relative mt-14 lg:mt-16">
          {/* Horizontal connector — desktop only */}
          <div
            aria-hidden="true"
            className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-px bg-gradient-to-r from-grey-300 via-red-500/50 to-grey-300 lg:block"
          />
          <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, i) => (
              <li key={step.number} className="relative">
                {/* Vertical connector — mobile only */}
                {i < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute top-16 left-7 h-[calc(100%-2.5rem)] w-px bg-grey-300 lg:hidden"
                  />
                )}
                <Reveal
                  delay={i * 0.08}
                  className="flex gap-5 lg:flex-col lg:gap-0 lg:text-center"
                >
                  <div className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-2xl border border-grey-300 bg-white shadow-(--shadow-card) lg:mx-auto">
                    <step.icon aria-hidden="true" className="size-6 text-red-600" />
                  </div>
                  <div className="lg:mt-6">
                    <p className="font-heading text-[13px] font-extrabold tracking-[0.18em] text-red-600">
                      STEP {step.number}
                    </p>
                    <h3 className="mt-2 text-lg font-bold tracking-tight text-navy-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-grey-500">
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
