import { hydroJettingFaqBand, HYDRO_JETTING_FAQ_SET_ID } from "./faqSets";
import { sectionsForSanity, type LibrarySection } from "./sectionLibrary";

/**
 * Hydro Jetting page (`/commercial/hydro-jetting`) — FALLBACK for the
 * `hydroJettingPage` Sanity singleton (see
 * `sanity/lib/getHydroJettingPage.ts`).
 *
 * ONE page about hydro jetting exists on this site and this is it. Jetting is
 * mentioned on /services/drain-sewer, /services/specialty-services and in the
 * FAQ sets, but no other page ranks for it — a second hydro jetting page would
 * split its own ranking, so anything that wants to link to jetting links HERE.
 *
 * Built on the SERVICE-PAGE rhythm, band for band, exactly as
 * `data/commercialPage.ts` is: banner → photo-collage band → cards → list →
 * cards → reviews → Q&A → closing CTA, every one of them an existing shared
 * library type. No new section type was added for this page.
 *
 * CLAIMS DISCIPLINE — read before editing:
 *  - NO equipment specifications. No PSI, GPM, hose length or nozzle type
 *    appears anywhere on this page; see `UNSPECIFIED_EQUIPMENT` in ./faqSets.
 *  - No price, no response time, no warranty or maintenance-plan terms.
 *  - "Licensed", never "certified" — the licence (RMP 44890) lives in Site
 *    Settings and is quoted only where it was approved.
 *  - The "Scheduled service where it makes sense" card is a SERVICE
 *    COMMITMENT awaiting the client's confirmation — see
 *    `UNCONFIRMED_COMMITMENTS` in ./faqSets.
 */
/**
 * THE canonical URL path for hydro jetting on this site — the route, the
 * page's canonical tag, the sitemap entry and the nav link the owner adds all
 * read it from here, so there is one address and it cannot drift into two.
 */
export const HYDRO_JETTING_PATH = "/commercial/hydro-jetting";

