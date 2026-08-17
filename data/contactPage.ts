import { sectionsForSanity } from "./sectionLibrary";
import type {
  ServiceAreaSection,
  ServiceFaqSection,
  ServiceHeroSection,
  ServiceTestimonialsSection,
} from "./serviceSections";

/**
 * Contact-page section stack — FALLBACK for the `contactPage` Sanity
 * singleton (see `sanity/lib/getContactPage.ts`). Same architecture as every
 * other page stack: the owner reorders, hides, duplicates and removes these
 * bands in Studio, and adds new ones from the shared section library.
 *
 * This is a RESTRUCTURE of the hand-built page, not a rewrite — every string
 * below is the copy that page already shipped, moved verbatim. Two bands had
 * no equivalent in the shared library and are added to it here:
 *   - `contactChannels` — the call-now / request-a-quote split
 *   - `contactForm`     — the lead form band with its details sidebar
 * Everything else reuses library types the site already had (serviceHero,
 * serviceArea, serviceTestimonials, serviceFaq).
 *
 * NOTHING in here restates a business fact. Phone, email, service area,
 * licence number, years in business and opening hours all resolve from Site
 * Settings (`data/site.ts` → `getSite()`) at render time; the hero's
 * credential labels use `{license}` / `{years}` tokens for the same reason.
 */

interface SectionMeta<T extends string> {
  _type: T;
  _key: string;
  /** Hidden in Studio: content kept, section skipped at render. */
  hidden?: boolean;
}

/**
 * The two-path band: "this is an emergency, call" beside "this isn't, send
 * the details". The phone number itself is never stored here — it comes from
 * Site Settings.
 */
export interface ContactChannelsContent {
  /** Eyebrow on the dark card, e.g. "Emergency? Call now." */
  emergencyHeading: string;
  emergencyBody: string;
  /** Small caps line under the phone number. */
  emergencyNote: string;
  /** Eyebrow on the light card, e.g. "Request a quote". */
  quoteHeading: string;
  quoteBody: string;
  quoteCtaLabel?: string;
  quoteCtaHref?: string;
}

/**
 * Every string the lead form renders. The FIELDS are fixed in code — see the
 * note on `contactForm` in `sanity/schemas/contactSections.ts` — but all of
 * their visible text is editable, because relabelling a field is copywriting
 * and adding one is a schema change.
 */
export interface ContactFormContent {
  heading: string;
  intro?: string;
  /** Fieldset legends. */
  workLegend: string;
  contactLegend: string;
  /** Field labels + the two free-text placeholders. */
  serviceLabel: string;
  servicePlaceholder: string;
  propertyTypeLabel: string;
  locationLabel: string;
  urgencyLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  nameLabel: string;
  companyLabel: string;
  phoneLabel: string;
  emailLabel: string;
  contactMethodLabel: string;
  referralLabel: string;
  /** Submit button, and its label while the request is in flight. */
  submitLabel: string;
  submittingLabel: string;
  /** Reassurance line under the button. `{phone}` becomes a call link. */
  submitNote?: string;
  /**
   * Privacy/consent line under the button. EMPTY in the shipped copy — the
   * hand-built page had none, and inventing legal wording is the client's
   * call, not this refactor's. Renders only once filled in.
   */
  consentLine?: string;
  /** Callout shown when "Emergency" is picked. `{phone}` becomes a link. */
  emergencyNotice: string;
  /** Success state. `{phone}` becomes a call link in the body. */
  successHeading: string;
  successBody: string;
  successAgainLabel: string;
  /** Generic submit failure. `{phone}` becomes a call link. */
  errorMessage: string;
  /** The details sidebar: labels only — every VALUE comes from Site Settings. */
  detailsHeading: string;
  phoneRowLabel: string;
  emailRowLabel: string;
  serviceAreaRowLabel: string;
  hoursRowLabel: string;
  licenseRowLabel: string;
}

