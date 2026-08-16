import { homePageDefaults } from "./homePage";
import { commercialFaqBand, COMMERCIAL_FAQ_SET_ID } from "./faqSets";
import type { LibrarySection } from "./sectionLibrary";

/**
 * Commercial page (`/commercial`) — FALLBACK for the `commercialPage` Sanity
 * singleton (see `sanity/lib/getCommercialPage.ts`).
 *
 * Built on the SERVICE-PAGE rhythm, not a bespoke shape: the published
 * service pages run serviceHero → serviceAbout → propertyTypes →
 * serviceTrust → serviceTestimonials, and every band here is one of those
 * shared library types (serviceTrust swapped for the services grid the
 * commercial page needs, plus the emergency band, the Q&A band and a closing
 * CTA). No new section type was added for this page.
 *
 * CLAIMS: nothing here states a response time, a technician count, years in
 * business, or an insurance limit. The licence number lives in Site Settings
 * and is quoted only inside the FAQ answer that was approved with it. Two
 * licence-gated service lines (backflow certification, gas work) are recorded
 * in `UNCONFIRMED_CLAIMS` in ./faqSets.ts for the owner to confirm.
 */
export const defaultCommercialSections: LibrarySection[] = [
  // 1 — banner
  {
    _type: "serviceHero",
    _key: "hero",
    eyebrow: "FRED'S PLUMBING",
    heading:
      "Commercial Plumbing Services in the Dallas–Fort Worth Metroplex",
    subheading:
      "Fred's Plumbing keeps commercial buildings running across DFW — from a single storefront to a multi-tenant property. We handle repairs, replacements, code compliance work and 24/7 emergencies, and we schedule around your operating hours wherever we can.",
    credentials: [],
  },

  // 2 — intro band with photo (the photo slot stays empty until the owner
  // uploads one in Studio; the band renders its placeholder caption)
  {
    _type: "serviceAbout",
    _key: "intro",
    heading: "Plumbing problems shouldn't close your doors",
    paragraphs: [
      "A failed water heater, a backed-up main, or a leak above a tenant space costs a business far more than the repair itself. Fred's Plumbing works with owners, property managers and facility teams across the Metroplex to get systems back in service quickly — and to keep them from failing in the first place.",
      "Our crews work in occupied buildings every day. We diagnose with camera inspection and leak detection rather than guesswork, so the problem gets found on the first visit and the fix is the right one.",
    ],
    photoSubjectPrimary:
      "Technician working on commercial plumbing in an occupied building",
  },

  // 3 — services grid; 8 cards balance 4+4 at lg+ (lib/iconCardRows.ts)
  {
    _type: "iconCardSection",
    _key: "services",
    heading: "Commercial plumbing services we provide",
    cards: [
      {
        _key: "drain-sewer",
        icon: "waves",
        title: "Drain & Sewer Cleaning",
        description:
          "Hydro jetting and cabling for kitchen lines, floor drains and main sewer stoppages.",
      },
      {
        _key: "water-heaters",
        icon: "flame",
        title: "Water Heaters",
        description:
          "Repair, replacement and installation for commercial tank and tankless systems.",
      },
      {
        _key: "backflow",
        icon: "shield-check",
        title: "Backflow Prevention",
        description:
          "Installation, testing and certification to keep your building compliant.",
      },
      {
        _key: "grease-traps",
        icon: "cog",
        title: "Grease Traps & Interceptors",
        description:
          "Pumping, cleaning and scheduled service for restaurants and food service.",
      },
      {
        _key: "leak-detection",
        icon: "droplets",
        title: "Leak Detection",
        description:
          "Locating slab, supply and concealed leaks without unnecessary demolition.",
      },
      {
        _key: "camera-inspection",
        icon: "search-check",
        title: "Camera Inspection",
        description:
          "Video inspection of sewer and drain lines to confirm the cause before work starts.",
      },
      {
        _key: "gas-lines",
        icon: "gauge",
        title: "Gas Line Services",
        description:
          "Installation, repair and pressure testing for commercial gas piping.",
      },
      {
        _key: "re-pipes",
        icon: "wrench",
        title: "Re-Pipes & Fixtures",
        description:
          "Partial and full re-pipes, PRV replacement and commercial fixture installation.",
      },
    ],
  },

  // 4 — emergency band. Its phone button and /contact link come from Site
  // Settings inside the component; deliberately NO response-time figure.
  {
    _type: "homeEmergency",
    _key: "emergency",
    ...homePageDefaults.emergency,
    heading: "24/7 emergency response across DFW",
    body: "Plumbing emergencies don't wait for business hours. Fred's Plumbing answers around the clock for burst lines, sewer backups, water heater failures and anything else that can't wait until morning. Call and we'll get a technician moving.",
  },

  // 5 — property types. Only the card that has a real page links out; the
  // other five are informational, because those pages don't exist.
  {
    _type: "propertyTypes",
    _key: "properties",
    heading: "Commercial properties we serve",
    background: "white",
    cards: [
      {
        _key: "retail",
        icon: "building-2",
        title: "Retail & shopping centers",
        blurb: "Storefronts, anchor tenants and shared common-area systems.",
      },
      {
        _key: "office",
        icon: "building",
        title: "Office buildings",
        blurb: "Restrooms, break rooms and risers across multi-floor tenancies.",
      },
      {
        _key: "restaurants",
        icon: "flame",
        title: "Restaurants & food service",
        blurb: "Kitchen lines, grease traps and equipment connections.",
      },
      {
        _key: "senior-care",
        icon: "heart-handshake",
        title: "Senior care & assisted living",
        blurb: "Scheduled, low-disruption work around residents and staff.",
        slug: "assisted-living",
      },
      {
        _key: "mixed-use",
        icon: "hotel",
        title: "Mixed-use developments",
        blurb: "Buildings that combine residential units with ground-floor tenants.",
      },
      {
        _key: "warehouses",
        icon: "truck",
        title: "Warehouses & light industrial",
        blurb: "Service areas, wash bays and utility connections.",
      },
    ],
  },

  // 6 — reviews, configured exactly as the service pages configure theirs.
  // Existing testimonial documents, verbatim; no review structured data.
  {
    _type: "serviceTestimonials",
    _key: "reviews",
    heading: "What Our Clients Say",
    filterTags: ["commercial-plumbing", "maintenance"],
    limit: 4,
  },

  // 7 — Q&A, from the shared "Commercial FAQs" set (its own set, not the
  // multi-family one). On the published path this is a reference the page
  // query dereferences; here it is that set already resolved.
  commercialFaqBand("faq"),

  // 8 — closing CTA. "{phone}" is replaced with the Site Settings number.
  {
    _type: "finalCta",
    _key: "closing",
    heading: "Talk to a commercial plumber today",
    body: "Tell us what the building needs and we'll get you scheduled — or call now if it can't wait.",
    phoneCtaLabel: "Call {phone}",
    secondaryCtaLabel: "Request Service",
    secondaryCtaHref: "/contact",
    showAvailabilityDot: true,
  },
];

