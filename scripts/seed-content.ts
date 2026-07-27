/**
 * Seed script — run with:  npm run seed -- --confirm
 *
 * Creates published Sanity documents from every data/*.ts fallback constant,
 * so the CMS starts in exact agreement with the fallbacks and
 * `npm run check:drift` is silent from day one.
 *
 * Safety:
 *  - Requires the explicit `--confirm` flag before writing anything.
 *  - Refuses to run against a dataset that already contains any of our
 *    document types unless `--force` is ALSO passed (protects real client
 *    edits from being overwritten by a stray run).
 *  - Idempotent: deterministic document IDs mean re-running updates the same
 *    documents instead of duplicating them.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (an "Editor" token — Viewer cannot
 * write). Create it at sanity.io/manage → API → Tokens. It is read ONLY by
 * scripts/, never by application code.
 */
import { getCliClient } from "sanity/cli";
import { site, serviceAreaCities } from "../data/site";
import {
  STATIC_NAVIGATION,
  STATIC_FOOTER_NAVIGATION,
  STATIC_TRUST_LOGOS,
} from "../data/navigation";
import { faqs } from "../data/faqs";
import { testimonials } from "../data/testimonials";
import { services } from "../data/services";
import { industries } from "../data/industries";

const DOC_TYPES = [
  "siteSettings",
  "navigation",
  "faq",
  "testimonial",
  "service",
  "industry",
  "trustLogo",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Short placeholder Portable Text body so the rich rendering is visible. */
function placeholderBody(title: string) {
  return [
    {
      _type: "block",
      _key: "seed-h2",
      style: "h2",
      markDefs: [],
      children: [
        { _type: "span", _key: "seed-h2-span", text: `About ${title}`, marks: [] },
      ],
    },
    {
      _type: "block",
      _key: "seed-p",
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: "seed-p-span",
          text: `This is placeholder content. Replace it in the Studio with real copy about ${title.toLowerCase()} — what's included, how scheduling works, and why property managers choose us.`,
          marks: [],
        },
      ],
    },
    {
      _type: "callout",
      _key: "seed-callout",
      heading: "Need help right away?",
      text: "A live dispatcher answers around the clock — describe the problem and we'll get a technician moving.",
      showPhoneButton: true,
    },
  ];
}

/**
 * The reference section stack for /services/plumbing. Copy marked VERBATIM in
 * the build brief is transcribed from the client's existing page; the rest is
 * approved placeholder copy. [BRACKETED] fragments are business facts nobody
 * on the build side may invent — the client replaces them in the Studio.
 */
function plumbingSections() {
  return [
    {
      _type: "serviceHero",
      _key: "seed-hero",
      eyebrow: "FRED'S PLUMBING",
      heading: "Plumbing Services In The Dallas–Fort Worth Metroplex",
      subheading:
        "Fred's Plumbing provides high-quality plumbing solutions for multi-family and commercial properties throughout the Dallas–Fort Worth Metroplex. From complex system installations to routine repairs, our licensed plumbers deliver precise, reliable work that keeps your property running smoothly.",
      secondaryCtaLabel: "Request a Property Assessment",
      secondaryCtaHref: "/contact",
      credentials: [
        { _type: "credential", _key: "seed-cred-1", icon: "shield-check", label: "Licensed & Insured" },
        { _type: "credential", _key: "seed-cred-2", icon: "map-pin", label: "Serving DFW Since 1996" },
        { _type: "credential", _key: "seed-cred-3", icon: "clock", label: "24/7 Emergency Response" },
      ],
      photoSubject:
        "A Fred's Plumbing technician working on commercial pipework in a mechanical room — vertical orientation",
    },
    {
      _type: "serviceAbout",
      _key: "seed-about",
      heading: "About Our Plumbing Services",
      paragraphs: [
        "Since 1996, Fred's Plumbing has been trusted by property managers, facility owners, and investors throughout the Dallas–Fort Worth Metroplex. Our technicians are fully licensed, insured, and trained to meet the highest safety and quality standards.",
        "We handle every aspect of plumbing repair and installation for large-scale residential and commercial buildings. Whether replacing pipes, repairing leaks, or upgrading outdated systems, we use advanced tools and proven methods to deliver long-lasting performance.",
      ],
      ctaLabel: "Talk to Our Team",
      ctaHref: "/contact",
      photoSubjectPrimary:
        "Close-up of a technician's gloved hands soldering copper pipe under a commercial sink",
      photoSubjectSecondary:
        "The Fred's Plumbing crew standing in front of a branded service van",
    },
    {
      _type: "whatsIncluded",
      _key: "seed-included",
      heading: "What Our Plumbing Service Covers",
      intro:
        "Fred's Plumbing handles the full scope of plumbing work for commercial and multi-family properties — one contractor, one point of contact, from diagnosis to code-compliant completion.",
      items: [
        {
          _type: "item",
          _key: "seed-inc-1",
          icon: "droplets",
          title: "Slab Leak Detection & Repair",
          description:
            "Advanced leak detection and repair techniques that prevent structural damage and stop costly water loss beneath concrete foundations.",
          href: "#repair-or-replace",
        },
        {
          _type: "item",
          _key: "seed-inc-2",
          icon: "wrench",
          title: "Piping Repair & Replacement",
          description:
            "From copper to PEX, we repair, replace, and install plumbing pipes for projects across DFW.",
          href: "#warning-signs",
        },
        {
          _type: "item",
          _key: "seed-inc-3",
          icon: "building-2",
          title: "Commercial Installs & Replacements",
          description:
            "Plumbing equipment installation and replacement for multi-unit buildings and offices — efficient and code-compliant every time.",
          href: "#how-we-work",
        },
        {
          _type: "item",
          _key: "seed-inc-4",
          icon: "flame",
          title: "Water Heater Systems",
          description:
            "Repair, replacement, and scheduled maintenance for commercial-grade and multi-unit water heating systems.",
        },
        {
          _type: "item",
          _key: "seed-inc-5",
          icon: "shield-check",
          title: "Backflow & Code Compliance",
          description:
            "Backflow prevention, testing, and the documentation your property needs to stay compliant.",
          href: "/services/specialty-services",
        },
        {
          _type: "item",
          _key: "seed-inc-6",
          icon: "calendar-check",
          title: "Preventive Maintenance Programs",
          description:
            "Scheduled inspections that catch small problems before they become tenant complaints or emergency calls.",
          href: "/services/maintenance",
        },
      ],
    },
    {
      _type: "signsYouNeed",
      _key: "seed-signs",
      heading: "Signs Your Property Needs a Plumber",
      cards: [
        {
          _type: "card",
          _key: "seed-sign-1",
          icon: "gauge",
          question: "Are tenants reporting low water pressure on upper floors?",
          answer:
            "Pressure loss in a multi-story building usually points to scale buildup, a failing booster pump, or a hidden leak. Fred's Plumbing diagnoses the cause with flow testing before recommending any repair.",
        },
        {
          _type: "card",
          _key: "seed-sign-2",
          icon: "droplets",
          question: "Is your water bill rising with no change in occupancy?",
          answer:
            "An unexplained increase almost always means water is escaping somewhere — often beneath the slab. Early leak detection costs far less than foundation repair.",
        },
        {
          _type: "card",
          _key: "seed-sign-3",
          icon: "waves",
          question: "Do drains gurgle or back up in multiple units at once?",
          answer:
            "Simultaneous backups indicate a main line problem, not a unit-level clog. That's a building-system issue that needs commercial-grade equipment to resolve.",
        },
        {
          _type: "card",
          _key: "seed-sign-4",
          icon: "flame",
          question: "Is your water heater more than ten years old?",
          answer:
            "Commercial water heaters near end-of-life fail suddenly and expensively. A planned replacement costs less than an emergency one and avoids tenant downtime.",
        },
      ],
      ctaLabel: "Describe Your Issue — Get a Callback",
      ctaHref: "/contact",
    },
    {
      _type: "processSteps",
      _key: "seed-process",
      heading: "How We Work With Property Managers",
      steps: [
        {
          _type: "step",
          _key: "seed-step-1",
          title: "Assess",
          description:
            "We inspect the issue on-site, document what we find, and give you a clear written scope before any work begins.",
        },
        {
          _type: "step",
          _key: "seed-step-2",
          title: "Quote",
          description:
            "You get a line-item quote with no surprise charges — approved by you before we schedule.",
        },
        {
          _type: "step",
          _key: "seed-step-3",
          title: "Schedule Around Tenants",
          description:
            "We coordinate access with your office and work in occupied buildings with minimal disruption.",
        },
        {
          _type: "step",
          _key: "seed-step-4",
          title: "Complete & Document",
          description:
            "Work is finished to code, the site is left clean, and you receive documentation for your property records.",
        },
      ],
    },
    {
      _type: "comparisonTable",
      _key: "seed-table",
      heading: "Repair or Replace? How We Advise Property Owners",
      rows: [
        {
          _type: "row",
          _key: "seed-row-1",
          situation: "Pinhole leak in one copper line",
          recommendation: "Repair",
          why: "Isolated corrosion can be cut out and replaced without touching the rest of the system.",
        },
        {
          _type: "row",
          _key: "seed-row-2",
          situation: "Repeated leaks across multiple lines",
          recommendation: "Repipe",
          why: "Recurring failures mean the system is corroding building-wide; patching becomes more expensive than replacement.",
        },
        {
          _type: "row",
          _key: "seed-row-3",
          situation: "Water heater under 8 years, single fault",
          recommendation: "Repair",
          why: "Most components are serviceable and the tank has useful life remaining.",
        },
        {
          _type: "row",
          _key: "seed-row-4",
          situation: "Water heater over 10 years or tank failure",
          recommendation: "Replace",
          why: "Tank failure is not repairable, and units this age cost more to run than to replace.",
        },
        {
          _type: "row",
          _key: "seed-row-5",
          situation: "Slab leak, first occurrence",
          recommendation: "Targeted repair with reroute",
          why: "A single reroute avoids breaking the slab while isolating the failed section.",
        },
      ],
      footnote:
        "Every recommendation comes with a written explanation — Fred's Plumbing quotes the option that makes financial sense for the property, not the biggest ticket.",
    },
    {
      _type: "serviceTrust",
      _key: "seed-trust",
      heading: "Trusted Plumbing Professionals Across The DFW Metroplex",
      items: [
        {
          _type: "item",
          _key: "seed-trust-1",
          icon: "award",
          title: "Proven Experience",
          description:
            "Over 30 years of delivering reliable plumbing solutions to commercial and multi-family properties across Dallas and Fort Worth.",
        },
        {
          _type: "item",
          _key: "seed-trust-2",
          icon: "clock",
          title: "Fast Response Times",
          description:
            "Our 24/7 emergency service ensures you get immediate help whenever you need it.",
        },
        {
          _type: "item",
          _key: "seed-trust-3",
          icon: "cog",
          title: "Advanced Technology",
          description:
            "We use modern equipment for diagnostics, leak detection, and repairs to ensure precision and minimize disruption.",
        },
      ],
      showLogos: true,
    },
    {
      _type: "serviceTestimonials",
      _key: "seed-reviews",
      heading: "What Our Clients Say",
    },
    {
      _type: "propertyTypes",
      _key: "seed-properties",
      heading: "Built for the Properties You Manage",
      cards: [
        {
          _type: "card",
          _key: "seed-prop-1",
          icon: "building",
          title: "Apartments",
          blurb: "High-occupancy systems, unit-turn plumbing, and building-wide maintenance.",
          slug: "apartments",
        },
        {
          _type: "card",
          _key: "seed-prop-2",
          icon: "hotel",
          title: "Condos",
          blurb: "HOA-ready documentation and owner-coordinated scheduling.",
          slug: "condos",
        },
        {
          _type: "card",
          _key: "seed-prop-3",
          icon: "heart-handshake",
          title: "Assisted Living",
          blurb: "Code-sensitive work completed around residents who can't relocate.",
          slug: "assisted-living",
        },
        {
          _type: "card",
          _key: "seed-prop-4",
          icon: "stethoscope",
          title: "Nursing Homes",
          blurb: "Health-code compliant plumbing with zero-downtime planning.",
          slug: "nursing-homes",
        },
      ],
    },
    {
      _type: "serviceFaq",
      _key: "seed-faq",
      heading: "Plumbing Service Questions, Answered",
      faqs: [
        {
          _type: "faq",
          _key: "seed-faq-1",
          question: "Do you work on occupied apartment buildings?",
          answer:
            "Yes. Fred's Plumbing works in occupied multi-family buildings every week. We coordinate access through your management office, post notices where required, and sequence work to keep water shutoffs short and scheduled.",
        },
        {
          _type: "faq",
          _key: "seed-faq-2",
          question: "How fast can you respond to a plumbing emergency?",
          answer:
            "Fred's Plumbing answers emergency calls 24/7 across the Dallas–Fort Worth Metroplex. [RESPONSE-TIME COMMITMENT — do not invent; client to confirm]",
        },
        {
          _type: "faq",
          _key: "seed-faq-3",
          question: "Are you licensed and insured for commercial work?",
          answer:
            "Yes. Fred's Plumbing is licensed by the State of Texas (RMP 44890) and fully insured for commercial and multi-family plumbing work.",
        },
        {
          _type: "faq",
          _key: "seed-faq-4",
          question: "Do you provide documentation for property records?",
          answer:
            "Yes. Every completed job includes written documentation of the work performed, suitable for HOA boards, owners, and compliance files.",
        },
        {
          _type: "faq",
          _key: "seed-faq-5",
          question: "Can you quote a recurring maintenance contract?",
          answer:
            "Yes. Fred's Plumbing offers scheduled preventive maintenance programs for multi-family and commercial properties. Contact us with your property size and we'll prepare a program quote.",
        },
        {
          _type: "faq",
          _key: "seed-faq-6",
          question: "Which areas do you serve?",
          answer:
            "Fred's Plumbing serves commercial and multi-family clients across Dallas, Fort Worth, Arlington, Irving, Plano, Garland, Grand Prairie, and surrounding North Texas areas.",
        },
      ],
    },
    {
      _type: "serviceArea",
      _key: "seed-area",
      heading: "Proudly Serving The Entire Dallas–Fort Worth Metroplex",
      body:
        "Fred's Plumbing serves commercial and multi-family clients across Dallas, Fort Worth, Arlington, Irving, Plano, Garland, Grand Prairie, and surrounding areas. Wherever you manage property in North Texas, our experienced team is ready to help.",
      photoSubject: "Dallas or Fort Worth skyline at dusk",
    },
    {
      _type: "relatedServices",
      _key: "seed-related",
      heading: "Related Services",
      serviceSlugs: ["emergency-plumbing", "drain-sewer", "maintenance"],
    },
    {
      _type: "finalCta",
      _key: "seed-final",
      heading: "Get a Plumbing Partner Your Properties Can Count On",
      body:
        "One call covers every building you manage — emergency response, scheduled maintenance, and code-compliant installs across the DFW Metroplex.",
      secondaryCtaLabel: "Request a Quote",
      secondaryCtaHref: "/contact",
    },
  ];
}