export const defaultHydroJettingSections: LibrarySection[] = [
  // 1 — banner. Photo slot stays empty until the owner uploads one in Studio;
  // the band renders its blueprint wash and the placeholder caption below.
  {
    _type: "serviceHero",
    _key: "hero",
    eyebrow: "FRED'S PLUMBING",
    heading: "Hydro Jetting in the Dallas–Fort Worth Metroplex",
    subheading:
      "High-pressure water jetting clears grease, sludge, scale and roots out of commercial drain and sewer lines — and scours the pipe wall clean instead of punching a hole through the blockage. Fred's Plumbing jets lines for commercial and multi-family properties across DFW.",
    credentials: [],
    photoSubject:
      "A Fred's Plumbing technician jetting a drain line at a commercial property",
  },

  // 2 — the photo collage band the service pages use. It carries ONE photo
  // slot (the small overlapping second photo was removed site-wide at the
  // owner's request), so nothing renders a second placeholder here.
  {
    _type: "serviceAbout",
    _key: "what-it-does",
    heading: "What hydro jetting actually does",
    paragraphs: [
      "A cable machine bores a hole through a clog. Water gets moving again, the line drains, and the call is closed — but the grease, sludge and scale coating the pipe wall are still there, and the line closes back up.",
      "Hydro jetting works differently. A high-pressure hose with a specialised nozzle is fed into the line, and jets of water scour the full inside diameter of the pipe back to bare wall. Grease liquefies, sludge and sediment flush downstream, scale and root intrusion break up. The line is left at its original capacity rather than at the width of a cable.",
      "It's water only. No chemicals go into your building's drains or the municipal system.",
    ],
    photoSubjectPrimary:
      "A jetting hose fed into a cleanout at a commercial property",
  },

  // 3 — what we jet; 6 cards balance 3 + 3 at lg+ (lib/iconCardRows.ts), 2 per
  // row on tablets, 1 on phones. Dark band so it doesn't sit flat against the
  // list band below it.
  {
    _type: "iconCardSection",
    _key: "what-we-jet",
    heading: "What we jet",
    background: "dark",
    cards: [
      {
        _key: "kitchen",
        icon: "flame",
        title: "Kitchen & grease lines",
        description:
          "Restaurant, cafeteria and break-room lines, where grease builds up fastest.",
      },
      {
        _key: "mains",
        icon: "building-2",
        title: "Main sewer lines",
        description: "Full-diameter cleaning of building mains and laterals.",
      },
      {
        _key: "branch",
        icon: "droplets",
        title: "Branch & floor drains",
        description: "Interior lines that back up into occupied space.",
      },
      {
        _key: "storm",
        icon: "waves",
        title: "Storm drains & catch basins",
        description: "Site drainage that silts up between storms.",
      },
      {
        _key: "trench",
        icon: "truck",
        title: "Trench & culvert lines",
        description: "Larger-diameter site and drainage lines.",
      },
      {
        _key: "roots",
        icon: "alert-triangle",
        title: "Roots & scale",
        description:
          "Root intrusion at joints and mineral scale in older cast iron.",
      },
    ],
  },

  // 4 — the comparison, as the scope-list band: 6 rows fill its 2-column grid
  // evenly. The last row is the honest one and it stays in.
  {
    _type: "whatsIncluded",
    _key: "vs-snaking",
    heading: "Jetting vs. cable snaking",
    intro:
      "Both have their place. The difference matters when a line keeps backing up.",
    items: [
      {
        _key: "removal",
        icon: "search-check",
        title: "Removal, not a hole",
        description:
          "A cable punches through a blockage. Jetting removes it and cleans the pipe wall.",
      },
      {
        _key: "grease",
        icon: "flame",
        title: "Grease actually leaves the line",
        description:
          "Grease re-coats and re-clogs quickly after cabling. Jetting liquefies and flushes it out.",
      },
      {
        _key: "diameter",
        icon: "gauge",
        title: "The full pipe diameter",
        description:
          "Jetting cleans the full pipe diameter, restoring the line's original flow capacity.",
      },
      {
        _key: "sediment",
        icon: "waves",
        title: "Sediment, sand and scale",
        description:
          "Jetting breaks up sediment, sand and scale that a cable slides straight past.",
      },
      {
        _key: "no-chemicals",
        icon: "droplets",
        title: "Water only",
        description:
          "No chemicals go into your drains or the municipal system.",
      },
      {
        _key: "cabling",
        icon: "wrench",
        title: "Cabling still has its place",
        description:
          "Cabling is still the right call for some jobs. We'll tell you which one you actually need.",
      },
    ],
  },

  // 5 — how the job runs; 5 cards balance 3 + 2 at lg+. White band between the
  // offwhite list above and the reviews below.
  //
  // ⚠️ The last card is a SERVICE COMMITMENT awaiting client confirmation —
  // `UNCONFIRMED_COMMITMENTS` in ./faqSets.ts. Remove it in Studio if Fred's
  // does not actually offer scheduled recurring jetting.
  {
    _type: "propertyTypes",
    _key: "approach",
    heading: "How we approach a jetting job",
    background: "white",
    cards: [
      {
        _key: "camera-first",
        icon: "search-check",
        title: "Camera first",
        blurb:
          "We inspect the line before jetting it, so we know what's in there and whether the pipe can take it.",
      },
      {
        _key: "nozzle",
        icon: "gauge",
        title: "The right nozzle and pressure",
        blurb:
          "Both are matched to pipe size, pipe material and what's actually blocking the line.",
      },
      {
        _key: "scheduling",
        icon: "calendar-check",
        title: "Scheduled around your operations",
        blurb: "After-hours and weekend work for occupied buildings.",
      },
      {
        _key: "camera-after",
        icon: "clipboard-check",
        title: "Camera again afterwards",
        blurb: "So you can see the line is clean, not just flowing.",
      },
      {
        _key: "recurring",
        icon: "clock-4",
        title: "Scheduled service where it makes sense",
        blurb:
          "Kitchen lines on a regular cycle cost less over a year than emergency call-outs.",
      },
    ],
  },

  // 6 — reviews, configured exactly as the service pages configure theirs.
  // Existing testimonial documents, verbatim; no review structured data.
  {
    _type: "serviceTestimonials",
    _key: "reviews",
    heading: "What Our Clients Say",
    filterTags: ["drain-sewer", "commercial-plumbing"],
    limit: 4,
  },

  // 7 — Q&A, from the shared "Hydro Jetting FAQs" set (its own set: not the
  // multi-family one, not the commercial one, and never inlined). On the
  // published path this is a reference the page query dereferences; here it is
  // that set already resolved.
  hydroJettingFaqBand("faq"),

  // 8 — closing CTA. "{phone}" is replaced with the Site Settings number.
  {
    _type: "finalCta",
    _key: "closing",
    heading: "Have a line that keeps backing up?",
    body: "Tell us what the line is doing and we'll camera it before quoting the work — or call now if it's backing up today.",
    phoneCtaLabel: "Call {phone}",
    secondaryCtaLabel: "Request Service",
    secondaryCtaHref: "/contact",
    showAvailabilityDot: true,
  },
];

/**
 * The same stack in SANITY shape, for anything that writes a document — the
 * shared translation in ./sectionLibrary.ts, pointed at this page's set.
 *
 * Both the Studio prefill (`initialValue` in
 * sanity/schemas/hydroJettingPage.ts) and
 * scripts/seed-hydro-jetting-page.ts go through this, so a document created
 * either way is identical.
 */
export function hydroJettingSectionsForSanity(): Record<string, unknown>[] {
  return sectionsForSanity(defaultHydroJettingSections, {
    faqSetId: HYDRO_JETTING_FAQ_SET_ID,
  });
}
