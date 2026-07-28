import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logEmpty, logFallback } from "@/sanity/lib/fallbackLog";
import { JOB_POSTINGS_QUERY, JOB_POSTING_QUERY } from "@/sanity/queries";
import {
  jobPostings as fallbackJobs,
  EMPLOYMENT_TYPES,
  type EmploymentType,
  type JobPosting,
} from "@/data/jobs";

/** Cache tag invalidated by the /api/revalidate webhook. */
export const JOB_TAG = "jobPosting";

type RawJob = {
  title: string | null;
  slug: string | null;
  employmentType: string | null;
  team: string | null;
  shift: string | null;
  openings: number | null;
  summary: string | null;
  responsibilities: string[] | null;
  requirements: string[] | null;
  compensationNote: string | null;
  applyEmail: string | null;
  applyUrl: string | null;
  datePosted: string | null;
  validThrough: string | null;
  open: boolean | null;
};

function toJob(item: RawJob): JobPosting | null {
  if (!item.title || !item.slug || !item.summary) return null;
  return {
    title: item.title,
    slug: item.slug,
    employmentType: (EMPLOYMENT_TYPES as readonly string[]).includes(
      item.employmentType ?? "",
    )
      ? (item.employmentType as EmploymentType)
      : "FULL_TIME",
    team: item.team ?? undefined,
    shift: item.shift ?? undefined,
    openings: item.openings ?? undefined,
    summary: item.summary,
    responsibilities: item.responsibilities?.length
      ? item.responsibilities
      : undefined,
    requirements: item.requirements?.length ? item.requirements : undefined,
    compensationNote: item.compensationNote ?? undefined,
    applyEmail: item.applyEmail ?? undefined,
    applyUrl: item.applyUrl ?? undefined,
    datePosted: item.datePosted ?? undefined,
    validThrough: item.validThrough ?? undefined,
    open: item.open !== false,
  };
}

/**
 * Open roles ordered by the client-controlled `order` field.
 * FAILED fetch → static fallback (loud). Successful EMPTY result → empty
 * array: if the client closes their last role, the careers page must show
 * "no openings right now", not resurrect a filled job from a static file and
 * take applications for it.
 */
export async function getJobPostings(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<JobPosting[]> {
  let result: RawJob[];
  try {
    result = await fetchSanityCached(JOB_POSTINGS_QUERY, {}, JOB_TAG, options);
  } catch (error) {
    logFallback({
      fetcher: "getJobPostings",
      fallbackFile: "data/jobs.ts",
      affects: "/about/careers listing + role pages",
      error,
    });
    return fallbackJobs.filter((job) => job.open);
  }

  const jobs = result
    .map(toJob)
    .filter((job): job is JobPosting => job !== null);
  if (jobs.length === 0) {
    logEmpty("getJobPostings", "the careers page shows its no-openings state.");
  }
  return jobs;
}

/** Single role for /about/careers/[slug] — closed roles included. Null = 404. */
export async function getJobPosting(
  slug: string,
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<JobPosting | null> {
  try {
    const result = await fetchSanityCached(
      JOB_POSTING_QUERY,
      { slug },
      JOB_TAG,
      options,
    );
    return result ? toJob(result) : null;
  } catch (error) {
    logFallback({
      fetcher: `getJobPosting(${slug})`,
      fallbackFile: "data/jobs.ts",
      affects: `/about/careers/${slug}`,
      error,
    });
    return fallbackJobs.find((job) => job.slug === slug) ?? null;
  }
}
