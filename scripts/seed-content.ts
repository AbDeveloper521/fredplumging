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
    tx.createOrReplace({
      _id: `industry-${industry.slug}`,
      _type: "industry",
      title: industry.title,
      slug: { _type: "slug", current: industry.slug },
      description: industry.description,
      bulletPoints: [...industry.bulletPoints],
      order: (i + 1) * 10,
      body: placeholderBody(industry.title),
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
