import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import type { ComparisonTableSection as TableData } from "@/data/serviceSections";

interface ComparisonTableSectionProps {
  section: TableData;
  id: string;
}

const DEFAULT_COLUMN_LABELS: [string, string, string] = [
  "Situation",
  "Typical Recommendation",
  "Why",
];

/**
 * When every column-2 value is short ("Repair", "Repipe") they render as
 * badges; if any is prose-length the whole column renders as plain text so
 * the table stays visually consistent.
 */
const BADGE_MAX_LENGTH = 32;

/**
 * A real <table> — tables extract cleanly for AI search; prose does not.
 * Horizontally scrollable inside its own container on mobile so the page
 * body never scrolls sideways.
 */
export function ComparisonTableSection({ section, id }: ComparisonTableSectionProps) {
  const columnLabels = section.columnLabels ?? DEFAULT_COLUMN_LABELS;
  const useBadges = section.rows.every(
    (row) => row.recommendation.length <= BADGE_MAX_LENGTH,
  );
  const dark = section.background === "dark";
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "relative isolate overflow-hidden py-16 sm:py-24 lg:py-28",
        dark ? "bg-navy-900" : "bg-white",
      )}
    >
      {dark && <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />}
      <Container className="relative max-w-[1000px]">
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            title={section.heading}
            description={section.intro}
            theme={dark ? "dark" : "light"}
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className={cn(
              "mt-10 overflow-x-auto rounded-2xl border",
              dark
                ? "border-white/10 bg-white"
                : "border-grey-100 shadow-(--shadow-card)",
            )}
          >
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="bg-navy-900">
                  {columnLabels.map((label) => (
                    <th
                      key={label}
                      scope="col"
                      className="px-6 py-4 text-[13px] font-bold tracking-[0.1em] text-white uppercase"
                    >
                      {label}
                    </th>
                  ))}
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
                      {useBadges ? (
                        <span className="inline-block rounded-full bg-red-100 px-3.5 py-1 text-[13px] font-bold whitespace-nowrap text-red-600">
                          {row.recommendation}
                        </span>
                      ) : (
                        <span className="text-[15px] leading-relaxed text-grey-700">
                          {row.recommendation}
                        </span>
                      )}
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
            <p
              className={cn(
                "mt-6 text-[15px] leading-relaxed",
                dark ? "text-grey-300" : "text-grey-500",
              )}
            >
              {section.footnote}
            </p>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