/**
 * Section stack for /services/drain-sewer — leaner than the plumbing
 * reference (9 sections). Copy marked VERBATIM in the build brief is
 * transcribed from the client's existing drain-and-sewer page; [BRACKETED]
 * fragments are facts nobody on the build side may invent.
 */
function drainSewerSections() {
  return [
    {
      _type: "serviceHero",
      _key: "seed-hero",
      eyebrow: "FRED'S PLUMBING",
      heading: "Drain And Sewer Services In The Dallas–Fort Worth Metroplex",
      subheading:
        "Fred's Plumbing provides expert drain and sewer solutions for multi-family and commercial properties across the Dallas–Fort Worth Metroplex. From inspections and cleanings to emergency repairs, our team is equipped to keep your systems flowing safely and efficiently.",
      secondaryCtaLabel: "Book a Camera Inspection",
      secondaryCtaHref: "/contact",
      credentials: [
        { _type: "credential", _key: "seed-cred-1", icon: "shield-check", label: "Licensed & Insured" },
        { _type: "credential", _key: "seed-cred-2", icon: "map-pin", label: "Serving DFW Since 1996" },
        { _type: "credential", _key: "seed-cred-3", icon: "clock", label: "24/7 Emergency Response" },
      ],
      photoSubject:
        "A technician feeding a sewer camera line into a cleanout at a commercial property — vertical orientation",
    },
    {
      _type: "serviceAbout",
      _key: "seed-about",
      heading: "About Our Drain And Sewer Services",
      paragraphs: [
        "Fred's Plumbing specializes in drain and sewer services designed for the demanding needs of apartments, condos, assisted living communities, and commercial buildings. Our technicians use advanced equipment that allows us to diagnose problems accurately and complete repairs with minimal disruption.",
        "We understand how drain and sewer issues impact resident comfort, property safety, and long-term infrastructure health. Whether you are dealing with blockages, backups, or aging sewer lines, we provide efficient and reliable solutions that restore full functionality and prevent future issues.",
      ],
      ctaLabel: "Talk to Our Team",
      ctaHref: "/contact",
      photoSubjectPrimary: "A storm drain grate set in cobblestones, leaves around it",
      photoSubjectSecondary: "The Fred's Plumbing crew in front of a branded van",
    },
    {
      _type: "whatsIncluded",
      _key: "seed-included",
      heading: "What Our Drain & Sewer Service Covers",
      intro:
        "From a single slow drain to a building-wide main line failure, Fred's Plumbing handles diagnosis, cleaning, and repair with one crew and one point of contact.",
      items: [
        {
          _type: "item",
          _key: "seed-inc-1",
          icon: "gauge",
          title: "Sewer Camera Inspection",
          description:
            "Camera inspection technology that identifies blockages, cracks, and structural issues within your sewer lines quickly and accurately.",
        },
        {
          _type: "item",
          _key: "seed-inc-2",
          icon: "wrench",
          title: "Sewer Line Repair & Cleaning",
          description:
            "Professional sewer line cleaning and targeted repairs that eliminate buildup and fix damaged sections before they cause major failures.",
        },
        {
          _type: "item",
          _key: "seed-inc-3",
          icon: "droplets",
          title: "Drain Inspection",
          description:
            "Property-wide drain inspection that locates hidden problems and confirms your plumbing systems are performing the way they should.",
        },
        {
          _type: "item",
          _key: "seed-inc-4",
          icon: "siren",
          title: "Backup Clearing & Cleanup",
          description:
            "When a backup occurs, our technicians act fast to clear blockages, restore flow, and prevent health and safety risks for tenants and staff.",
        },
        {
          _type: "item",
          _key: "seed-inc-5",
          icon: "waves",
          title: "Hydrojetting",
          description:
            "High-pressure water jetting that removes stubborn buildup from pipes without damaging the system.",
        },
        {
          _type: "item",
          _key: "seed-inc-6",
          icon: "calendar-check",
          title: "Preventive Drain Maintenance",
          description:
            "Scheduled cleanings and camera checks that keep main lines clear — planned around your budget, not around emergencies.",
          href: "/services/maintenance",
        },
      ],
    },
    {
      _type: "signsYouNeed",
      _key: "seed-signs",
      heading: "Signs Your Property Has a Drain or Sewer Problem",
      cards: [
        {
          _type: "card",
          _key: "seed-sign-1",
          icon: "waves",
          question: "Do multiple units back up at the same time?",
          answer:
            "Simultaneous backups mean the problem is in the building main, not a single unit. Clearing one fixture won't fix it — the main line needs commercial-grade clearing.",
        },
        {
          _type: "card",
          _key: "seed-sign-2",
          icon: "building-2",
          question: "Is there a sewer smell in hallways or parking areas?",
          answer:
            "Persistent sewer gas usually points to a dried trap, a venting fault, or a cracked line under the property. A camera inspection finds the source without digging.",
        },
        {
          _type: "card",
          _key: "seed-sign-3",
          icon: "gauge",
          question: "Are drains slow across a whole floor or wing?",
          answer:
            "Widespread slow drainage is a buildup problem in shared lines. Hydrojetting restores full pipe diameter — snaking alone only punches a temporary hole.",
        },
        {
          _type: "card",
          _key: "seed-sign-4",
          icon: "droplets",
          question: "Do you see soggy ground or unusually green patches outside?",
          answer:
            "Both can indicate a leaking sewer lateral saturating the soil. Left alone, it undermines pavement and foundations.",
        },
      ],
      ctaLabel: "Describe Your Issue — Get a Callback",
      ctaHref: "/contact",
    },
    {
      _type: "processSteps",
      _key: "seed-process",
      heading: "How a Drain & Sewer Call Works",
      steps: [
        {
          _type: "step",
          _key: "seed-step-1",
          title: "Camera First",
          description:
            "We scope the line before quoting, so the diagnosis is based on what's actually in the pipe — not a guess.",
        },
        {
          _type: "step",
          _key: "seed-step-2",
          title: "Show You the Footage",
          description:
            "You see what we see. Every recommendation comes with the recorded evidence behind it.",
        },
        {
          _type: "step",
          _key: "seed-step-3",
          title: "Clear or Repair",
          description:
            "From hydrojetting to sectional repair, we fix the actual cause — scheduled around tenant access.",
        },
        {
          _type: "step",
          _key: "seed-step-4",
          title: "Verify & Document",
          description:
            "A post-work camera pass confirms the line is clear, and you get the footage and report for your records.",
        },
      ],
    },
    {
      _type: "serviceTrust",
      _key: "seed-trust",
      heading: "Trusted Drain And Sewer Specialists In The DFW Metroplex",
      items: [
        {
          _type: "item",
          _key: "seed-trust-1",
          icon: "award",
          title: "Proven Experience",
          description:
            "Decades of experience handling complex drain and sewer issues for multi-family and commercial properties across Dallas and Fort Worth.",
        },
        {
          _type: "item",
          _key: "seed-trust-2",
          icon: "clock",
          title: "Fast Response Times",
          description:
            "Emergency service available day and night for backups, clogs, and sewer line failures.",
        },
        {
          _type: "item",
          _key: "seed-trust-3",
          icon: "cog",
          title: "Modern Diagnostic Technology",
          description:
            "We use advanced inspection and cleaning equipment to deliver accurate results and long-lasting repairs.",
        },
      ],
      showLogos: true,
    },
    {
      _type: "serviceFaq",
      _key: "seed-faq",
      heading: "Drain & Sewer Questions, Answered",
      faqs: [
        {
          _type: "faq",
          _key: "seed-faq-1",
          question: "What's the difference between snaking and hydrojetting?",
          answer:
            "Snaking punches a hole through a clog; hydrojetting scours the full pipe wall clean. Fred's Plumbing recommends snaking for simple single-fixture clogs and hydrojetting when buildup affects shared or main lines.",
        },
        {
          _type: "faq",
          _key: "seed-faq-2",
          question: "Can you inspect sewer lines without digging?",
          answer:
            "Yes. Fred's Plumbing runs camera inspections through existing cleanouts, locating cracks, roots, and bellies in the line with no excavation.",
        },
        {
          _type: "faq",
          _key: "seed-faq-3",
          question: "How often should a multi-family property have drains cleaned?",
          answer:
            "[MAINTENANCE-INTERVAL RECOMMENDATION — client to confirm; do not invent a schedule]",
        },
        {
          _type: "faq",
          _key: "seed-faq-4",
          question: "Do you handle after-hours sewage backups?",
          answer:
            "Yes. Fred's Plumbing answers emergency calls 24/7 across the Dallas–Fort Worth Metroplex — backups are health hazards and we treat them as priority calls.",
        },
        {
          _type: "faq",
          _key: "seed-faq-5",
          question: "Will tenants lose water during sewer work?",
          answer:
            "Usually no. Most drain and sewer work doesn't require shutting off the water supply, and when a shutoff is needed, Fred's Plumbing schedules it with your office and keeps it short.",
        },
      ],
    },
    {
      _type: "relatedServices",
      _key: "seed-related",
      heading: "Related Services",
      serviceSlugs: ["plumbing", "emergency-plumbing", "maintenance"],
    },
    {
      _type: "finalCta",
      _key: "seed-final",
      heading: "Stop Chasing Backups. Start Preventing Them.",
      body:
        "One call covers inspection, clearing, repair, and a maintenance plan for every property you manage in the DFW Metroplex.",
      secondaryCtaLabel: "Request a Quote",
      secondaryCtaHref: "/contact",
    },
  ];
}

