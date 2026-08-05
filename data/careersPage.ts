import type { NavIconName } from "./navigation";
import type { CmsPhoto } from "./services";
import type { IconCardSection, ServiceTestimonialsSection } from "./serviceSections";
import type {
  HomeFinalCtaContent,
  HomeLocationMapContent,
} from "./homePage";

/**
 * Careers-page section stack — FALLBACK for the `careersPage` Sanity
 * singleton (see `sanity/lib/getCareersPage.ts`). Same architecture as the
 * other page stacks. The shipped page matches the owner's WordPress
 * reference exactly: three bands (hero, values, job openings).
 *
 * The hero and values copy is the owner's own hiring voice, transcribed
 * VERBATIM from their reference screenshot (typography normalised — curly
 * apostrophes, en dashes; wording untouched). Note: the reference says
 * "the right guys"; an earlier build deliberately rendered "the right
 * people" (gendered wording in a US job ad) — the verbatim rule wins here,
 * but the owner has been flagged to confirm. Do not reword without them.
 *
 * Job cards stay COLLECTION-driven (`jobPosting` documents; mailto-only
 * apply routes — no form backend). The retired bands from the previous
 * careers page (traits, hiring process, crew reviews, closing CTA) keep
 * their section types + defaults below so Studio can re-add them one-click.
 */

export interface CareersHeroContent {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  photo?: CmsPhoto;
  /**
   * Dark gradient over the background photo for text contrast. Absent means
   * true — only an explicit Studio opt-out turns it off. No photo → the
   * standard navy wash.
   */
  darkOverlay?: boolean;
}

export interface CareerValuesContent {
  eyebrow?: string;
  heading: string;
  items: Array<{ icon: NavIconName; title: string; description: string }>;
}

/** Heading only — the job cards come from the Job Postings collection. */
export interface JobOpeningsContent {
  heading: string;
}

export interface CareerTraitsContent {
  eyebrow: string;
  heading: string;
  description: string;
  traits: Array<{ name: string; gloss: string }>;
  /** Closing line under the grid, rendered in quotes. */
  quote?: string;
}

export interface HiringProcessContent {
  heading: string;
  steps: Array<{ title: string; description: string }>;
}

export interface CareersCtaContent {
  eyebrow: string;
  heading: string;
  description: string;
}

/** Per-type default copy — also the render-time fill for emptied fields. */
export interface CareersPageDefaults {
  hero: CareersHeroContent;
  values: CareerValuesContent;
  jobs: JobOpeningsContent;
  traits: CareerTraitsContent;
  hiringProcess: HiringProcessContent;
  cta: CareersCtaContent;
}

