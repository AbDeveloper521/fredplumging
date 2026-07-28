import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import {
  applyHref,
  jobHref,
  EMPLOYMENT_TYPE_LABELS,
  type JobPosting,
} from "@/data/jobs";
import type { SiteContent } from "@/data/site";

/**
 * ⚠️ DO NOT "improve" the apply actions into an application form. There is
 * no form backend — submitLead() in lib/validations.ts is a stub — and a
 * résumé upload that silently discards the file is far worse than no form:
 * the applicant loses a career move and the client a hire they never knew
 * applied. Apply routes stay mailto/external until a real backend exists
 * (see GO-LIVE.md).
 */

interface JobOpeningsSectionProps {
  jobs: JobPosting[];
  site: SiteContent;
  id?: string;
}

function MetaPills({ job }: { job: JobPosting }) {
  const pills = [
    EMPLOYMENT_TYPE_LABELS[job.employmentType],
    job.team,
    job.shift,
  ].filter(Boolean) as string[];

  return (
    <ul aria-label="Role details" className="flex flex-wrap gap-2">
      {pills.map((pill) => (
        <li
          key={pill}
          className="rounded-full bg-grey-100 px-3 py-1 text-xs font-bold text-navy-900"
        >
          {pill}
        </li>
      ))}
    </ul>
  );
}

export function JobOpeningsSection({
  jobs,
  site,
  id = "open-roles",
}: JobOpeningsSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-24 bg-offwhite py-16 sm:py-24 lg:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            eyebrow="Open Roles"
            title="Work With a Company That Invests in Your Success"
          />
        </Reveal>

        {jobs.length === 0 ? (
          <Reveal delay={0.08}>
            <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-grey-100 bg-white p-10 text-center shadow-(--shadow-card)">
              <h3 className="text-xl font-extrabold tracking-tight text-navy-900">
                No openings right now
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-grey-500">
                Roles open and fill through the year. If you think you belong
                on this team, send a résumé and a short note anyway — we keep
                strong applications on file.
              </p>
              <div className="mt-7">
                <Button
                  href={`mailto:${site.email}?subject=${encodeURIComponent("Application — general")}`}
                  withArrow
                >
                  Email {site.email}
                </Button>
              </div>
            </div>
          </Reveal>
        ) : (
          <ul className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {jobs.map((job, i) => (
              <li key={job.slug}>
                <Reveal delay={i * 0.08} className="h-full">
                  <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-grey-100 bg-white p-7 shadow-(--shadow-card)">
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-1 bg-red-600"
                    />
                    <h3 className="text-xl font-extrabold tracking-tight text-navy-900">
                      {job.title}
                    </h3>
                    <div className="mt-4">
                      <MetaPills job={job} />
                    </div>
                    {(job.openings ?? 1) > 1 && (
                      <p className="mt-3 text-[13px] font-bold text-red-600">
                        {job.openings} positions
                      </p>
                    )}
                    <p className="mt-4 flex-1 text-[15px] leading-relaxed text-grey-500">
                      {job.summary}
                    </p>
                    <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                      <Button href={applyHref(job, site.email)}>
                        <span className="inline-flex items-center gap-2.5">
                          <Mail aria-hidden="true" className="size-[18px]" />
                          Apply Now
                        </span>
                      </Button>
                      <Link
                        href={jobHref(job.slug)}
                        className="inline-flex items-center gap-1.5 text-[15px] font-bold text-navy-900 underline decoration-red-600/50 underline-offset-4 transition-colors hover:text-red-600"
                      >
                        See the full role
                        <ArrowUpRight aria-hidden="true" className="size-4 text-red-600" />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