/**
 * Compliance table for /services/specialty-services — CONFIGURED BUT HELD
 * BACK. Every regulatory cell is a [BRACKETED] fact only the client can
 * supply, and a compliance table full of visible placeholders must not go
 * live. Once the client fills the brackets below, add
 * `specialtyComplianceTable()` to the specialty section array after the
 * whatsIncluded entry and re-seed.
 */
export function specialtyComplianceTable() {
  return {
    _type: "comparisonTable",
    _key: "seed-compliance",
    heading: "Compliance Requirements at a Glance",
    rows: [
      {
        _type: "row",
        _key: "seed-comp-1",
        situation: "Backflow preventer",
        recommendation: "[TESTING FREQUENCY — client/jurisdiction to confirm]",
        why: "Certified testing, tagging, and submission of results. [AUTHORITY — e.g. city water utility, client to confirm]",
      },
      {
        _type: "row",
        _key: "seed-comp-2",
        situation: "Commercial boiler",
        recommendation: "[INSPECTION REQUIREMENT — client to confirm]",
        why: "Inspection-ready maintenance and repair records. [AUTHORITY — client to confirm]",
      },
      {
        _type: "row",
        _key: "seed-comp-3",
        situation: "Gas lines",
        recommendation: "[TESTING/PERMIT REQUIREMENT — client to confirm]",
        why: "Leak detection, pressure testing, and documented repairs. [AUTHORITY — client to confirm]",
      },
    ],
    footnote:
      "Requirements vary by city and property type — Fred's Plumbing tracks what applies to your buildings so you don't have to.",
  };
}

/**
 * Section stack for /services/specialty-services (backflow, boilers, gas
 * lines). Safety rule for this page: gas content is strictly
 * "call a licensed professional" framed — no copy may imply DIY gas work.
 * "Certified"/"licensed" appear only in copy transcribed VERBATIM from the
 * client's existing page.
 */
function specialtyServicesSections() {
  return [
    {
      _type: "serviceHero",
      _key: "seed-hero",
      eyebrow: "FRED'S PLUMBING",
      heading: "Specialty Plumbing Services In The Dallas–Fort Worth Metroplex",
      subheading:
        "Fred's Plumbing provides advanced specialty services for multi-family and commercial properties throughout the Dallas–Fort Worth Metroplex. Our team handles complex plumbing systems with precision, safety, and the expertise required to support high-demand environments.",
      secondaryCtaLabel: "Schedule a Compliance Check",
      secondaryCtaHref: "/contact",
      credentials: [
        { _type: "credential", _key: "seed-cred-1", icon: "shield-check", label: "Licensed & Insured" },
        { _type: "credential", _key: "seed-cred-2", icon: "map-pin", label: "Serving DFW Since 1996" },
        { _type: "credential", _key: "seed-cred-3", icon: "clock", label: "24/7 Emergency Response" },
      ],
      photoSubject:
        "A technician testing a commercial backflow preventer assembly in a mechanical room — vertical orientation",
    },
    {
      _type: "serviceAbout",
      _key: "seed-about",
      heading: "About Our Specialty Plumbing Services",
      paragraphs: [
        "Fred's Plumbing provides specialized services designed to meet the needs of multi-family and commercial properties. Our technicians are trained to handle critical systems that require strict oversight, compliance, and technical accuracy.",
        "From backflow prevention to commercial boiler work, we use advanced diagnostic tools and industry-approved methods to deliver safe and reliable solutions. Whether your property needs inspection, repair, or replacement, our team ensures your systems remain code compliant and fully operational.",
      ],
      ctaLabel: "Talk to Our Team",
      ctaHref: "/contact",
      photoSubjectPrimary: "Close-up of gauges on a commercial boiler",
      photoSubjectSecondary: "The Fred's Plumbing crew in front of a branded van",
    },
    {
      _type: "whatsIncluded",
      _key: "seed-included",
      heading: "What Our Specialty Services Cover",
      intro:
        "These are the systems where mistakes are expensive and compliance is not optional — Fred's Plumbing handles them with trained technicians and full documentation.",
      items: [
        {
          _type: "item",
          _key: "seed-inc-1",
          icon: "shield-check",
          title: "Backflow Testing & Prevention",
          description:
            "Comprehensive backflow testing, repair, replacement, and installation that keeps your property compliant with local and state requirements while protecting your water supply from contamination.",
        },
        {
          _type: "item",
          _key: "seed-inc-2",
          icon: "gauge",
          title: "Commercial Boiler Services",
          description:
            "Repair, maintenance, and complete boiler system installation for properties that rely on consistent hot water and heat — experienced with both modern and legacy systems.",
        },
        {
          _type: "item",
          _key: "seed-inc-3",
          icon: "flame",
          title: "Gas Line Services",
          description:
            "Expert gas leak detection, system testing, and precise pipe repair to ensure optimal safety and compliance, with 24/7 emergency response for urgent gas leak issues.",
        },
        {
          _type: "item",
          _key: "seed-inc-4",
          icon: "award",
          title: "Compliance Documentation",
          description:
            "Test reports and service records delivered after every job — ready for city inspectors, insurers, and property files.",
        },
        {
          _type: "item",
          _key: "seed-inc-5",
          icon: "cog",
          title: "System Upgrades & Replacements",
          description:
            "When legacy equipment reaches end of life, we plan and execute replacements with minimal downtime for residents.",
        },
        {
          _type: "item",
          _key: "seed-inc-6",
          icon: "siren",
          title: "Emergency Response for Critical Systems",
          description:
            "Boiler failures and suspected gas leaks are answered 24/7 — these are the calls that can't wait for morning.",
          href: "/services/emergency-plumbing",
        },
      ],
    },
    // specialtyComplianceTable() goes here once the client fills its brackets.
    {
      _type: "processSteps",
      _key: "seed-process",
      heading: "How Specialty Work Gets Done",
      steps: [
        {
          _type: "step",
          _key: "seed-step-1",
          title: "Inspect & Test",
          description:
            "We evaluate the system against current code and its actual condition — not just the symptom that triggered the call.",
        },
        {
          _type: "step",
          _key: "seed-step-2",
          title: "Report & Recommend",
          description:
            "You get written findings and a clear recommendation: repair, replace, or monitor.",
        },
        {
          _type: "step",
          _key: "seed-step-3",
          title: "Perform to Code",
          description:
            "Work is completed by trained technicians using industry-approved methods, scheduled around your residents.",
        },
        {
          _type: "step",
          _key: "seed-step-4",
          title: "Document & File",
          description:
            "Every job closes with the paperwork your property needs — test tags, service records, and compliance reports.",
        },
      ],
    },
    {
      _type: "serviceTrust",
      _key: "seed-trust",
      heading: "Trusted Specialty Plumbing Experts In The DFW Metroplex",
      items: [
        {
          _type: "item",
          _key: "seed-trust-1",
          icon: "award",
          title: "Certified Specialists",
          description:
            "Our team is trained and certified to handle backflow systems, boilers, and high-demand plumbing infrastructure for large properties.",
        },
        {
          _type: "item",
          _key: "seed-trust-2",
          icon: "clock",
          title: "Fast Emergency Response",
          description:
            "We are available 24 hours a day to resolve complex issues that impact safety and system functionality.",
        },
        {
          _type: "item",
          _key: "seed-trust-3",
          icon: "cog",
          title: "Accurate Diagnostics",
          description:
            "Our advanced tools and inspection methods ensure precise troubleshooting and long-lasting repair solutions.",
        },
      ],
      showLogos: true,
    },
    {
      _type: "serviceFaq",
      _key: "seed-faq",
      heading: "Specialty Service Questions, Answered",
      faqs: [
        {
          // Safety framing is deliberate and non-negotiable: utility first,
          // evacuate, never DIY. Do not soften into a sales-only answer.
          _type: "faq",
          _key: "seed-faq-1",
          question: "What should I do if I smell gas at my property?",
          answer: `Leave the area, keep others away, and call your gas utility's emergency line first — then call Fred's Plumbing at ${site.phone} for 24/7 leak detection and repair. Never attempt to locate a gas leak yourself.`,
        },
        {
          _type: "faq",
          _key: "seed-faq-2",
          question: "What is backflow testing and why does my property need it?",
          answer:
            "Backflow testing verifies that the device preventing contaminated water from flowing back into the drinking supply is working. Water utilities require it for commercial and multi-family properties, and Fred's Plumbing handles the test, the tag, and the paperwork.",
        },
        {
          _type: "faq",
          _key: "seed-faq-3",
          question: "Do you work on older boiler systems?",
          answer:
            "Yes. Fred's Plumbing services both modern and legacy boiler systems — many DFW properties run equipment that's decades old, and our technicians are experienced with both.",
        },
        {
          _type: "faq",
          _key: "seed-faq-4",
          question: "Will specialty work disrupt my residents?",
          answer:
            "Fred's Plumbing schedules inspections and planned work through your management office and sequences it to keep any service interruption short and announced in advance.",
        },
        {
          _type: "faq",
          _key: "seed-faq-5",
          question: "Can you handle all our properties' compliance testing on a schedule?",
          answer:
            "Yes. Fred's Plumbing offers scheduled compliance programs across multiple properties, so testing deadlines are tracked and met without your office chasing them.",
        },
      ],
    },
    {
      _type: "relatedServices",
      _key: "seed-related",
      heading: "Related Services",
      serviceSlugs: ["maintenance", "emergency-plumbing", "commercial-plumbing"],
    },
    {
      _type: "finalCta",
      _key: "seed-final",
      heading: "Keep Your Critical Systems Compliant and Running",
      body:
        "Backflow, boilers, and gas lines — one contractor who tests, fixes, and files the paperwork for every property you manage in the DFW Metroplex.",
      secondaryCtaLabel: "Request a Quote",
      secondaryCtaHref: "/contact",
    },
  ];
}

/**
 * Section stack for /services/maintenance. This page sells an ongoing
 * PROGRAM, not one-time repairs — copy frames benefits as program-membership
 * benefits (priority scheduling, tracked deadlines, budgeting). "Backflow
 * Plus Plan" and "Boiler Plus Plan" are the client's existing product names
 * (VERBATIM). Pricing, terms, visit frequency, and review cadence are
 * [BRACKETED] client-only facts.
 */
