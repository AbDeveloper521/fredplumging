import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The client's hiring-philosophy paragraph, broken out of the wall of text
 * into named traits. Every trait traces to a phrase in their own copy — do
 * not add traits the client did not name. One deliberate edit: the source
 * says "the right guys"; rendered as "the right people" (gendered wording in
 * a US job advertisement — flagged for the client).
 */
const traits = [
  {
    name: "Problem solver under pressure",
    gloss: "Stays methodical when a call goes sideways.",
  },
  {
    name: "Quiet confidence, no ego",
    gloss: "Sure of the work without needing to prove it.",
  },
  {
    name: "Situational awareness",
    gloss: "Reads the building, the resident, and the job.",
  },
  {
    name: "Ownership mindset",
    gloss: "Treats every job as theirs to finish right.",
  },
  {
    name: "Respect for the trade",
    gloss: "Takes plumbing seriously as a craft.",
  },
  {
    name: "Curiosity",
    gloss: "Wants to know how and why, not just what.",
  },
  {
    name: "Integrity when no one is watching",
    gloss: "The work is right even when nobody checks it.",
  },
  {
    name: "Coachable and consistent",
    gloss: "Takes feedback and shows up the same every day.",
  },
];

export function CareerTraitsSection({ id = "what-we-look-for" }: { id?: string }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="relative isolate overflow-hidden bg-navy-950 py-16 sm:py-24 lg:py-28"
    >
      <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_20%,rgb(27_48_73/0.85),transparent_65%)]"
      />

      <Container className="relative">
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            eyebrow="Who Thrives Here"
            title="What We Look For"
            description="We value character and intangibles over certifications and tenure. We can teach the right people how to be great multifamily plumbers. Intangibles generally can't be taught. We want to hire employees that will be plumbers and team members with us for life."
            theme="dark"
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {traits.map(({ name, gloss }, i) => (
            <li key={name}>
              <Reveal delay={Math.min(i, 5) * 0.05} className="h-full">
                <div className="h-full rounded-2xl border border-white/10 bg-navy-900/70 p-6 backdrop-blur-sm">
                  <span aria-hidden="true" className="block h-1 w-8 rounded-full bg-red-600" />
                  <h3 className="mt-4 text-[16px] font-extrabold tracking-tight text-white">
                    {name}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-grey-300">
                    {gloss}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={0.15}>
          <p className="mt-12 text-center text-[17px] font-semibold text-white">
            &ldquo;Respect and communication are essential at Fred&rsquo;s.&rdquo;
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