/**
 * Array fields whose object members need `_type` + `_key` in Sanity, by the
 * schema's array-member name. `paragraphs` is a string array and needs none.
 */
const CHILD_MEMBER_TYPE: Record<string, string> = {
  credentials: "credential",
  cards: "card",
  benefits: "item",
};

/**
 * The same stack in SANITY shape, for anything that writes a document: nested
 * array members carry `_type`/`_key`, and the Q&A band becomes a REFERENCE to
 * the shared set rather than a copy of its questions.
 *
 * Both the Studio prefill (`initialValue` in sanity/schemas/commercialPage.ts)
 * and scripts/seed-commercial-sections.ts go through this, so a document
 * created either way is identical. Without it the prefill would drop unkeyed
 * cards into Studio and leave the Q&A band pointing at nothing.
 *
 * The reference target only exists once the seeder has run (or the set has
 * been created by hand under FAQ Sets) — publishing the prefill first leaves
 * that one band pointing at a missing document until then.
 */
export function commercialSectionsForSanity(): Record<string, unknown>[] {
  // JSON round-trip strips `undefined`s (the empty photo slots).
  const stack = JSON.parse(
    JSON.stringify(defaultCommercialSections),
  ) as Record<string, unknown>[];

  return stack.map((section) => {
    if (section._type === "faqBand") {
      return {
        _type: "faqBand",
        _key: section._key,
        source: "set",
        // `_weak` matches the schema's weak reference field, so a document
        // written before the set exists saves instead of being rejected.
        faqSet: { _type: "reference", _ref: COMMERCIAL_FAQ_SET_ID, _weak: true },
        hidden: false,
      };
    }
    for (const [field, memberType] of Object.entries(CHILD_MEMBER_TYPE)) {
      const value = section[field];
      if (!Array.isArray(value)) continue;
      section[field] = value.map((entry, i) =>
        entry && typeof entry === "object" && !Array.isArray(entry)
          ? {
              _type: memberType,
              _key:
                (entry as Record<string, unknown>)._key ??
                `${section._key}-${field}-${i}`,
              ...(entry as Record<string, unknown>),
            }
          : entry,
      );
    }
    return section;
  });
}