function maintenanceSections() {
  return [
    {
      _type: "serviceHero",
      _key: "seed-hero",
      eyebrow: "FRED'S PLUMBING",
      heading: "Plumbing Maintenance Services In The Dallas–Fort Worth Metroplex",
      subheading:
        "Fred's Plumbing provides ongoing maintenance programs designed to protect multi-family and commercial properties throughout the Dallas–Fort Worth Metroplex. Our preferred customer plans offer proactive care, priority service, and long-term savings for properties that rely on safe, efficient, and fully compliant plumbing systems.",
      secondaryCtaLabel: "Get a Program Quote",
      secondaryCtaHref: "/contact",
      credentials: [
        { _type: "credential", _key: "seed-cred-1", icon: "shield-check", label: "Licensed & Insured" },
        { _type: "credential", _key: "seed-cred-2", icon: "map-pin", label: "Serving DFW Since 1996" },
        { _type: "credential", _key: "seed-cred-3", icon: "clock", label: "24/7 Emergency Response" },
      ],
      photoSubject:
        "A technician with a clipboard inspecting copper supply lines in a well-lit commercial mechanical room — vertical orientation",
    },
    {
      _type: "serviceAbout",
      _key: "seed-about",
      heading: "About Our Maintenance Services",
      paragraphs: [
        "Plumbing systems in multi-family and commercial properties experience constant use, which increases the risk of leaks, breakdowns, and compliance failures. Our maintenance services are designed to anticipate problems before they disrupt your property, saving you time, money, and operational stress.",
        "Through detailed inspections, scheduled service, and specialized testing, our maintenance plans keep your plumbing systems functioning at peak performance. By choosing one of our Preferred Customer Programs, you gain ongoing protection, priority scheduling, and consistent support from a team that understands the needs of large-scale properties.",
      ],
      ctaLabel: "Talk to Our Team",
      ctaHref: "/contact",
      photoSubjectPrimary:
        "Neatly organized copper and PEX piping runs in a commercial mechanical room",
      photoSubjectSecondary: "The Fred's Plumbing crew in front of a branded van",
    },
    {
      _type: "whatsIncluded",
      _key: "seed-included",
      heading: "What Our Maintenance Programs Cover",
      intro:
        "Every Preferred Customer Program is built around one idea: find problems on a schedule you control, instead of at 2 AM on a holiday weekend.",
      items: [
        {
          _type: "item",
          _key: "seed-inc-1",
          icon: "shield-check",
          title: "Backflow Plus Plan",
          description:
            "Annual testing, inspection, and compliance checks that keep your backflow prevention systems safe and fully operational. We monitor scheduling deadlines, complete required documentation, and handle repairs quickly to maintain water safety and regulatory compliance year-round.",
          href: "/services/specialty-services",
        },
        {
          _type: "item",
          _key: "seed-inc-2",
          icon: "gauge",
          title: "Boiler Plus Plan",
          description:
            "Regular boiler inspections, performance checks, cleaning, and maintenance for properties that rely on consistent hot water and heat — reducing unexpected breakdowns and extending equipment lifespan.",
          href: "/services/specialty-services",
        },
        {
          _type: "item",
          _key: "seed-inc-3",
          icon: "calendar-check",
          title: "Scheduled Property Inspections",
          description:
            "Routine walkthroughs of supply lines, drains, water heaters, and fixtures across your buildings — documented every visit.",
        },
        {
          _type: "item",
          _key: "seed-inc-4",
          icon: "clock",
          title: "Deadline Tracking",
          description:
            "Compliance testing dates tracked by our office, not yours. We schedule before deadlines, not after notices.",
        },
        {
          _type: "item",
          _key: "seed-inc-5",
          icon: "siren",
          title: "Priority Emergency Response",
          description:
            "Program members go to the front of the line when something does break — including nights and weekends.",
          href: "/services/emergency-plumbing",
        },
        {
          _type: "item",
          _key: "seed-inc-6",
          icon: "award",
          title: "Maintenance Records & Reporting",
          description:
            "A service history for every property, ready for owners, boards, insurers, and inspectors.",
        },
      ],
    },
    {
      _type: "comparisonTable",
      _key: "seed-table",
      heading: "Reactive Repairs vs. A Maintenance Program",
      columnLabels: [
        "Situation",
        "Without a Program",
        "With a Preferred Customer Program",
      ],
      rows: [
        {
          _type: "row",
          _key: "seed-row-1",
          situation: "A water heater starts failing",
          recommendation:
            "Discovered when tenants lose hot water; emergency rates and same-day scrambling",
          why: "Caught at inspection; replacement planned and budgeted in advance",
        },
        {
          _type: "row",
          _key: "seed-row-2",
          situation: "Backflow test deadline",
          recommendation:
            "Tracked by your office; a missed date risks fines or water shutoff",
          why: "Tracked and scheduled by Fred's Plumbing before the deadline",
        },
        {
          _type: "row",
          _key: "seed-row-3",
          situation: "Small leak in a mechanical room",
          recommendation:
            "Found when it reaches a ceiling below; drywall, mold, and tenant claims",
          why: "Found on a routine walkthrough; fixed the same visit",
        },
        {
          _type: "row",
          _key: "seed-row-4",
          situation: "Emergency call on a weekend",
          recommendation: "Standard queue",
          why: "Priority scheduling ahead of non-program calls",
        },
        {
          _type: "row",
          _key: "seed-row-5",
          situation: "Annual plumbing spend",
          recommendation: "Unpredictable spikes",
          why: "Steady, budgetable, and typically lower over time",
        },
      ],
      footnote:
        "Maintenance doesn't eliminate emergencies — it makes them rare, small, and never a surprise.",
    },
    {
      _type: "processSteps",
      _key: "seed-process",
      heading: "How a Maintenance Program Starts",
      steps: [
        {
          _type: "step",
          _key: "seed-step-1",
          title: "Property Assessment",
          description:
            "We walk your buildings and document the current condition of every plumbing system — the baseline your program is built on.",
        },
        {
          _type: "step",
          _key: "seed-step-2",
          title: "Custom Program Design",
          description:
            "You get a plan matched to your properties' age, equipment, and compliance obligations — not a one-size template.",
        },
        {
          _type: "step",
          _key: "seed-step-3",
          title: "Scheduled Service Begins",
          description:
            "Visits happen on the calendar we agree, coordinated with your office, with findings reported after each one.",
        },
        {
          _type: "step",
          _key: "seed-step-4",
          title: "Review & Adjust",
          description:
            "We review the service history with you [REVIEW CADENCE — client to confirm] and adjust the program as your portfolio changes.",
        },
      ],
    },
    {
      _type: "serviceTrust",
      _key: "seed-trust",
      heading: "Trusted Maintenance Professionals In The DFW Metroplex",
      items: [
        {
          _type: "item",
          _key: "seed-trust-1",
          icon: "siren",
          title: "Priority Response",
          description:
            "Maintenance customers receive faster scheduling and top priority for emergency service calls in Dallas and Fort Worth.",
        },
        {
          _type: "item",
          _key: "seed-trust-2",
          icon: "award",
          title: "Long-Term Savings",
          description:
            "Routine inspections and preventive care reduce costly repairs and extend the life of your plumbing systems.",
        },
        {
          _type: "item",
          _key: "seed-trust-3",
          icon: "shield-check",
          title: "Expert Oversight",
          description:
            "Our experienced technicians deliver consistent, high-quality maintenance based on decades of serving multi-family and commercial properties.",
        },
      ],
      showLogos: true,
    },
    {
      _type: "serviceFaq",
      _key: "seed-faq",
      heading: "Maintenance Program Questions, Answered",
      faqs: [
        {
          _type: "faq",
          _key: "seed-faq-1",
          question: "What does a plumbing maintenance program cost?",
          answer:
            "[PRICING APPROACH — client to confirm; do not invent numbers or ranges. Frame around how pricing is determined — property count, equipment, visit frequency — once the client supplies specifics.]",
        },
        {
          _type: "faq",
          _key: "seed-faq-2",
          question: "What does 'priority service' actually mean?",
          answer:
            "Program members are scheduled ahead of non-program calls, including for emergencies. [SPECIFIC COMMITMENT — client to confirm whether this includes a response-time target.]",
        },
        {
          _type: "faq",
          _key: "seed-faq-3",
          question: "Can one program cover multiple properties?",
          answer:
            "Yes. Fred's Plumbing builds programs across entire portfolios, with per-property records and a single point of contact for your whole account.",
        },
        {
          _type: "faq",
          _key: "seed-faq-4",
          question: "Do maintenance visits disturb tenants?",
          answer:
            "Rarely. Most inspection work happens in mechanical rooms and common areas. When unit access is needed, Fred's Plumbing coordinates notice through your management office.",
        },
        {
          _type: "faq",
          _key: "seed-faq-5",
          question: "We already call a plumber when something breaks — why change?",
          answer:
            "Reactive-only service means every problem is discovered at its most expensive stage. A program finds the same problems earlier, when they're small, scheduled, and budgeted — and it moves you to the front of the line when a real emergency happens.",
        },
      ],
    },
    {
      _type: "relatedServices",
      _key: "seed-related",
      heading: "Related Services",
      serviceSlugs: ["specialty-services", "emergency-plumbing", "commercial-plumbing"],
    },
    {
      _type: "finalCta",
      _key: "seed-final",
      heading: "Stop Budgeting for Surprises",
      body:
        "A Preferred Customer Program puts every property you manage on a schedule — inspected, documented, compliant, and first in line when it matters.",
      secondaryCtaLabel: "Request a Quote",
      secondaryCtaHref: "/contact",
    },
  ];
}

/**
 * Section stack for /services/emergency-plumbing — deliberately SHORTER
 * (8 sections): many visitors have an active emergency, so the number and
 * the what-to-do-now steps sit in the first two screens. Tone rule: urgency
 * without alarmism. Crisis-guidance copy covers ONLY shutoff valves and
 * breakers — gas, sewage contact, and structural water route to "call us".
 */
