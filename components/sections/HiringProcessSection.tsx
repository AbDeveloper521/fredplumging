import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

/* PLACEHOLDER — confirm the real hiring process with the client. These four
   steps are a plausible outline written for layout purposes; nothing here
   comes from the client's own material. Deliberately no timeline in days —
   we do not know it. */
const steps = [
  {
    title: "Apply",
    description:
      "Email us with a short note about your experience and the role you're after. A résumé helps; a licence number helps more.",
  },
  {
    title: "Talk",
    description:
      "A phone conversation about the work, the properties we serve, and the shift — both directions, you're interviewing us too.",
  },
  {
    title: "Ride along",
    description:
      "A ride-along or shop visit with the crew you'd join, so you see the actual work and the people before deciding.",
  },
  {
    title: "Offer",
    description:
      "An offer, then licence verification and the documentation paperwork to get you on trucks.",
  },
];

/**
 * Same visual pattern as ServiceProcessSection's white variant — that
 * component's props are shaped for a CMS section object, so the pattern is
 * reused rather than the component.
 */
export function HiringProcessSection({ id = "how-hiring-works" }: { id?: string }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="bg-white py-16 sm:py-24 lg:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            title="How Hiring Works"
            align="center"
          />
        </Reveal>

        <div className="relative mt-14 lg:mt-16">
          <div
            aria-hidden="true"
            className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-px bg-gradient-to-r from-grey-300 via-red-500/50 to-grey-300 lg:block"
          />
          <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, i) => (
              <li key={step.title} className="relative">
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
                  <div className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full bg-red-600 shadow-[0_8px_20px_rgb(211_33_39/0.35)] lg:mx-auto">
                    <span className="font-heading text-lg font-extrabold text-white">
                      {i + 1}
                    </span>
                  </div>
                  <div className="lg:mt-6">
                    <h3 className="text-lg font-bold tracking-tight text-navy-900">
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
