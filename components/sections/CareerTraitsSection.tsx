import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { careersPageDefaults, type CareerTraitsContent } from "@/data/careersPage";

/**
 * The client's hiring-philosophy paragraph, broken out of the wall of text
 * into named traits. Every default trait traces to a phrase in their own
 * copy — do not add traits the client did not name. One deliberate edit in
 * the DEFAULT description: the source says "the right guys"; rendered as
 * "the right people" (gendered wording in a US job advertisement — flagged
 * for the client; note the new reference hero uses "guys" verbatim).
 * Retired from the default careers stack — re-addable in Studio.
 */
export function CareerTraitsSection({
  content = careersPageDefaults.traits,
  titleId = "career-traits-heading",
}: {
  content?: CareerTraitsContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId?: string;
}) {
  return (
    <section
      aria-labelledby={titleId}
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
            titleId={titleId}
            eyebrow={content.eyebrow}
            title={content.heading}
            description={content.description}
            theme="dark"
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {content.traits.map(({ name, gloss }, i) => (
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

        {content.quote && (
          <Reveal delay={0.15}>
            <p className="mt-12 text-center text-[17px] font-semibold text-white">
              &ldquo;{content.quote}&rdquo;
            </p>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
