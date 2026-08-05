import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { navIcons } from "@/components/layout/navIcons";
import { careersPageDefaults, type CareerValuesContent } from "@/data/careersPage";

/**
 * The careers values band — dark per the owner's reference: three cards
 * (icon chip, title, a sentence or two). Default copy is the client's own,
 * transcribed verbatim from their careers page.
 */
export function CareerValuesSection({
  content = careersPageDefaults.values,
  titleId = "career-values-heading",
}: {
  content?: CareerValuesContent;
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
            theme="dark"
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {content.items.map((item, i) => {
            const Icon = navIcons[item.icon];
            return (
              <li key={item.title}>
                <Reveal delay={i * 0.08} className="h-full">
                  <div className="h-full rounded-2xl border border-white/10 bg-navy-900/70 p-7 backdrop-blur-sm">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-red-600 shadow-[0_8px_20px_rgb(211_33_39/0.28)]">
                      <Icon aria-hidden="true" className="size-5 text-white" />
                    </span>
                    <h3 className="mt-6 text-lg font-extrabold tracking-tight text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-grey-300">
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