function emergencyPlumbingSections() {
  return [
    {
      _type: "serviceHero",
      _key: "seed-hero",
      eyebrow: "FRED'S PLUMBING",
      heading: "Emergency Plumbing Services In The Dallas–Fort Worth Metroplex",
      subheading:
        "Fred's Plumbing provides around-the-clock emergency plumbing services for multi-family and commercial properties throughout the Dallas–Fort Worth Metroplex. When leaks, backups, or system failures threaten your property, our licensed technicians respond quickly with the skill and equipment needed to protect your residents and minimize damage.",
      phoneCtaLabel: "Emergency? Call {phone}",
      secondaryCtaLabel: "Request Non-Urgent Service",
      secondaryCtaHref: "/contact",
      showAvailabilityDot: true,
      credentials: [
        { _type: "credential", _key: "seed-cred-1", icon: "clock", label: "Answered 24/7/365" },
        { _type: "credential", _key: "seed-cred-2", icon: "shield-check", label: "Licensed & Insured" },
        { _type: "credential", _key: "seed-cred-3", icon: "map-pin", label: "Serving All of DFW" },
      ],
      photoSubject:
        "A technician's hands closing a main water shutoff valve — vertical orientation",
    },
    {
      _type: "serviceAbout",
      _key: "seed-about",
      heading: "About Our Emergency Plumbing Services",
      paragraphs: [
        "Emergency plumbing situations can disrupt daily operations, impact resident comfort, and cause costly damage. Fred's Plumbing has extensive experience handling urgent issues for apartments, condos, assisted living communities, student housing, nursing homes, and commercial facilities. Our emergency team understands the importance of immediate response and accurate diagnostics in these environments.",
        "We use advanced tools and proven repair methods to address emergencies quickly and effectively. From burst pipes and flooding to sewer backups and major leaks, our technicians deliver reliable solutions that protect your property and prevent further damage. When you need help fast, our team is ready to respond.",
      ],
      ctaLabel: "Talk to Our Team",
      ctaHref: "/contact",
      photoSubjectPrimary:
        "Copper and PVC supply lines in a mechanical room, tools laid out mid-job",
      photoSubjectSecondary: "The Fred's Plumbing crew in front of a branded van",
    },
    {
      // Crisis guidance sits high on purpose — what to do before the truck
      // arrives. Copy stays within shutoff valves and breakers only.
      _type: "processSteps",
      _key: "seed-process",
      heading: "What to Do While We're On the Way",
      steps: [
        {
          _type: "step",
          _key: "seed-step-1",
          title: "Stop the Water",
          description:
            "Close the nearest shutoff valve, or the building main if you can reach it safely. Every minute of flow is damage.",
        },
        {
          _type: "step",
          _key: "seed-step-2",
          title: "Kill Power to Affected Areas",
          description:
            "If water is near outlets, appliances, or electrical panels, shut off the breaker for that area — don't touch electrics standing in water.",
        },
        {
          _type: "step",
          _key: "seed-step-3",
          title: "Call Us",
          description: `Call ${site.phone} and tell us what you see. We'll tell you what to do next for your specific situation and dispatch a technician.`,
        },
        {
          _type: "step",
          _key: "seed-step-4",
          title: "Clear and Document",
          description:
            "Move what you can out of the water's path and photograph the damage — your insurer will want the pictures.",
        },
      ],
    },
    {
      _type: "whatsIncluded",
      _key: "seed-included",
      heading: "Emergencies We Respond To",
      intro:
        "If it can't wait until morning, it's our call to take. Fred's Plumbing dispatches for:",
      items: [
        {
          _type: "item",
          _key: "seed-inc-1",
          icon: "droplets",
          title: "Burst Pipes & Major Leaks",
          description:
            "Supply-line failures that are actively flooding units, ceilings, or mechanical rooms.",
        },
        {
          _type: "item",
          _key: "seed-inc-2",
          icon: "waves",
          title: "Sewer Backups",
          description:
            "Sewage in units or common areas — a health hazard we treat as a priority dispatch.",
        },
        {
          _type: "item",
          _key: "seed-inc-3",
          icon: "building-2",
          title: "Building-Wide Water Loss",
          description:
            "No water across a floor or building — diagnosis and restoration as fast as the failure allows.",
        },
        {
          _type: "item",
          _key: "seed-inc-4",
          icon: "gauge",
          title: "Water Heater Failures",
          description:
            "Tank ruptures and total hot-water loss for properties that can't leave residents without it.",
        },
        {
          _type: "item",
          _key: "seed-inc-5",
          icon: "siren",
          title: "Flooding & Drainage Emergencies",
          description:
            "Water rising where it shouldn't be, from storm backflow to failed sump systems.",
        },
        {
          // Utility-first framing is non-negotiable, same as the specialty page.
          _type: "item",
          _key: "seed-inc-6",
          icon: "flame",
          title: "Suspected Gas Leaks",
          description:
            "Leave the area and call your gas utility's emergency line first — then call us for detection and repair.",
          href: "/services/specialty-services",
        },
      ],
    },
    {
      _type: "serviceTrust",
      _key: "seed-trust",
      heading: "Trusted Emergency Plumbing Professionals In The DFW Metroplex",
      items: [
        {
          _type: "item",
          _key: "seed-trust-1",
          icon: "clock",
          title: "Immediate Response",
          description:
            "Our technicians are available 24 hours a day to handle urgent plumbing issues throughout Dallas and Fort Worth.",
        },
        {
          _type: "item",
          _key: "seed-trust-2",
          icon: "award",
          title: "Experienced Team",
          description:
            "We bring decades of knowledge to every emergency, allowing us to diagnose and resolve issues with precision.",
        },
        {
          _type: "item",
          _key: "seed-trust-3",
          icon: "cog",
          title: "Advanced Equipment",
          description:
            "Our tools and inspection technology help us identify problems quickly and complete repairs that last.",
        },
      ],
      showLogos: true,
    },
    {
      _type: "serviceFaq",
      _key: "seed-faq",
      heading: "Emergency Service Questions, Answered",
      faqs: [
        {
          _type: "faq",
          _key: "seed-faq-1",
          question: "How fast can you get to my property?",
          answer:
            "Fred's Plumbing answers emergency calls 24/7 across the Dallas–Fort Worth Metroplex. [RESPONSE-TIME COMMITMENT — client to confirm; do not invent.]",
        },
        {
          // If the client declines to answer publicly, DELETE this question
          // rather than publish a dodge.
          _type: "faq",
          _key: "seed-faq-2",
          question: "Do you charge more for nights and weekends?",
          answer:
            "[AFTER-HOURS PRICING POLICY — client to confirm; do not invent. If the client declines to answer publicly, drop this question rather than publish a dodge.]",
        },
        {
          _type: "faq",
          _key: "seed-faq-3",
          question: "What counts as a plumbing emergency?",
          answer:
            "Anything actively causing damage or a health risk: burst pipes, sewage backups, flooding, total water loss, or a suspected gas leak. If you're unsure, call — Fred's Plumbing will tell you honestly whether it can wait for a scheduled visit.",
        },
        {
          _type: "faq",
          _key: "seed-faq-4",
          question: "Can you handle emergencies in occupied buildings?",
          answer:
            "Yes. Most of Fred's Plumbing's emergency work is in occupied multi-family properties — technicians contain the problem first, then coordinate access and cleanup with your management office.",
        },
        {
          _type: "faq",
          _key: "seed-faq-5",
          question: "Should we set something up before an emergency happens?",
          answer:
            "It helps. Maintenance program members get priority emergency scheduling, and having your property's shutoff locations documented in advance saves critical minutes.",
          href: "/services/maintenance",
          linkLabel: "See Maintenance Programs",
        },
      ],
    },
    {
      _type: "relatedServices",
      _key: "seed-related",
      heading: "Related Services",
      serviceSlugs: ["maintenance", "drain-sewer", "specialty-services"],
    },
    {
      _type: "finalCta",
      _key: "seed-final",
      heading: "It's an Emergency. We're Already Awake.",
      body:
        "One number reaches a licensed DFW emergency crew — day, night, weekend, or holiday.",
      phoneCtaLabel: "Call {phone} — Available Now",
      showAvailabilityDot: true,
      secondaryCtaLabel: "Ask About Priority Response",
      secondaryCtaHref: "/contact",
    },
  ];
}

/**
 * Section stack for /multifamily/apartments — the first industry-document
 * page on the section library. Industry framing: "we understand YOUR
 * property type"; the what's-included section routes outward to the service
 * pages instead of re-explaining each service. The class-segmentation grid
 * (Class A/B/C/garden-style) is the centerpiece, high on the page.
 */
function apartmentsSections() {
  return [
    {
      _type: "serviceHero",
      _key: "seed-hero",
      eyebrow: "FRED'S PLUMBING",
      heading: "Apartment Plumbing Services In The Dallas Fort Worth Metroplex",
      subheading:
        "From high-rise towers to garden-style communities, Fred's Plumbing keeps apartment properties across DFW running — repairs, maintenance, and emergency response built for multi-unit buildings.",
      secondaryCtaLabel: "Get a Portfolio Quote",
      secondaryCtaHref: "/contact",
      credentials: [
        { _type: "credential", _key: "seed-cred-1", icon: "shield-check", label: "Licensed & Insured" },
        { _type: "credential", _key: "seed-cred-2", icon: "map-pin", label: "Serving DFW Since 1996" },
        { _type: "credential", _key: "seed-cred-3", icon: "clock", label: "24/7 Emergency Response" },
      ],
      photoSubject:
        "Exterior of a modern mid-rise apartment community at golden hour — vertical orientation",
    },
    {
      // The centerpiece: class segmentation, in the audience's own vocabulary.
      // Informational cards (no slugs), one CTA under the grid — the
      // reference page's four identical "GET STARTED" links are exactly the
      // duplicate-label pattern the build standards ban.
      _type: "propertyTypes",
      _key: "seed-classes",
      heading: "Plumbing Solutions For Every Type Of Apartment Property",
      background: "white",
      cards: [
        {
          _type: "card",
          _key: "seed-class-a",
          icon: "building-2",
          title: "Class A High Rise and Skyscraper Apartments",
          blurb:
            "Advanced plumbing expertise for vertical systems, pressure management, and centralized infrastructure.",
          photoSubject: "Glass high-rise apartment tower against a blue sky",
        },
        {
          _type: "card",
          _key: "seed-class-b",
          icon: "building",
          title: "Class B Mid Rise Communities",
          blurb:
            "Consistent plumbing support that balances efficiency, durability, and minimal resident disruption.",
          photoSubject: "Three-story garden apartment building with landscaped lawn",
        },
        {
          _type: "card",
          _key: "seed-class-c",
          icon: "building",
          title: "Class C and Legacy Properties",
          blurb:
            "Targeted repairs and upgrades for aging systems to improve reliability and reduce recurring issues.",
          photoSubject: "Older two-story brick apartment complex",
        },
        {
          _type: "card",
          _key: "seed-class-garden",
          icon: "hotel",
          title: "Single Story and Garden Style Apartments",
          blurb:
            "Reliable service for properties with shared underground lines and high demand usage.",
          photoSubject: "Single-story garden-style apartment court with walkways",
        },
      ],
      ctaLabel: "Tell Us About Your Property",
      ctaHref: "/contact",
    },
    {
      // The outward router — each row links to its full service page.
      _type: "whatsIncluded",
      _key: "seed-included",
      heading: "What We Handle for Apartment Communities",
      intro:
        "One contractor for everything behind the walls — each of these links to the full service:",
      items: [
        {
          _type: "item",
          _key: "seed-inc-1",
          icon: "wrench",
          title: "Unit & Building Plumbing Repairs",
          description:
            "Leaks, fixtures, supply lines, and unit-turn plumbing across your buildings.",
          href: "/services/plumbing",
        },
        {
          _type: "item",
          _key: "seed-inc-2",
          icon: "waves",
          title: "Drain & Sewer Service",
          description:
            "Main-line clearing, hydrojetting, and camera inspections for shared lines.",
          href: "/services/drain-sewer",
        },
        {
          _type: "item",
          _key: "seed-inc-3",
          icon: "siren",
          title: "24/7 Emergency Response",
          description:
            "Burst pipes, backups, and floods — answered around the clock.",
          href: "/services/emergency-plumbing",
        },
        {
          _type: "item",
          _key: "seed-inc-4",
          icon: "calendar-check",
          title: "Preventive Maintenance Programs",
          description:
            "Scheduled inspections and priority service across your portfolio.",
          href: "/services/maintenance",
        },
        {
          _type: "item",
          _key: "seed-inc-5",
          icon: "shield-check",
          title: "Backflow, Boilers & Gas",
          description:
            "Compliance testing and critical-system work, documented for your records.",
          href: "/services/specialty-services",
        },
        {
          _type: "item",
          _key: "seed-inc-6",
          icon: "building-2",
          title: "Commercial Common Areas",
          description:
            "Clubhouses, pools, laundry rooms, and leasing offices.",
          href: "/services/commercial-plumbing",
        },
      ],
    },
    {
      _type: "signsYouNeed",
      _key: "seed-signs",
      heading: "Problems Apartment Managers Bring Us Most",
      background: "dark",
      cards: [
        {
          _type: "card",
          _key: "seed-sign-1",
          icon: "clock",
          question: "Are unit turns stalled waiting on plumbing?",
          answer:
            "Slow make-ready plumbing costs you rent days. Fred's Plumbing schedules unit-turn work in batches so vacant units get back on the market fast.",
        },
        {
          _type: "card",
          _key: "seed-sign-2",
          icon: "waves",
          question: "Is one riser or stack causing repeat complaints?",
          answer:
            "Recurring problems on the same line usually mean the line itself is failing — a camera inspection settles it, and a targeted repair ends the ticket cycle.",
        },
        {
          _type: "card",
          _key: "seed-sign-3",
          icon: "droplets",
          question: "Are water bills climbing across the property?",
          answer:
            "In master-metered buildings, hidden leaks are silent budget drains. Leak detection finds them before the slab or the foundation pays the price.",
        },
        {
          _type: "card",
          _key: "seed-sign-4",
          icon: "wrench",
          question: "Is aging galvanized or polybutylene pipe in your walls?",
          answer:
            "Legacy piping fails on its own schedule. A repipe plan phased around occupancy beats an emergency reroute every time.",
        },
      ],
      ctaLabel: "Describe Your Issue — Get a Callback",
      ctaHref: "/contact",
    },
    {
      _type: "serviceAbout",
      _key: "seed-about",
      heading: "Experienced Apartment Plumbing Specialists Since 1996",
      paragraphs: [
        "Fred's Plumbing has supported apartment communities throughout the Dallas Fort Worth Metroplex for nearly three decades. Our technicians are trained to handle the unique needs of multi unit buildings, from shared systems to high demand service environments.",
        "We take pride in delivering dependable, high quality service backed by experience, advanced tools, and a strong commitment to resident satisfaction. Whether your community needs emergency repairs, routine maintenance, or complex plumbing system support, our team is ready to assist.",
      ],
      ctaLabel: "Talk to Our Team",
      ctaHref: "/contact",
      photoSubjectPrimary:
        "Rooftop pool deck of a high-rise apartment building at dusk",
      photoSubjectSecondary: "The Fred's Plumbing crew in front of a branded van",
    },
    {
      _type: "serviceTrust",
      _key: "seed-trust",
      heading: "Why Choose Us For Apartment Plumbing Services",
      items: [
        {
          _type: "item",
          _key: "seed-trust-1",
          icon: "building-2",
          title: "Multi Unit Expertise",
          description:
            "Our technicians understand the plumbing challenges that come with large apartment communities and provide solutions tailored to the needs of multi unit living.",
        },
        {
          _type: "item",
          _key: "seed-trust-2",
          icon: "clock",
          title: "Fast and Efficient Service",
          description:
            "We respond quickly to limit disruptions and maintain resident satisfaction across the property.",
        },
        {
          _type: "item",
          _key: "seed-trust-3",
          icon: "award",
          title: "Quality and Long Lasting Repairs",
          description:
            "Every service is completed with precision to ensure dependable performance and reduced maintenance needs over time.",
        },
      ],
      showLogos: true,
    },
    {
      _type: "serviceFaq",
      _key: "seed-faq",
      heading: "Apartment Plumbing Questions, Answered",
      background: "white",
      faqs: [
        {
          _type: "faq",
          _key: "seed-faq-1",
          question: "Do you coordinate directly with our on-site staff?",
          answer:
            "Yes. Fred's Plumbing works through your property manager or maintenance supervisor — one point of contact on each side, so nothing gets lost between the office and the units.",
        },
        {
          _type: "faq",
          _key: "seed-faq-2",
          question: "Can you handle unit access and resident notices?",
          answer:
            "Fred's Plumbing schedules through your office and works within your notice procedures. Technicians arrive in uniform, in marked vans, at the agreed windows.",
        },
        {
          _type: "faq",
          _key: "seed-faq-3",
          question: "Do you service both individual units and building systems?",
          answer:
            "Yes — from a single unit's fixture to risers, mains, and central water heating, the same crew covers the whole building.",
        },
        {
          _type: "faq",
          _key: "seed-faq-4",
          question: "Can one account cover several properties?",
          answer:
            "Yes. Portfolio accounts get consolidated records per property and a single contact for everything, and maintenance program members get priority emergency scheduling.",
          href: "/services/maintenance",
          linkLabel: "See Maintenance Programs",
        },
        {
          _type: "faq",
          _key: "seed-faq-5",
          question: "What apartment classes do you work with?",
          answer:
            "All of them. Fred's Plumbing services Class A high-rises, Class B mid-rise communities, Class C and legacy properties, and garden-style apartments across the Dallas–Fort Worth Metroplex.",
        },
      ],
    },
    {
      // Siblings only — never a self-link.
      _type: "propertyTypes",
      _key: "seed-siblings",
      heading: "Other Properties We Serve",
      background: "offwhite",
      cards: [
        {
          _type: "card",
          _key: "seed-sib-1",
          icon: "hotel",
          title: "Condos",
          blurb: "HOA-ready documentation and owner-coordinated scheduling.",
          slug: "condos",
        },
        {
          _type: "card",
          _key: "seed-sib-2",
          icon: "heart-handshake",
          title: "Assisted Living",
          blurb: "Code-sensitive work completed around residents who can't relocate.",
          slug: "assisted-living",
        },
        {
          _type: "card",
          _key: "seed-sib-3",
          icon: "stethoscope",
          title: "Nursing Homes",
          blurb: "Health-code compliant plumbing with zero-downtime planning.",
          slug: "nursing-homes",
        },
      ],
    },
    {
      _type: "finalCta",
      _key: "seed-final",
      heading: "Every Building. Every Unit. One Number.",
      body:
        "From the penthouse riser to the garden-court main, Fred's Plumbing keeps apartment communities across DFW flowing — on schedule and on call.",
      secondaryCtaLabel: "Request a Quote",
      secondaryCtaHref: "/contact",
    },
  ];
}

