import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ComparisonTableSection as TableData } from "@/data/serviceSections";

interface ComparisonTableSectionProps {
  section: TableData;
  id: string;
}

/**
 * A real <table> — tables extract cleanly for AI search; prose does not.
 * Horizontally scrollable inside its own container on mobile so the page
 * body never scrolls sideways.
 */
export function ComparisonTableSection({ section, id }: ComparisonTableSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="bg-white py-16 sm:py-24 lg:py-28">
      <Container className="max-w-[1000px]">
        <Reveal>
          <SectionHeading titleId={`${id}-heading`} title={section.heading} />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-grey-100 shadow-(--shadow-card)">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="bg-navy-900">
                  <th scope="col" className="px-6 py-4 text-[13px] font-bold tracking-[0.1em] text-white uppercase">
                    Situation
                  </th>
                  <th scope="col" className="px-6 py-4 text-[13px] font-bold tracking-[0.1em] text-white uppercase">
                    Typical Recommendation
                  </th>
                  <th scope="col" className="px-6 py-4 text-[13px] font-bold tracking-[0.1em] text-white uppercase">
                    Why
                  </th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, i) => (
                  <tr
                    key={row._key}
                    className={i % 2 === 1 ? "bg-offwhite" : "bg-white"}
                  >
                    <th
                      scope="row"
                      className="px-6 py-5 align-top text-[15px] font-bold tracking-tight text-navy-900"
                    >
                      {row.situation}
                    </th>
                    <td className="px-6 py-5 align-top">
                      <span className="inline-block rounded-full bg-red-100 px-3.5 py-1 text-[13px] font-bold whitespace-nowrap text-red-600">
                        {row.recommendation}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top text-[15px] leading-relaxed text-grey-700">
                      {row.why}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {section.footnote && (
          <Reveal delay={0.16}>
            <p className="mt-6 text-[15px] leading-relaxed text-grey-500">
              {section.footnote}
            </p>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
