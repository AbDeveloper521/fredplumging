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

/** Stable id of the commercial set — a SEPARATE set, never merged into the
    multi-family one: the two pages answer different audiences. */
export const COMMERCIAL_FAQ_SET_ID = "faqSet-commercial";

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
 * The five commercial questions, verbatim as approved.
 *
 * Kept apart from the multi-family set on purpose: these answer a building
 * owner or facilities manager, those answer a property-management company.
 * Q5 states the licence number, which matches `site.licenseNumber` and Site
 * Settings exactly — never retype it from memory.
 */
export const COMMERCIAL_FAQ_SET: FaqSet = {
  title: "Commercial FAQs",
  heading: DEFAULT_FAQ_HEADING,
  items: [
    {
      _key: "property-types",
      question: "What types of commercial properties do you service?",
      answer:
        "We serve commercial and institutional properties across DFW, including retail and shopping centers, office buildings, restaurants and food service, senior care and assisted living facilities, and mixed-use developments. If you manage or own a commercial building in the Metroplex, we can help.",
    },
    {
      _key: "downtime",
      question: "Can you minimize downtime and disruption to our business?",
      answer:
        "Yes. We schedule around your operating hours where possible, including after-hours and weekend work, and we come equipped to diagnose and resolve issues in as few visits as possible. Camera inspection, leak detection, and hydro jetting let us find the actual problem the first time rather than guessing, which limits both cost and downtime.",
    },
    {
      // Backflow certification and gas line work are licence-gated in Texas;
      // this answer repeats what the multi-family set already states. Flagged
      // for the owner to confirm with the client — see UNCONFIRMED_CLAIMS.
      _key: "compliance",
      question:
        "Do you handle backflow testing, grease traps, and code-compliance work?",
      answer:
        "Yes. We handle backflow prevention installation, testing, and certification, grease trap and interceptor service, gas line work, and the compliance documentation these require. Staying current on backflow and grease trap requirements keeps you compliant with local authorities and avoids fines or shut-offs.",
    },
    {
      _key: "emergency-and-projects",
      question:
        "Can you take on both emergency repairs and larger scheduled projects?",
      answer:
        "Both. We respond 24/7 to commercial plumbing emergencies — leaks, stoppages, water heater failures — and we also handle planned work like re-pipes, fixture replacements, PRV and water heater installations, and tenant build-outs. For larger projects we provide a clear scope and estimate up front.",
    },
    {
      _key: "licensed-insured",
      question: "Are you licensed and insured for commercial work?",
      answer:
        "Yes. Fred's Plumbing is licensed by the State of Texas (RMP 44890) and fully insured, with certificates of insurance available on request. All work meets applicable state and municipal plumbing codes.",
    },
  ],
};

/**
 * Service lines that are licence-gated in Texas and appear in published copy.
 * Not a defect — the same claims already ship in the multi-family set — but
 * recorded so they are confirmed with the client deliberately rather than
 * passing unnoticed each time they are repeated.
 */
export const UNCONFIRMED_CLAIMS: ReadonlyArray<{
  claim: string;
  where: string;
  confirmWithClient: string;
}> = [
  {
    claim: "backflow testing and certification",
    where:
      "Commercial FAQs → “Do you handle backflow testing…”; the /commercial services grid; Multi-Family FAQs",
    confirmWithClient:
      "Texas requires a licensed Backflow Prevention Assembly Tester to CERTIFY an assembly. Confirm the business holds a current BPAT licence, or soften “testing and certification” to installation and service only.",
  },
  {
    claim: "gas line installation, repair and pressure testing",
    where: "Commercial FAQs → same answer; the /commercial services grid",
    confirmWithClient:
      "Gas work requires the appropriate state endorsement on the licence. Confirm the endorsement is current, or drop the gas line card and the phrase from the FAQ answer.",
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

/** The commercial FAQ band as a resolved section, for the fallback path. */
export function commercialFaqBand(key = "faq"): FaqBandSection {
  return {
    _type: "faqBand",
    _key: key,
    heading: COMMERCIAL_FAQ_SET.heading ?? DEFAULT_FAQ_HEADING,
    intro: COMMERCIAL_FAQ_SET.intro,
    items: COMMERCIAL_FAQ_SET.items,
  };
}