/**
 * Section stack for /multifamily/condos. Audience: HOA boards, association
 * managers, management companies. The governance split (association vs.
 * owner responsibility) is the centerpiece. Copy constraint: never assert
 * what any specific association's documents say — "typically", "in most
 * communities", and "your governing documents determine" are load-bearing.
 * We diagnose systems; we do not interpret CC&Rs.
 */
function condosSections() {
  return [
    {
      _type: "serviceHero",
      _key: "seed-hero",
      eyebrow: "FRED'S PLUMBING",
      heading: "Condo Plumbing Services In The Dallas Fort Worth Metroplex",
      subheading:
        "From association-owned mains to in-unit repairs, Fred's Plumbing gives condo communities across DFW one accountable contractor — with the documentation your board needs for every job.",
      secondaryCtaLabel: "Get an Association Quote",
      secondaryCtaHref: "/contact",
      credentials: [
        { _type: "credential", _key: "seed-cred-1", icon: "shield-check", label: "Licensed & Insured" },
        { _type: "credential", _key: "seed-cred-2", icon: "map-pin", label: "Serving DFW Since 1996" },
        { _type: "credential", _key: "seed-cred-3", icon: "clock", label: "24/7 Emergency Response" },
      ],
      photoSubject:
        "Exterior of a modern condo tower with balconies at dusk — vertical orientation",
    },
    {
      _type: "signsYouNeed",
      _key: "seed-signs",
      heading: "Problems Condo Boards Bring Us Most",
      cards: [
        {
          _type: "card",
          _key: "seed-sign-1",
          icon: "droplets",
          question: "Is a leak crossing between units?",
          answer:
            "Water from one unit damaging another is the classic condo dispute. Fred's Plumbing locates the source, documents which system it belongs to, and gives the board a written finding both owners can rely on.",
        },
        {
          _type: "card",
          _key: "seed-sign-2",
          icon: "shield-check",
          question: "Are owners disputing whose repair it is?",
          answer:
            "Most fights end when the diagnosis is clear. A camera inspection and a written scope establish whether the failure sits in the shared line or the unit branch.",
        },
        {
          _type: "card",
          _key: "seed-sign-3",
          icon: "wrench",
          question: "Is the association's aging riser or main overdue?",
          answer:
            "Original systems in 1980s–90s buildings fail on their own schedule. A phased replacement plan lets the board budget reserves instead of levying a surprise assessment.",
        },
        {
          _type: "card",
          _key: "seed-sign-4",
          icon: "award",
          question: "Did an inspection or insurer flag your plumbing?",
          answer:
            "Fred's Plumbing completes the flagged work and delivers the documentation your insurer or inspector wants to see — closed out, in writing.",
        },
      ],
      ctaLabel: "Describe Your Issue — Get a Callback",
      ctaHref: "/contact",
    },
    {
      _type: "whatsIncluded",
      _key: "seed-included",
      heading: "Reliable Plumbing Services In Dallas & Fort Worth",
      intro:
        "Every service below is available to condo communities — each links to the full detail:",
      items: [
        {
          _type: "item",
          _key: "seed-inc-1",
          icon: "wrench",
          title: "Plumbing",
          description:
            "From routine maintenance to full system installations, our licensed team handles all types of plumbing projects for commercial and multi-family buildings across DFW.",
          href: "/services/plumbing",
        },
        {
          _type: "item",
          _key: "seed-inc-2",
          icon: "waves",
          title: "Drain & Sewer",
          description:
            "Professional drain cleaning, hydro jetting, and sewer line repair to prevent backups and keep your property's systems flowing smoothly.",
          href: "/services/drain-sewer",
        },
        {
          _type: "item",
          _key: "seed-inc-3",
          icon: "cog",
          title: "Specialty Services",
          description:
            "Boiler systems, backflow, gas, and advanced diagnostics for complex plumbing challenges.",
          href: "/services/specialty-services",
        },
        {
          _type: "item",
          _key: "seed-inc-4",
          icon: "calendar-check",
          title: "Maintenance",
          description:
            "Scheduled maintenance plans designed to protect your infrastructure and ensure compliance with local codes.",
          href: "/services/maintenance",
        },
        {
          _type: "item",
          _key: "seed-inc-5",
          icon: "siren",
          title: "Emergency Plumbing",
          description:
            "Available 24/7 for burst pipes, leaks, and urgent repairs — immediate response when your tenants or facilities need it most.",
          href: "/services/emergency-plumbing",
        },
        {
          _type: "item",
          _key: "seed-inc-6",
          icon: "building-2",
          title: "Common-Area & Amenity Plumbing",
          description:
            "Pool equipment rooms, clubhouses, fitness centers, and shared laundry — the association-owned spaces owners actually see.",
          href: "/services/commercial-plumbing",
        },
      ],
    },
    {
      // The centerpiece. The "typically / your governing documents" framing
      // appears in BOTH intro and footer by design — do not remove either.
      _type: "comparisonTable",
      _key: "seed-table",
      heading: "Association or Owner? Where Responsibility Usually Falls",
      intro:
        "Every association's governing documents differ — but in most DFW condo communities, the split looks like this:",
      background: "dark",
      columnLabels: ["System", "Typically Maintained By", "What Fred's Plumbing Provides"],
      rows: [
        {
          _type: "row",
          _key: "seed-row-1",
          situation: "Building mains, risers & shared drains",
          recommendation: "The association",
          why: "Inspection, repair, and replacement planning, invoiced to the association",
        },
        {
          _type: "row",
          _key: "seed-row-2",
          situation: "In-unit branch lines, fixtures & water heaters",
          recommendation: "The unit owner",
          why: "Direct-to-owner service with documentation the board can keep on file",
        },
        {
          _type: "row",
          _key: "seed-row-3",
          situation: "The line BETWEEN shared and unit systems",
          recommendation: "Depends on your governing documents",
          why: "A written diagnosis of where the failure sits — the evidence both sides need",
        },
        {
          _type: "row",
          _key: "seed-row-4",
          situation: "Common-area amenities (pool, clubhouse, laundry)",
          recommendation: "The association",
          why: "Scheduled maintenance and repair as part of an association program",
        },
      ],
      footnote:
        "Fred's Plumbing documents which system a failure belongs to — your governing documents determine who pays. We provide the facts; your board applies the rules.",
    },
    {
      _type: "serviceAbout",
      _key: "seed-about",
      heading: "Trusted Plumbing Experts For Condo Communities Since 1996",
      paragraphs: [
        "Fred's Plumbing has supported condo communities in the Dallas Fort Worth Metroplex for nearly thirty years. Our technicians are trained to handle both individual unit concerns and complex building wide plumbing systems.",
        "We are committed to delivering high quality service backed by advanced tools, professional experience, and a strong focus on resident comfort. Whether your community needs routine maintenance, emergency repair, or system upgrades, our team is prepared to provide reliable and efficient support.",
      ],
      ctaLabel: "Talk to Our Team",
      ctaHref: "/contact",
      photoSubjectPrimary: "Condo building courtyard with pool at dusk",
      photoSubjectSecondary: "The Fred's Plumbing crew in front of a branded van",
    },
    {
      _type: "serviceTrust",
      _key: "seed-trust",
      heading: "Why Choose Us For Condo Plumbing Services",
      items: [
        {
          _type: "item",
          _key: "seed-trust-1",
          icon: "building-2",
          title: "Expert Support For Shared Systems",
          description:
            "Our team understands the plumbing structure of condo communities and provides solutions that protect both individual units and common areas.",
        },
        {
          _type: "item",
          _key: "seed-trust-2",
          icon: "clock",
          title: "Prompt And Efficient Response",
          description:
            "We act quickly to limit water damage, reduce inconvenience, and maintain resident satisfaction throughout the community.",
        },
        {
          _type: "item",
          _key: "seed-trust-3",
          icon: "award",
          title: "Quality Driven Repairs",
          description:
            "Every repair and service is completed with precision to ensure long term reliability and reduced maintenance needs.",
        },
      ],
      showLogos: true,
    },
    {
      _type: "serviceFaq",
      _key: "seed-faq",
      heading: "Condo Plumbing Questions, Answered",
      background: "white",
      faqs: [
        {
          _type: "faq",
          _key: "seed-faq-1",
          question: "Do you work for the association, the owner, or both?",
          answer:
            "Both. Fred's Plumbing serves associations for shared systems and individual owners for in-unit work — with separate invoicing and records, so the board's file stays clean.",
        },
        {
          // Never asserts what any specific association's documents say.
          _type: "faq",
          _key: "seed-faq-2",
          question:
            "Can you tell us whether a leak is the HOA's responsibility or the owner's?",
          answer:
            "Fred's Plumbing determines which system failed and puts it in writing. Who pays is set by your governing documents — but the diagnosis is the evidence that settles most disputes.",
        },
        {
          _type: "faq",
          _key: "seed-faq-3",
          question: "Do you provide reports our board can file?",
          answer:
            "Yes. Every job closes with written documentation — findings, work performed, and photos where useful — suitable for board minutes, insurers, and reserve planning.",
        },
        {
          _type: "faq",
          _key: "seed-faq-4",
          question: "Can you help our board plan for aging plumbing?",
          answer:
            "Yes. Fred's Plumbing inspects the building's shared systems and provides a condition report with phased replacement options, so the reserve study reflects reality.",
          href: "/services/maintenance",
          linkLabel: "See Maintenance Programs",
        },
        {
          _type: "faq",
          _key: "seed-faq-5",
          question: "How do you handle access to individually owned units?",
          answer:
            "Through your association's notice procedures. Fred's Plumbing coordinates scheduling with your manager, and technicians arrive uniformed, in marked vans, at the agreed windows.",
        },
      ],
    },
    {
      _type: "propertyTypes",
      _key: "seed-siblings",
      heading: "Other Properties We Serve",
      background: "offwhite",
      cards: [
        {
          _type: "card",
          _key: "seed-sib-1",
          icon: "building",
          title: "Apartments",
          blurb: "High-occupancy systems, unit-turn plumbing, and building-wide maintenance.",
          slug: "apartments",
        },
        {
          _type: "card",
          _key: "seed-sib-2",
          icon: "heart-handshake",
          title: "Assisted Living",
          blurb: "Code-sensitive work completed around residents who can't relocate.",
          slug: "assisted-living",
        },
        {
          _type: "card",
          _key: "seed-sib-3",
          icon: "stethoscope",
          title: "Nursing Homes",
          blurb: "Health-code compliant plumbing with zero-downtime planning.",
          slug: "nursing-homes",
        },
      ],
    },
    {
      _type: "finalCta",
      _key: "seed-final",
      heading: "Give Your Board One Less Thing to Debate",
      body:
        "Shared systems, unit repairs, and the documentation that keeps everyone on the same page — one contractor for condo communities across DFW.",
      secondaryCtaLabel: "Request a Quote",
      secondaryCtaHref: "/contact",
    },
  ];
}