/** Per-type default copy — also the render-time fill for emptied fields. */
export interface ContactPageDefaults {
  channels: ContactChannelsContent;
  form: ContactFormContent;
}

export const contactPageDefaults: ContactPageDefaults = {
  channels: {
    emergencyHeading: "Emergency? Call now.",
    emergencyBody:
      "Active leak, no water, sewage backup — don't type, call. Our dispatch line answers around the clock and a technician is routed immediately.",
    emergencyNote: "24/7 emergency dispatch",
    quoteHeading: "Request a quote",
    quoteBody:
      "Not an emergency? Send the details of the property and the work. We typically respond within one business hour during business hours.",
    quoteCtaLabel: "Start Your Request",
    quoteCtaHref: "#contact-form",
  },
  form: {
    heading: "Tell Us About the Work",
    intro:
      "Five required fields, the rest optional — we confirm everything else on the callback.",
    workLegend: "About the work",
    contactLegend: "How we reach you",
    serviceLabel: "Service needed",
    servicePlaceholder: "Select a service…",
    propertyTypeLabel: "Property type",
    locationLabel: "City or property address",
    urgencyLabel: "How soon do you need us?",
    messageLabel: "Describe the work",
    messagePlaceholder:
      "What's happening, which building or units are affected, anything we should know before we call…",
    nameLabel: "Full name",
    companyLabel: "Company or property group",
    phoneLabel: "Phone",
    emailLabel: "Email",
    contactMethodLabel: "Preferred contact",
    referralLabel: "How did you hear about us?",
    submitLabel: "Request a Quote",
    submittingLabel: "Sending…",
    submitNote:
      "We typically respond within one business hour during business hours.",
    // Deliberately empty — see the interface note above.
    consentLine: "",
    emergencyNotice:
      "For an active emergency, a form is the slow path — call {phone} now. We dispatch 24/7. You can still submit this form for the paper trail.",
    successHeading: "Request received",
    successBody:
      "We typically respond within one business hour during business hours. Need us sooner? Call {phone} — we answer 24/7.",
    successAgainLabel: "Submit another request",
    errorMessage:
      "Something went wrong sending your request. Please try again, or call {phone}.",
    detailsHeading: "Contact details",
    phoneRowLabel: "Phone — answered 24/7",
    emailRowLabel: "Email",
    serviceAreaRowLabel: "Service area",
    hoursRowLabel: "Hours",
    licenseRowLabel: "Licensed & insured",
  },
};

/**
 * The two section types this page contributes to the shared library. Both are
 * general-purpose: a "call us or send details" split and a request-service
 * band are wanted on service and city pages too, which is exactly why they go
 * in the library rather than staying local to /contact.
 */
export type ContactSection =
  | (SectionMeta<"contactChannels"> & ContactChannelsContent)
  | (SectionMeta<"contactForm"> & ContactFormContent);

/** Every type the shipped /contact stack uses. */
export type ContactPageSection =
  | ContactSection
  | (ServiceHeroSection & { hidden?: boolean })
  | (ServiceAreaSection & { hidden?: boolean })
  | (ServiceTestimonialsSection & { hidden?: boolean })
  | (ServiceFaqSection & { hidden?: boolean });

