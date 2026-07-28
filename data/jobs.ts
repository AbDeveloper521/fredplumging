/**
 * Open roles, transcribed from Fred's Plumbing's live careers page.
 *
 * As of the careers phase these constants are the FALLBACK: the site reads
 * via `getJobPostings()` in `sanity/lib/getJobs.ts`, which pulls `jobPosting`
 * documents from Sanity and only drops back here if the fetch throws. A
 * successful fetch returning zero roles means the client closed them — the
 * listing shows its empty state and nothing resurrects from this file.
 *
 * RULES FOR THIS FILE
 * - Summaries are the client's own words about their own jobs. Typography
 *   fixes (dashes, spacing) are fine; do not change what a role requires,
 *   promises, or pays.
 * - `responsibilities`, `requirements`, `compensationNote`, `datePosted` and
 *   `validThrough` stay EMPTY until the client supplies them — inventing
 *   bullet points or dates for a real job advertisement is not ours to do.
 * - `employmentType` stores schema.org values (FULL_TIME…) so JobPosting
 *   JSON-LD needs no translation table.
 */

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACTOR"
  | "TEMPORARY";

export const EMPLOYMENT_TYPES: readonly EmploymentType[] = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACTOR",
  "TEMPORARY",
];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACTOR: "Contractor",
  TEMPORARY: "Temporary",
};

export interface JobPosting {
  title: string;
  slug: string;
  employmentType: EmploymentType;
  team?: string;
  shift?: string;
  openings?: number;
  summary: string;
  responsibilities?: string[];
  requirements?: string[];
  compensationNote?: string;
  /** Falls back to `site.email` when empty. */
  applyEmail?: string;
  /** External application page — wins over `applyEmail` when set. */
  applyUrl?: string;
  /** ISO date. Required (with a street address) for Google Jobs markup. */
  datePosted?: string;
  validThrough?: string;
  open: boolean;
}

export function jobHref(slug: string): string {
  return `/about/careers/${slug}`;
}

/**
 * Where "Apply Now" goes. There is NO application form on this site by
 * design — the lead backend is a stub, and an application that silently
 * vanishes costs someone a career move. External `applyUrl` wins; otherwise
 * a mailto with the role in the subject, falling back to the main inbox.
 */
export function applyHref(job: JobPosting, fallbackEmail: string): string {
  if (job.applyUrl) return job.applyUrl;
  const email = job.applyEmail ?? fallbackEmail;
  return `mailto:${email}?subject=${encodeURIComponent(`Application — ${job.title}`)}`;
}

export const jobPostings: JobPosting[] = [
  {
    title: "Apprentice Plumber",
    slug: "apprentice-plumber",
    employmentType: "FULL_TIME",
    team: "Field Operations",
    openings: 2,
    summary:
      "Fred's Plumbing is seeking two reliable, hard-working Apprentice Plumbers to join our growing Field Operations team. In this hands-on role, you'll assist in core plumbing tasks, contribute to the installation and repair of plumbing systems, and gain invaluable experience in the multifamily-commercial plumbing space. We're not just hiring workers — we're developing the next generation of plumbing professionals through mentorship, training, and a strong team culture. If you're coachable, curious, and committed to doing things the right way, this is the place for you.",
    open: true,
  },
  {
    title: "Journeyman Plumber",
    slug: "journeyman-plumber",
    employmentType: "FULL_TIME",
    team: "Field Operations",
    openings: 5,
    summary:
      "Fred's Plumbing is looking to hire five experienced Journeyman Plumbers to join our trusted Field Operations team. In this full-time, hands-on role, you'll lead multifamily plumbing projects, provide expert repairs, and ensure all work is completed efficiently, professionally, and to code. This is more than just a job — it's a long-term career opportunity with a company that truly values its people. If you're confident without ego, a problem-solver under pressure, and passionate about plumbing, we want to hear from you.",
    open: true,
  },
  {
    title: "Emergency OT Technician",
    slug: "emergency-ot-technician",
    employmentType: "FULL_TIME",
    team: "Service",
    shift: "Evening shift · 4 PM – 12 AM",
    openings: 1,
    summary:
      "Fred's Plumbing is seeking a dependable and experienced Emergency Overtime Plumber to support our high-volume service team during after-hours and urgent calls. This full-time position is ideal for a licensed Journeyman who thrives under pressure and is available for our evening shift (4 PM – 12 AM). If you're ready to be the go-to plumber when emergencies strike — and be well compensated for it — this is the role for you.",
    open: true,
  },
];
