import { GraduationCap, ShieldCheck, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

/** Card copy is the client's own, transcribed verbatim from their careers page. */
const values = [
  {
    icon: GraduationCap,
    title: "Supportive Career Development",
    description:
      "We provide ongoing training, skill building opportunities, and a work environment that helps you grow professionally and advance confidently.",
  },
  {
    icon: Users,
    title: "Strong Team Culture",
    description:
      "Our team works together with respect, reliability, and clear communication, creating a workplace where everyone feels valued and supported.",
  },
  {
    icon: ShieldCheck,
    title: "Meaningful Impact",
    description:
      "Every service call helps protect homes, businesses, and communities. Your work makes a real difference and contributes to our reputation for quality and trust.",
  },
];

export function CareerValuesSection({ id = "why-work-here" }: { id?: string }) {
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
            eyebrow="Why Work Here"
            title="A Company That Values Your Growth and Commitment"
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {values.map(({ icon: Icon, title, description }, i) => (
            <li key={title}>
              <Reveal delay={i * 0.08} className="h-full">
                <div className="h-full rounded-2xl border border-grey-100 bg-white p-7 shadow-(--shadow-card)">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-red-600 shadow-[0_8px_20px_rgb(211_33_39/0.28)]">
                    <Icon aria-hidden="true" className="size-5 text-white" />
                  </span>
                  <h3 className="mt-6 text-lg font-extrabold tracking-tight text-navy-900">
                    {title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-grey-500">
                    {description}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
