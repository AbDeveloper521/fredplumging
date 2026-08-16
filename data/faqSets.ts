/**
 * Shared FAQ sets — the fallback twin of the `faqSet` Sanity documents, and
 * the home of the `faqBand` section type that renders one.
 *
 * The point of a SET is that the same questions appear on many pages from ONE
 * place: /multifamily and every /multifamily/[slug] page all reference
 * "Multi-Family FAQs", so a corrected answer is a single edit in Studio, not
 * seven. Do not copy these questions into individual page stacks.
 *
 * ⚠️ TWO ANSWERS ARE DELIBERATELY UNQUANTIFIED (see `UNQUANTIFIED_ANSWERS`).
 * The owner's draft carried bracketed placeholders for a response-time
 * commitment and insurance limits. Both are commitments a licensed plumbing
 * contractor is held to, so the copy below states what is true without
 * inventing a figure. Filling them in is a Studio edit once the client
 * supplies the real numbers — never a guess, here or anywhere else.
 */

export interface FaqItem {
  _key: string;
  question: string;
  answer: string;
}

/** A reusable set of questions — one `faqSet` document in Sanity. */
export interface FaqSet {
  /** Internal name, shown only in Studio. */
  title: string;
  /** Public band heading; a page may override it per placement. */
  heading?: string;
  /** Optional line under the heading. */
  intro?: string;
  items: FaqItem[];
}

/**
 * The rendered shape, after the mapper has resolved either mode (a referenced
 * set or inline items) into the same thing. Renderer:
 * `components/sections/FaqBandSection.tsx`.
 */
export interface FaqBandSection {
  _type: "faqBand";
  _key: string;
  heading: string;
  intro?: string;
  items: FaqItem[];
  hidden?: boolean;
}

/** Used when neither the set nor the placement supplies one. */
export const DEFAULT_FAQ_HEADING = "Frequently Asked Questions";

/** Stable id of the shared multi-family set, in Sanity and in the seeder. */
export const MULTIFAMILY_FAQ_SET_ID = "faqSet-multifamily";

/**
 * The six multi-family questions, verbatim as approved.
 *
 * `_key`s are deliberate and stable so the seeder writes the same keys the
 * fallback uses — a diff in Studio then reads as a content change, not as
 * every item being replaced.
 */
export const MULTIFAMILY_FAQ_SET: FaqSet = {
  title: "Multi-Family FAQs",
  heading: DEFAULT_FAQ_HEADING,
  items: [
    {
      _key: "vendor-systems",
      question:
        "Do you work directly with property management companies and approved vendor systems?",
      answer:
        "Yes. Fred's Plumbing is an active, compliant vendor across the major property management platforms, with current insurance, background checks, and safety documentation on file. We work directly with property managers, regional maintenance supervisors, and ownership groups, and we can be added to your approved vendor list quickly. A certificate of insurance is available on request.",
    },
    {
      // ⚠️ Awaiting the client's real response-time commitment — see
      // UNQUANTIFIED_ANSWERS. True as written; do not add a figure here.
      _key: "emergency-response",
      question:
        "How quickly can you respond to an emergency at one of our communities?",
      answer:
        "We provide 24/7 emergency response across the DFW Metroplex. Because we focus on multi-family and commercial properties, our crews are used to unit floods, main-line stoppages, and after-hours calls that can't wait until morning.",
    },
    {
      _key: "multi-unit-scale",
      question:
        "Can you handle work across multiple units and buildings, not just a single repair?",
      answer:
        "Yes. We're built for multi-unit work — from a single unit turn to a full-property re-pipe, trap primer replacement, or riser repair across an entire building. We coordinate scheduling with your on-site staff to keep resident disruption and unit access issues to a minimum, and we can phase larger projects to fit your operations and budget.",
    },
    {
      _key: "billing",
      question: "How do you handle billing and invoicing for property managers?",
      answer:
        "We invoice through the systems property managers already use, with clear, itemized documentation for every job so you can approve, track, and expense work without chasing paperwork. We're set up for both one-off dispatch and ongoing volume across a portfolio of communities.",
    },
    {
      // ⚠️ Awaiting the client's real coverage limits — see
      // UNQUANTIFIED_ANSWERS. Confirms coverage exists without stating limits
      // nobody approved. The licence number matches `site.licenseNumber`.
      _key: "licensed-insured",
      question:
        "Are your plumbers licensed and insured for multi-family work in Texas?",
      answer:
        "Yes. Fred's Plumbing is licensed by the State of Texas (RMP 44890) and carries general liability and workers' compensation coverage; a certificate of insurance is available on request. All work is performed to state and local plumbing code, which matters for habitability, inspections, and protecting the owner from liability.",
    },
    {
      _key: "preventative-maintenance",
      question: "Do you offer preventative maintenance, or only repairs?",
      answer:
        "Both. Beyond emergency and repair work, we offer preventative maintenance — drain and sewer jetting, water heater service, backflow testing, and system inspections — that reduces emergency call volume and extends the life of your property's plumbing. For portfolios, a scheduled maintenance program is usually cheaper over a year than paying per-emergency.",
    },
  ],
};

/**
 * The two answers still waiting on a real number from the client. Kept as
 * data, not a code comment, so the gap is greppable and can be surfaced in a
 * report or an audit script rather than remembered.
 */
export const UNQUANTIFIED_ANSWERS: ReadonlyArray<{
  itemKey: string;
  missing: string;
  askTheClient: string;
}> = [
  {
    itemKey: "emergency-response",
    missing: "response-time commitment",
    askTheClient:
      "What response time will the business actually commit to for after-hours emergencies? Once confirmed, add it to the answer in Studio (FAQ Sets → Multi-Family FAQs).",
  },
  {
    itemKey: "licensed-insured",
    missing: "insurance coverage limits",
    askTheClient:
      "What are the general liability and workers' compensation limits on the current certificate of insurance? Once confirmed, add them to the answer in Studio (FAQ Sets → Multi-Family FAQs).",
  },
];

/**
 * The multi-family FAQ band as a resolved section, for the fallback path —
 * what renders when Sanity is unreachable or a page has no published stack.
 * `key` differs per page only so duplicated DOM ids can't collide.
 */
export function multifamilyFaqBand(key = "faq"): FaqBandSection {
  return {
    _type: "faqBand",
    _key: key,
    heading: MULTIFAMILY_FAQ_SET.heading ?? DEFAULT_FAQ_HEADING,
    intro: MULTIFAMILY_FAQ_SET.intro,
    items: MULTIFAMILY_FAQ_SET.items,
  };
}