/**
 * Section stack for /multifamily/assisted-living. Lane discipline: this
 * page covers how Fred's Plumbing OPERATES inside a care community
 * (scheduling, discretion, documentation); technical service detail lives
 * on /services/senior-care-facilities, cross-linked in the router section.
 * Tone rules: never imply clinical or care expertise — a plumbing
 * contractor experienced in care environments; no fear-based copy; no
 * named regulations, codes, or agency requirements anywhere.
 */
function assistedLivingSections() {
  return [
    {
      _type: "serviceHero",
      _key: "seed-hero",
      eyebrow: "FRED'S PLUMBING",
      heading: "Assisted Living Plumbing Services In The Dallas Fort Worth Metroplex",
      subheading:
        "Plumbing work in a community where people live full-time takes more than technical skill — it takes a crew that schedules around care routines, works quietly, and documents everything for your records.",
      secondaryCtaLabel: "Schedule a Facility Walkthrough",
      secondaryCtaHref: "/contact",
      credentials: [
        { _type: "credential", _key: "seed-cred-1", icon: "shield-check", label: "Licensed & Insured" },
        { _type: "credential", _key: "seed-cred-2", icon: "map-pin", label: "Serving DFW Since 1996" },
        { _type: "credential", _key: "seed-cred-3", icon: "clock", label: "24/7 Emergency Response" },
      ],
      photoSubject:
        "Sunlit common lounge of an assisted living community, unoccupied — vertical orientation",
    },
    {
      _type: "serviceAbout",
      _key: "seed-about",
      heading: "Trusted Plumbing Support For Assisted Living Communities Since 1996",
      paragraphs: [
        "For nearly three decades, Fred's Plumbing has supported assisted living communities across the Dallas Fort Worth Metroplex. Our technicians are trained to work in sensitive environments where safety and reliability are essential.",
        "We deliver high quality service supported by advanced tools, professional expertise, and a strong commitment to protecting residents. Whether handling routine maintenance or urgent repairs, our goal is to provide consistent, dependable care for every facility we serve.",
      ],
      ctaLabel: "Talk to Our Team",
      ctaHref: "/contact",
      photoSubjectPrimary:
        "Accessible bathroom in a care community with grab bars and walk-in shower, unoccupied",
      photoSubjectSecondary: "The Fred's Plumbing crew in front of a branded van",
    },
    {
      _type: "whatsIncluded",
      _key: "seed-included",
      heading: "Reliable Plumbing Services In Dallas & Fort Worth",
      intro:
        "Every service below is available to assisted living communities — each links to the full detail:",
      items: [
        {
          _type: "item",
          _key: "seed-inc-1",
          icon: "wrench",
          title: "Plumbing",
          description:
            "From routine maintenance to full system installations, our licensed team handles all types of plumbing projects for commercial and multi-family buildings across DFW.",
          href: "/services/plumbing",
        },
        {
          _type: "item",
          _key: "seed-inc-2",
          icon: "waves",
          title: "Drain & Sewer",
          description:
            "Professional drain cleaning, hydro jetting, and sewer line repair to prevent backups and keep your property's systems flowing smoothly.",
          href: "/services/drain-sewer",
        },
        {
          _type: "item",
          _key: "seed-inc-3",
          icon: "cog",
          title: "Specialty Services",
          description:
            "Boiler systems, backflow, gas, and advanced diagnostics for complex plumbing challenges.",
          href: "/services/specialty-services",
        },
        {
          _type: "item",
          _key: "seed-inc-4",
          icon: "calendar-check",
          title: "Maintenance",
          description:
            "Scheduled maintenance plans designed to protect your infrastructure and ensure compliance with local codes.",
          href: "/services/maintenance",
        },
        {
          _type: "item",
          _key: "seed-inc-5",
          icon: "siren",
          title: "Emergency Plumbing",
          description:
            "Available 24/7 for burst pipes, leaks, and urgent repairs — immediate response when your tenants or facilities need it most.",
          href: "/services/emergency-plumbing",
        },
        {
          // Lane-discipline cross-link: the technical depth lives there.
          _type: "item",
          _key: "seed-inc-6",
          icon: "heart-pulse",
          title: "Senior Care Facility Plumbing",
          description:
            "The technical detail: fixtures, systems, and compliance work specific to senior living environments.",
          href: "/services/senior-care-facilities",
        },
      ],
    },
    {
      // The centerpiece: operational choreography inside a care community.
      _type: "processSteps",
      _key: "seed-process",
      heading: "How We Work Inside an Operating Community",
      steps: [
        {
          _type: "step",
          _key: "seed-step-1",
          title: "Plan With Your Staff",
          description:
            "Work is scheduled with your director or maintenance lead around meal times, activities, and care routines — never sprung on your team.",
        },
        {
          _type: "step",
          _key: "seed-step-2",
          title: "Contain the Work Area",
          description:
            "Clean protective coverings, clear signage, and equipment that never blocks a corridor or exit.",
        },
        {
          _type: "step",
          _key: "seed-step-3",
          title: "Work Quietly, Introduce Ourselves",
          description:
            "Technicians are uniformed, badged, and briefed that they're working in someone's home — noisy work is scheduled for the windows you choose.",
        },
        {
          _type: "step",
          _key: "seed-step-4",
          title: "Restore and Document",
          description:
            "The area is returned to service the same visit wherever possible, and you receive written records for your facility file [SURVEY-DOCUMENTATION SPECIFICS — client to confirm what facilities typically request].",
        },
      ],
    },
    {
      _type: "signsYouNeed",
      _key: "seed-signs",
      heading: "Situations Assisted Living Operators Bring Us Most",
      cards: [
        {
          _type: "card",
          _key: "seed-sign-1",
          icon: "clock",
          question: "Do you need water shutoffs kept short and scheduled?",
          answer:
            "In a community that can't simply close, shutoff windows are planned with your staff, announced in advance, and kept as short as the work allows.",
        },
        {
          _type: "card",
          _key: "seed-sign-2",
          icon: "flame",
          question: "Is hot water reliability non-negotiable?",
          answer:
            "It is here. Fred's Plumbing maintains and repairs the water heating systems residents depend on daily, and treats hot-water loss as a priority call.",
        },
        {
          _type: "card",
          _key: "seed-sign-3",
          icon: "heart-pulse",
          question: "Are accessible fixtures due for repair or upgrade?",
          answer:
            "Grab-bar-era bathrooms need parts and care standard crews don't carry. We service accessible fixtures with the right components the first time.",
        },
        {
          _type: "card",
          _key: "seed-sign-4",
          icon: "award",
          question: "Does your maintenance file need to be survey-ready?",
          answer:
            "Every job closes with written documentation for your records [LICENSING-SURVEY SPECIFICS — client to confirm], so plumbing is never the loose end in an inspection.",
        },
      ],
      ctaLabel: "Describe Your Issue — Get a Callback",
      ctaHref: "/contact",
    },
    {
      _type: "serviceTrust",
      _key: "seed-trust",
      heading: "Why Choose Us For Assisted Living Plumbing Services",
      items: [
        {
          _type: "item",
          _key: "seed-trust-1",
          icon: "heart-handshake",
          title: "Experience In Senior Living",
          description:
            "We understand the plumbing needs of assisted living facilities and provide solutions that support resident safety and facility operations.",
        },
        {
          _type: "item",
          _key: "seed-trust-2",
          icon: "clock",
          title: "Fast And Reliable Service",
          description:
            "Our technicians respond quickly to prevent disruptions and maintain a comfortable environment for residents.",
        },
        {
          _type: "item",
          _key: "seed-trust-3",
          icon: "award",
          title: "Quality Driven Results",
          description:
            "Every service is performed with care and accuracy to ensure long lasting performance and consistent reliability.",
        },
      ],
      showLogos: true,
    },
    {
      _type: "serviceFaq",
      _key: "seed-faq",
      heading: "Assisted Living Plumbing Questions, Answered",
      background: "white",
      faqs: [
        {
          _type: "faq",
          _key: "seed-faq-1",
          question: "Can you work while residents are present?",
          answer:
            "Yes — that's the normal case, not the exception. Fred's Plumbing contains work areas, keeps corridors clear, and schedules disruptive work for the windows your staff chooses.",
        },
        {
          // If the client won't state a screening policy publicly, DELETE
          // this question — a vague answer here is worse than none.
          _type: "faq",
          _key: "seed-faq-2",
          question: "Are your technicians screened for work in care communities?",
          answer:
            "[BACKGROUND-CHECK / SCREENING POLICY — client to confirm; do not invent. If the client won't state a policy publicly, drop this question — a vague answer here is worse than none.]",
        },
        {
          _type: "faq",
          _key: "seed-faq-3",
          question: "How do you handle emergencies overnight?",
          answer:
            "Fred's Plumbing answers 24/7, and overnight work in a care community follows the same rules as daytime work: coordinate with the staff on duty, contain the area, keep the noise down.",
        },
        {
          _type: "faq",
          _key: "seed-faq-4",
          question: "Can you put our community on a maintenance schedule?",
          answer:
            "Yes. Scheduled programs catch failures before residents notice them, and program members get priority emergency response.",
          href: "/services/maintenance",
          linkLabel: "See Maintenance Programs",
        },
        {
          _type: "faq",
          _key: "seed-faq-5",
          question: "Do you also serve nursing homes and memory care?",
          answer:
            "Yes. Fred's Plumbing serves the full range of senior living communities across DFW, including skilled nursing facilities.",
          href: "/multifamily/nursing-homes",
          linkLabel: "See Nursing Home Plumbing",
        },
      ],
    },
    {
      _type: "propertyTypes",
      _key: "seed-siblings",
      heading: "Other Properties We Serve",
      background: "offwhite",
      cards: [
        {
          _type: "card",
          _key: "seed-sib-1",
          icon: "stethoscope",
          title: "Nursing Homes",
          blurb: "Health-code compliant plumbing with zero-downtime planning.",
          slug: "nursing-homes",
        },
        {
          _type: "card",
          _key: "seed-sib-2",
          icon: "building",
          title: "Apartments",
          blurb: "High-occupancy systems, unit-turn plumbing, and building-wide maintenance.",
          slug: "apartments",
        },
        {
          _type: "card",
          _key: "seed-sib-3",
          icon: "hotel",
          title: "Condos",
          blurb: "HOA-ready documentation and owner-coordinated scheduling.",
          slug: "condos",
        },
      ],
    },
    {
      _type: "finalCta",
      _key: "seed-final",
      heading: "Plumbing That Respects the People Who Live There",
      body:
        "Planned around care routines, contained, documented, and answered 24/7 — one contractor for assisted living communities across DFW.",
      secondaryCtaLabel: "Request a Quote",
      secondaryCtaHref: "/contact",
    },
  ];
}

