import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Info, Mail } from "lucide-react";
import { getSite } from "@/sanity/lib/getSite";
import { getJobPosting, getJobPostings } from "@/sanity/lib/getJobs";
import {
  applyHref,
  jobHref,
  EMPLOYMENT_TYPE_LABELS,
  type JobPosting,
} from "@/data/jobs";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { BreadcrumbJsonLd, JobPostingJsonLd } from "@/components/seo/JsonLd";

/**
 * Open roles prerender at build time; a role published in the Studio
 * afterwards generates on first request (ISR). Closed roles aren't in the
 * params list but their URLs still resolve on demand — with a "filled"
 * notice, never a 404 on someone holding the link.
 */
export async function generateStaticParams() {
  const jobs = await getJobPostings();
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobPosting(slug);
  if (!job) return {};

  return {
    title: `${job.title} | Careers | Fred's Plumbing`,
    description: job.summary,
    alternates: { canonical: jobHref(job.slug) },
    // A filled role keeps its page but should drop out of search results.
    ...(job.open ? {} : { robots: { index: false } }),
  };
}

function MetaPills({ job }: { job: JobPosting }) {
  const pills = [
    EMPLOYMENT_TYPE_LABELS[job.employmentType],
    job.team,
    job.shift,
    (job.openings ?? 1) > 1 ? `${job.openings} positions` : undefined,
  ].filter(Boolean) as string[];

  return (
    <ul aria-label="Role details" className="flex flex-wrap gap-2">
      {pills.map((pill) => (
        <li
          key={pill}
          className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white"
        >
          {pill}
        </li>
      ))}
    </ul>
  );
}

function BulletList({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-extrabold tracking-tight text-navy-900">
        {heading}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-grey-700">
            <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-red-600" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobPosting(slug);
  if (!job) notFound();

  const [site, allJobs] = await Promise.all([getSite(), getJobPostings()]);
  const otherJobs = allJobs.filter((other) => other.slug !== job.slug);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/about/careers" },
    { label: job.title, href: jobHref(job.slug) },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {/* Renders null until the role has datePosted AND siteSettings carries
          a full street address — see JobPostingJsonLd. */}
      <JobPostingJsonLd job={job} />

      <section
        aria-labelledby="page-heading"
        className="relative isolate overflow-hidden bg-navy-950"
      >
        <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_10%,rgb(27_48_73/0.9),transparent_70%)]"
        />

        <Container className="relative pt-[120px] pb-14 lg:pt-[170px] lg:pb-20">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-grey-300">
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {i < breadcrumbs.length - 1 ? (
                    <Link
                      href={crumb.href}
                      className="underline-offset-4 hover:text-white hover:underline"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-white">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1
            id="page-heading"
            className="mt-8 max-w-3xl text-[32px] leading-[1.1] font-extrabold tracking-tight text-balance text-white sm:text-[40px] lg:text-[48px]"
          >
            {job.title}
          </h1>
          <div className="mt-6">
            <MetaPills job={job} />
          </div>
        </Container>

        <svg
          aria-hidden="true"
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          className="relative block h-10 w-full text-white sm:h-16"
        >
          <path
            d="M0 64h1440V22C1200 2 960 0 720 12S240 44 0 30v34Z"
            fill="currentColor"
          />
        </svg>
      </section>

      <section aria-label="Role description" className="bg-white py-14 sm:py-20">
        <Container className="grid max-w-[1100px] grid-cols-1 gap-12 lg:grid-cols-[1fr_340px]">
          <div className="max-w-[880px]">
            {!job.open && (
              <Reveal>
                <div className="mb-8 flex items-start gap-3 rounded-xl border border-grey-300 bg-grey-100 p-5">
                  <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-navy-900" />
                  <div>
                    <p className="text-[15px] font-bold text-navy-900">
                      This role has been filled.
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed text-grey-700">
                      The description below is kept for reference. See the{" "}
                      <Link
                        href="/about/careers"
                        className="font-semibold underline underline-offset-4 hover:text-red-600"
                      >
                        current openings
                      </Link>{" "}
                      for roles taking applications now.
                    </p>
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal>
              <p className="text-[18px] leading-relaxed text-grey-700">
                {job.summary}
              </p>
            </Reveal>

            {job.responsibilities && (
              <Reveal delay={0.06}>
                <BulletList heading="What you'll do" items={job.responsibilities} />
              </Reveal>
            )}
            {job.requirements && (
              <Reveal delay={0.06}>
                <BulletList heading="What we're looking for" items={job.requirements} />
              </Reveal>
            )}
            {job.compensationNote && (
              <Reveal delay={0.06}>
                <p className="mt-10 rounded-xl bg-offwhite p-5 text-[15px] font-semibold text-navy-900">
                  {job.compensationNote}
                </p>
              </Reveal>
            )}
          </div>

          <aside aria-label="How to apply">
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-grey-100 bg-white p-7 shadow-(--shadow-card-lg) lg:sticky lg:top-28">
                <h2 className="text-lg font-extrabold tracking-tight text-navy-900">
                  {job.open ? "Apply for this role" : "This role is filled"}
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-grey-500">
                  {job.open
                    ? "Email a résumé and a short note about your experience. Every application gets read by a person."
                    : "Applications for this role are closed — but new openings post here first."}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  {job.open ? (
                    <Button href={applyHref(job, site.email)} className="w-full">
                      <span className="inline-flex items-center gap-2.5">
                        <Mail aria-hidden="true" className="size-[18px]" />
                        Apply Now
                      </span>
                    </Button>
                  ) : (
                    <Button href="/about/careers" variant="dark" className="w-full">
                      <span className="inline-flex items-center gap-2.5">
                        <ArrowLeft aria-hidden="true" className="size-[18px]" />
                        See open roles
                      </span>
                    </Button>
                  )}
                  <Button href={site.phoneHref} variant="secondary" className="w-full">
                    Call {site.phone}
                  </Button>
                </div>
              </div>
            </Reveal>
          </aside>
        </Container>
      </section>

      {otherJobs.length > 0 && (
        <section
          aria-labelledby="other-roles-heading"
          className="bg-offwhite py-14 sm:py-20"
        >
          <Container className="max-w-[1100px]">
            <Reveal>
              <h2
                id="other-roles-heading"
                className="text-2xl font-extrabold tracking-tight text-navy-900"
              >
                Other open roles
              </h2>
            </Reveal>
            <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {otherJobs.map((other, i) => (
                <li key={other.slug}>
                  <Reveal delay={i * 0.06} className="h-full">
                    <Link
                      href={jobHref(other.slug)}
                      className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-grey-100 bg-white p-6 shadow-(--shadow-card) transition-colors hover:border-red-600/40"
                    >
                      <span>
                        <span className="block text-[16px] font-extrabold text-navy-900 group-hover:text-red-600">
                          {other.title}
                        </span>
                        <span className="mt-1 block text-[13px] font-semibold text-grey-500">
                          {[
                            EMPLOYMENT_TYPE_LABELS[other.employmentType],
                            other.team,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-5 shrink-0 text-red-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}
