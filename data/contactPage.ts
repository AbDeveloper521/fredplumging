/**
 * Contact-page copy. As with the rest of the site, these constants are the
 * FALLBACK: the page reads via `getContactPage()` in
 * `sanity/lib/getContactPage.ts`, which sources the `contactPage` singleton
 * from Sanity and falls back to these values when the fetch fails (or the
 * singleton hasn't been published yet). The page ships identical with an
 * empty dataset.
 */

export interface ContactHoursRow {
  days: string;
  hours: string;
}

export interface ContactFaq {
  question: string;
  answer: string;
}

export interface ContactPageContent {
  heroEyebrow: string;
  heroHeading: string;
  heroIntro: string;
  /** The response-time promise shown with the quote path and the form. */
  responsePromise: string;
  hours: ContactHoursRow[];
  emergencyHeading: string;
  emergencyBody: string;
  faqs: ContactFaq[];
}

export const contactPage: ContactPageContent = {
  heroEyebrow: "Contact",
  heroHeading: "Talk to a Plumbing Team That Answers",
  heroIntro:
    "Whether it's an active emergency or next quarter's repipe budget, the fastest way to a clear answer is a short conversation. Call any time, or send the details and we'll come back to you with next steps.",
  responsePromise:
    "We typically respond within one business hour during business hours.",
  hours: [
    { days: "Monday – Friday", hours: "7:00 AM – 6:00 PM" },
    { days: "Emergencies", hours: "24/7, every day of the year" },
  ],
  emergencyHeading: "Emergency? Call now.",
  emergencyBody:
    "Active leak, no water, sewage backup — don't type, call. Our dispatch line answers around the clock and a technician is routed immediately.",
  faqs: [
    {
      question: "How fast do you respond to a service request?",
      answer:
        "We typically respond within one business hour during business hours. For emergencies, call us instead of using the form — the dispatch line answers 24/7 and routes a technician immediately.",
    },
    {
      question: "Do you take after-hours and weekend calls?",
      answer:
        "Yes. Emergency dispatch runs 24/7, every day of the year. The same number on this page reaches us at 2 AM on a Sunday as at 10 AM on a Tuesday.",
    },
    {
      question: "Do you service single-family homes?",
      answer:
        "Our focus is commercial and multi-family properties — apartments, condos, HOAs, offices, retail, and care facilities across the Dallas–Fort Worth Metroplex. If you manage a portfolio that includes single-family rentals, tell us about it in the form and we'll let you know how we can help.",
    },
    {
      question: "What do you need from me to put a quote together?",
      answer:
        "The property type and location, what's happening (or what you're planning), and how soon you need it done. Photos help but aren't required — we confirm the rest on a short call before anything is scheduled.",
    },
    {
      question: "Are you an approved vendor on our compliance platform?",
      answer:
        "We're registered and in good standing on VendorCafe, Compliance Depot, Vendor Nexus, NetVendor, and RealPage, with insurance and licensing kept current in each system. If you use a different platform, we can usually complete onboarding quickly.",
    },
    {
      question: "Can you provide a certificate of insurance (COI)?",
      answer:
        "Yes. Documentation — insurance, licensing, and certificates — is kept current and can be supplied for your records during onboarding. Ask for what your ownership group requires and we'll send it over.",
    },
  ],
};
