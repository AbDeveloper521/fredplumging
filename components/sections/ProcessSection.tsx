import {
  PhoneCall,
  SearchCheck,
  Wrench,
  FileCheck2,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Tell Us What You Need",
    description:
      "Call or send a request — we gather the details and prioritize urgent issues immediately.",
    icon: PhoneCall,
  },
  {
    number: "02",
    title: "We Assess the Situation",
    description:
      "A technician evaluates the problem on site and walks you through the recommended fix.",
    icon: SearchCheck,
  },
  {
    number: "03",
    title: "Our Team Completes the Work",
    description:
      "Licensed professionals complete the repair or project with minimal disruption to your property.",
    icon: Wrench,
  },
  {
    number: "04",
    title: "You Receive Clear Follow-Up",
    description:
      "You get documentation of the completed work plus any recommendations for prevention.",
    icon: FileCheck2,
  },
];

export function ProcessSection() {
  return (
    <section
      aria-labelledby="process-heading"
      className="bg-offwhite py-16 sm:py-24 lg:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            titleId="process-heading"
            eyebrow="How It Works"
            title="A Straightforward Service Process"
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
