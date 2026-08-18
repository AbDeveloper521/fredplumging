import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import {
  applyHref,
  EMPLOYMENT_TYPE_LABELS,
  type JobPosting,
} from "@/data/jobs";
import type { SiteContent } from "@/data/site";

/**
 * ⚠️ DO NOT "improve" the apply actions into an application form. The lead
 * forms do deliver now (lib/leadDelivery.tsx emails every submission), but
 * that path carries no file upload and no applicant tracking whatsoever, and
 * a résumé upload that silently discards the file is far worse than no form:
 * the applicant loses a career move and the client a hire they never knew
 * applied. Apply routes stay mailto/external until a real backend exists
 * (see GO-LIVE.md).
 *
 * The card shows ONLY title / employment type / summary / Apply — the
 * owner's reference card, by request. Team, shift and openings still exist
 * on jobPosting and render on the role's own page; don't re-add them here.
 * The card deliberately does NOT link to that page (owner's reference has
 * no such link) — /about/careers/[slug] stays for direct URLs and its own
 * JobPosting structured data. Don't re-add a link without the owner asking.
 */

interface JobOpeningsSectionProps {
  jobs: JobPosting[];
  site: SiteContent;
  /** Section heading — overridable from the careers stack item. */
  heading?: string;
  /** Apply-button label — overridable from the careers stack item. */
  applyLabel?: string;
  id?: string;
}

export function JobOpeningsSection({
  jobs,
  site,
  heading = "Work With a Company That Invests in Your Success",
  applyLabel = "Apply Now",
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
            title={heading}
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
                  <article className="flex h-full flex-col rounded-2xl border border-grey-100 bg-white p-7 shadow-(--shadow-card)">
                    <h3 className="text-xl font-extrabold tracking-tight text-navy-900">
                      {job.title}
                    </h3>
                    <p className="mt-2 text-[13px] font-bold text-red-600">
                      {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
                    </p>
                    <p className="mt-4 flex-1 text-[15px] leading-relaxed text-grey-500">
                      {job.summary}
                    </p>
                    <div className="mt-7">
                      <Button href={applyHref(job, site.email)}>
                        <span className="inline-flex items-center gap-2.5">
                          <Mail aria-hidden="true" className="size-[18px]" />
                          {applyLabel}
                        </span>
                      </Button>
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