export const defaultContactSections: ContactPageSection[] = [
  // 1 — the dark banner. Standard library hero; the credential labels carry
  // {license}/{years} tokens so the licence number and the years count stay
  // in Site Settings instead of being retyped here.
  {
    _type: "serviceHero",
    _key: "hero",
    eyebrow: "Contact",
    heading: "Talk to a Plumbing Team That Answers",
    subheading:
      "Whether it's an active emergency or next quarter's repipe budget, the fastest way to a clear answer is a short conversation. Call any time, or send the details and we'll come back to you with next steps.",
    credentials: [
      { _key: "licensed", icon: "shield-check", label: "Licensed · {license}" },
      { _key: "years", icon: "map-pin", label: "{years} years in DFW" },
      { _key: "dispatch", icon: "clock", label: "24/7 dispatch" },
    ],
  },

  // 2 — call now vs. send the details.
  {
    _type: "contactChannels",
    _key: "channels",
    ...contactPageDefaults.channels,
  },

  // 3 — the lead form and the details sidebar. Removing this band is allowed
  // (the owner asked for full control) but warned about at document level:
  // a Contact page with no form captures nothing.
  {
    _type: "contactForm",
    _key: "form",
    ...contactPageDefaults.form,
  },

  // 4 — coverage band. Cities come from the cityPage documents and the chip
  // list from Site Settings, so a third city never edits this page.
  {
    _type: "serviceArea",
    _key: "area",
    heading: "Where We Work",
    body: "We serve commercial and multi-family properties across the Dallas–Fort Worth Metroplex. The cities below are representative, not exhaustive — if your property is in the metro area, call and we'll confirm coverage on the spot.",
    photoSubject: "The Dallas–Fort Worth skyline",
  },

  // 5 — reviews, from the Testimonials collection.
  {
    _type: "serviceTestimonials",
    _key: "reviews",
    heading: "Property Teams That Already Rely on Us",
    limit: 3,
  },

  // 6 — the contact-specific Q&A. Kept as an inline `serviceFaq` (not a
  // shared faqSet) because these answers are about contacting us, not about
  // a service — no other page shows them.
  {
    _type: "serviceFaq",
    _key: "faq",
    heading: "Contacting Us, Answered",
    background: "offwhite",
    faqs: [
      {
        _key: "response-time",
        question: "How fast do you respond to a service request?",
        answer:
          "We typically respond within one business hour during business hours. For emergencies, call us instead of using the form — the dispatch line answers 24/7 and routes a technician immediately.",
      },
      {
        _key: "after-hours",
        question: "Do you take after-hours and weekend calls?",
        answer:
          "Yes. Emergency dispatch runs 24/7, every day of the year. The same number on this page reaches us at 2 AM on a Sunday as at 10 AM on a Tuesday.",
      },
      {
        _key: "single-family",
        question: "Do you service single-family homes?",
        answer:
          "Our focus is commercial and multi-family properties — apartments, condos, HOAs, offices, retail, and care facilities across the Dallas–Fort Worth Metroplex. If you manage a portfolio that includes single-family rentals, tell us about it in the form and we'll let you know how we can help.",
      },
      {
        _key: "quote-inputs",
        question: "What do you need from me to put a quote together?",
        answer:
          "The property type and location, what's happening (or what you're planning), and how soon you need it done. Photos help but aren't required — we confirm the rest on a short call before anything is scheduled.",
      },
      {
        _key: "vendor-platforms",
        question: "Are you an approved vendor on our compliance platform?",
        answer:
          "We're registered and in good standing on VendorCafe, Compliance Depot, Vendor Nexus, NetVendor, and RealPage, with insurance and licensing kept current in each system. If you use a different platform, we can usually complete onboarding quickly.",
      },
      {
        _key: "coi",
        question: "Can you provide a certificate of insurance (COI)?",
        answer:
          "Yes. Documentation — insurance, licensing, and certificates — is kept current and can be supplied for your records during onboarding. Ask for what your ownership group requires and we'll send it over.",
      },
    ],
  },
];

/**
 * The same stack in SANITY shape, for anything that writes a document — the
 * shared translation in `data/sectionLibrary.ts`. No `faqSetId`: this page's
 * Q&A is an inline `serviceFaq` about contacting us, not one of the shared
 * sets, so there is no reference to point anywhere.
 *
 * Both the Studio prefill (`initialValue` in sanity/schemas/contactPage.ts)
 * and scripts/seed-contact-sections.ts go through this, so a document created
 * either way is identical.
 */
export function contactSectionsForSanity(): Record<string, unknown>[] {
  return sectionsForSanity(defaultContactSections);
}