/** Per-slug section stacks + SEO overrides for industry pages. */
const INDUSTRY_EXTRAS: Record<
  string,
  { sections: () => unknown[]; seoTitle: string; seoDescription: string }
> = {
  apartments: {
    sections: apartmentsSections,
    seoTitle: "Apartment Plumbing Services in DFW | Fred's Plumbing",
    seoDescription:
      "Apartment plumbing across Dallas–Fort Worth — Class A high-rises to garden-style communities. Unit turns, risers, mains, and 24/7 emergency response.",
  },
  condos: {
    sections: condosSections,
    seoTitle: "Condo & HOA Plumbing Services in DFW | Fred's Plumbing",
    seoDescription:
      "Condo plumbing for HOAs and associations across Dallas–Fort Worth — shared mains, in-unit repairs, and written documentation for every board file. 24/7.",
  },
  "assisted-living": {
    sections: assistedLivingSections,
    seoTitle: "Assisted Living Plumbing in DFW | Fred's Plumbing",
    seoDescription:
      "Assisted living plumbing across Dallas–Fort Worth — scheduled around care routines, contained work areas, and documented for your facility file. Answered 24/7.",
  },
};

/** Per-slug section stacks + SEO overrides for section-library pages. */
const SERVICE_EXTRAS: Record<
  string,
  { sections: () => unknown[]; seoTitle: string; seoDescription: string }
> = {
  plumbing: {
    sections: plumbingSections,
    seoTitle: "Plumbing Services in Dallas–Fort Worth | Fred's Plumbing",
    seoDescription:
      "Licensed commercial & multi-family plumbing across the Dallas–Fort Worth Metroplex — repairs, repipes, slab leaks, water heaters, and 24/7 emergency response.",
  },
  "drain-sewer": {
    sections: drainSewerSections,
    seoTitle: "Drain & Sewer Service in Dallas–Fort Worth | Fred's Plumbing",
    seoDescription:
      "Sewer camera inspections, hydrojetting, backup clearing, and sewer line repair for commercial and multi-family properties across DFW — emergency service 24/7.",
  },
  "specialty-services": {
    sections: specialtyServicesSections,
    seoTitle: "Backflow, Boiler & Gas Lines in DFW | Fred's Plumbing",
    seoDescription:
      "Backflow testing, commercial boiler service, and gas line repair for multi-family and commercial properties across Dallas–Fort Worth — available 24/7.",
  },
  "emergency-plumbing": {
    sections: emergencyPlumbingSections,
    seoTitle: "24/7 Emergency Plumber in DFW | Fred's Plumbing",
    seoDescription:
      "24/7 emergency plumbing for DFW multi-family and commercial properties — burst pipes, sewer backups, flooding, and water loss answered day and night.",
  },
  maintenance: {
    sections: maintenanceSections,
    seoTitle: "Plumbing Maintenance Programs in DFW | Fred's Plumbing",
    seoDescription:
      "Preferred Customer maintenance programs for DFW multi-family and commercial properties — scheduled inspections, compliance deadline tracking, priority response.",
  },
};

async function main() {
  const args = process.argv.slice(2);
  const confirmed = args.includes("--confirm");
  const forced = args.includes("--force");

  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!writeToken) {
    console.error(
      "✗ SANITY_API_WRITE_TOKEN is not set. Create an *Editor* token at\n" +
        "  sanity.io/manage → API → Tokens and add it to .env.local.\n" +
        "  (Do NOT reuse SANITY_API_READ_TOKEN — it is Viewer-scope and cannot write.)",
    );
    process.exit(1);
  }

  const client = getCliClient({ apiVersion: "2026-07-01" }).withConfig({
    token: writeToken,
    useCdn: false,
  });
  const { projectId, dataset } = client.config();

  if (!confirmed) {
    console.log(
      `This would seed project "${projectId}", dataset "${dataset}" with:\n` +
        `  1 siteSettings, 1 navigation (incl. footer), ${services.length} services,\n` +
        `  ${industries.length} industries, ${faqs.length} FAQs, ${testimonials.length} testimonials, ${STATIC_TRUST_LOGOS.length} trust logos.\n\n` +
        `Nothing was written. Re-run with:  npm run seed -- --confirm`,
    );
    return;
  }

  const existing = await client.fetch<number>(
    `count(*[_type in $types])`,
    { types: DOC_TYPES },
  );
  if (existing > 0 && !forced) {
    console.error(
      `✗ Refusing to seed: dataset "${dataset}" already contains ${existing} document(s)\n` +
        `  of the types this script writes. Re-running would OVERWRITE any edits made\n` +
        `  in the Studio. If you are certain, re-run with:  npm run seed -- --confirm --force`,
    );
    process.exit(1);
  }

  const tx = client.transaction();

  tx.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    ...site,
    serviceAreaCities: [...serviceAreaCities],
  });

  tx.createOrReplace({
    _id: "navigation",
    _type: "navigation",
    items: STATIC_NAVIGATION.items.map((group) => ({
      _type: "navGroup",
      _key: group._key,
      label: group.label,
      href: group.href,
      layout: group.layout,
      showServiceAreaCities: group.showServiceAreaCities ?? false,
      children: group.children.map((child) => ({
        _type: "navLink",
        _key: child._key,
        label: child.label,
        href: child.href,
        ...(child.description ? { description: child.description } : {}),
        ...(child.icon ? { icon: child.icon } : {}),
      })),
    })),
    cta: { ...STATIC_NAVIGATION.cta },
    footerColumns: STATIC_FOOTER_NAVIGATION.columns.map((column) => ({
      _type: "footerColumn",
      _key: column._key,
      heading: column.heading,
      links: column.links.map((link) => ({
        _type: "footerLink",
        _key: link._key,
        label: link.label,
        href: link.href,
      })),
    })),
    legalLinks: STATIC_FOOTER_NAVIGATION.legal.map((link) => ({
      _type: "footerLink",
      _key: link._key,
      label: link.label,
      href: link.href,
    })),
  });

  services.forEach((service, i) => {
    const extras = SERVICE_EXTRAS[service.slug];
    tx.createOrReplace({
      _id: `service-${service.slug}`,
      _type: "service",
      title: service.title,
      slug: { _type: "slug", current: service.slug },
      shortDescription: service.shortDescription,
      icon: service.icon,
      featured: service.featured ?? false,
      order: (i + 1) * 10,
      body: placeholderBody(service.title),
      ...(extras
        ? {
            sections: extras.sections(),
            seoTitle: extras.seoTitle,
            seoDescription: extras.seoDescription,
          }
        : {}),
    });
  });

  industries.forEach((industry, i) => {
    const extras = INDUSTRY_EXTRAS[industry.slug];
    tx.createOrReplace({
      _id: `industry-${industry.slug}`,
      _type: "industry",
      title: industry.title,
      slug: { _type: "slug", current: industry.slug },
      description: industry.description,
      bulletPoints: [...industry.bulletPoints],
      order: (i + 1) * 10,
      body: placeholderBody(industry.title),
      ...(extras
        ? {
            sections: extras.sections(),
            seoTitle: extras.seoTitle,
            seoDescription: extras.seoDescription,
          }
        : {}),
    });
  });

  faqs.forEach((faq, i) => {
    tx.createOrReplace({
      _id: `faq-${(i + 1) * 10}`,
      _type: "faq",
      question: faq.question,
      answer: faq.answer,
      order: (i + 1) * 10,
    });
  });

  testimonials.forEach((testimonial, i) => {
    tx.createOrReplace({
      _id: `testimonial-${slugify(testimonial.name)}`,
      _type: "testimonial",
      name: testimonial.name,
      ...(testimonial.role ? { role: testimonial.role } : {}),
      rating: testimonial.rating,
      quote: testimonial.quote,
      date: testimonial.date,
      featured: testimonial.featured ?? false,
      order: (i + 1) * 10,
    });
  });

  STATIC_TRUST_LOGOS.forEach((logo, i) => {
    tx.createOrReplace({
      _id: `trustLogo-${slugify(logo.name)}`,
      _type: "trustLogo",
      name: logo.name,
      order: (i + 1) * 10,
    });
  });

  await tx.commit();

  console.log(
    `✓ Seeded project "${projectId}", dataset "${dataset}":\n` +
      `  1 siteSettings, 1 navigation (header + footer + legal),\n` +
      `  ${services.length} services, ${industries.length} industries, ${faqs.length} FAQs,\n` +
      `  ${testimonials.length} testimonials, ${STATIC_TRUST_LOGOS.length} trust logos.\n\n` +
      `  ⚠ Images were NOT seeded — no image assets exist yet. Upload photos and\n` +
      `    logos through the Studio (/studio); each image field requires alt text.\n\n` +
      `  Next: npm run check:drift   (should print all ✓, no drift)`,
  );
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
