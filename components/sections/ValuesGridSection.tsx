import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { navIcons } from "@/components/layout/navIcons";
import type { ValuesGridContent } from "@/data/aboutPage";

/** The /about "What We Stand For" card grid: icon, label, one line each. */
export function ValuesGridSection({
  content,
  titleId,
}: {
  content: ValuesGridContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId: string;
}) {
  return (
    <section aria-labelledby={titleId} className="bg-offwhite py-16 sm:py-24 lg:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            titleId={titleId}
            eyebrow={content.eyebrow}
            title={content.heading}
            align="center"
          />
        </Reveal>
        <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.values.map((value, i) => {
            const Icon = navIcons[value.icon];
            return (
              <li key={value.title}>
                <Reveal delay={(i % 3) * 0.08} className="h-full">
                  <div className="h-full rounded-2xl border border-grey-100 bg-white p-7 shadow-(--shadow-card)">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-red-600 shadow-[0_8px_20px_rgb(211_33_39/0.28)]">
                      <Icon aria-hidden="true" className="size-5 text-white" />
                    </span>
                    <h3 className="mt-6 text-lg font-extrabold tracking-tight text-navy-900">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-grey-500">
                      {value.description}
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