export const careersPageDefaults: CareersPageDefaults = {
  hero: {
    eyebrow: "Fred's Plumbing",
    heading: "Careers at Fred's Plumbing",
    paragraphs: [
      "Fred’s is always looking to opportunistically grow our team. We treat our employees the way we want to be treated. They are paid well, supported, and respected. We keep them busy with work and provide the tools and training for them to be successful.",
      "Hiring priorities & ideal candidate traits: We value character and intangibles over certifications and tenure. We can teach the right guys how to be great multifamily plumbers. Intangibles generally can’t be taught. We want to hire employees that will be plumbers and team members with us for life.",
      "Some core traits: Problem solvers that thrive under pressure, quiet confidence with no ego, strong situational awareness, ownership mindset, and respect for the trade. They take pride in doing the job right, have the curiosity to solve complex plumbing problems, and have integrity when no one is watching. We want team players that are also coachable, we love reliability and consistency, and we value emotional maturity and good judgment. Respect and communication are essential at Fred’s.",
    ],
    // Explicit (not just "absent = on") so the Studio toggle reads true.
    darkOverlay: true,
  },
  values: {
    heading: "A Company That Values Your Growth and Commitment",
    items: [
      {
        icon: "graduation-cap",
        title: "Supportive Career Development",
        description:
          "We provide ongoing training, skill building opportunities, and a work environment that helps you grow professionally and advance confidently.",
      },
      {
        icon: "users",
        title: "Strong Team Culture",
        description:
          "Our team works together with respect, reliability, and clear communication, creating a workplace where everyone feels valued and supported.",
      },
      {
        icon: "shield-check",
        title: "Meaningful Impact",
        description:
          "Every service call helps protect homes, businesses, and communities. Your work makes a real difference and contributes to our reputation for quality and trust.",
      },
    ],
  },
  jobs: {
    heading: "Work With a Company That Invests in Your Success",
  },
  // ——— Retired bands: not in the default stack, re-addable in Studio ———
  traits: {
    eyebrow: "Who Thrives Here",
    heading: "What We Look For",
    description:
      "We value character and intangibles over certifications and tenure. We can teach the right people how to be great multifamily plumbers. Intangibles generally can't be taught. We want to hire employees that will be plumbers and team members with us for life.",
    traits: [
      { name: "Problem solver under pressure", gloss: "Stays methodical when a call goes sideways." },
      { name: "Quiet confidence, no ego", gloss: "Sure of the work without needing to prove it." },
      { name: "Situational awareness", gloss: "Reads the building, the resident, and the job." },
      { name: "Ownership mindset", gloss: "Treats every job as theirs to finish right." },
      { name: "Respect for the trade", gloss: "Takes plumbing seriously as a craft." },
      { name: "Curiosity", gloss: "Wants to know how and why, not just what." },
      { name: "Integrity when no one is watching", gloss: "The work is right even when nobody checks it." },
      { name: "Coachable and consistent", gloss: "Takes feedback and shows up the same every day." },
    ],
    quote: "Respect and communication are essential at Fred's.",
  },
  hiringProcess: {
    heading: "How Hiring Works",
    // PLACEHOLDER outline — confirm the real hiring process with the client.
    steps: [
      {
        title: "Apply",
        description:
          "Email us with a short note about your experience and the role you're after. A résumé helps; a licence number helps more.",
      },
      {
        title: "Talk",
        description:
          "A phone conversation about the work, the properties we serve, and the shift — both directions, you're interviewing us too.",
      },
      {
        title: "Ride along",
        description:
          "A ride-along or shop visit with the crew you'd join, so you see the actual work and the people before deciding.",
      },
      {
        title: "Offer",
        description:
          "An offer, then licence verification and the documentation paperwork to get you on trucks.",
      },
    ],
  },
  cta: {
    eyebrow: "Join the Team",
    heading: "Think You Belong on This Team?",
    description:
      "Send a résumé and a short note about your experience — or call and talk to us directly. Every application gets read by a person.",
  },
};

interface SectionMeta<T extends string> {
  _type: T;
  _key: string;
  /** Hidden in Studio: content kept, section skipped at render. */
  hidden?: boolean;
}

/**
 * The Careers stack's accepted types: the shipped three bands, the retired
 * bands (re-addable), and the shared library types — reused, not forked.
 */
export type CareersSection =
  | (SectionMeta<"careersHero"> & CareersHeroContent)
  | (SectionMeta<"careerValues"> & CareerValuesContent)
  | (SectionMeta<"jobOpenings"> & JobOpeningsContent)
  | (SectionMeta<"careerTraits"> & CareerTraitsContent)
  | (SectionMeta<"hiringProcess"> & HiringProcessContent)
  | (SectionMeta<"careersCta"> & CareersCtaContent)
  | (IconCardSection & { hidden?: boolean })
  | (ServiceTestimonialsSection & { hidden?: boolean })
  | (SectionMeta<"homeLocationMap"> & HomeLocationMapContent)
  | (SectionMeta<"homeFinalCta"> & HomeFinalCtaContent);

export type CareersSectionType = CareersSection["_type"];

/**
 * The shipped /about/careers page, in order — the owner's reference
 * exactly: hero (photo slot empty until uploaded), values, job openings.
 */
export const defaultCareersSections: CareersSection[] = [
  { _type: "careersHero", _key: "hero", ...careersPageDefaults.hero },
  { _type: "careerValues", _key: "values", ...careersPageDefaults.values },
  { _type: "jobOpenings", _key: "jobs", ...careersPageDefaults.jobs },
];
