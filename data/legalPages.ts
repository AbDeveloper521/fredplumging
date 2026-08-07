import type { CmsPhoto, RichBody } from "./services";

/**
 * The two legal documents — FALLBACK for the `legalPage` Sanity documents
 * (see `sanity/lib/getLegalPage.ts`).
 *
 * ⚠️  THE COPY BELOW IS THE CLIENT'S OWN LEGAL TEXT, TRANSCRIBED VERBATIM
 * from their live WordPress pages. Do not "improve" it. "Dallas Fort Worth",
 * "multi family", "error free", "follow up", "third party", "up to date" and
 * "industry standard" are unhyphenated in the source and stay that way; the
 * apostrophe in "Fred's" is a straight quote, as in the source. Every change
 * a proofreader would want is listed in the task report for the owner to
 * approve — none of them are applied here. Legal text is the one place the
 * "typography may be tidied" allowance does not apply.
 *
 * Unlike every other page, these are NOT section stacks: a legal document is
 * one continuous prose run, so the body is Portable Text (h2 / paragraph /
 * bullets / bold / link only) and the banner lives in dedicated fields.
 */

export const LEGAL_SLUGS = ["privacy-policy", "terms-of-service"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

/** The one place a legal page's URL is derived from its slug. */
export function legalHref(slug: LegalSlug): string {
  return `/${slug}`;
}

/**
 * The contact block that closes each document. Structured rather than prose
 * because the design renders it as a card with a real `tel:` link, and
 * deriving that from paragraph text would break the moment the owner edits a
 * sentence. The words are still his to edit.
 */
export interface LegalContactCard {
  name: string;
  /** Display format as the source shows it: "(972) 564 9081". */
  phoneDisplay: string;
  website: string;
}

export interface LegalPageContent {
  slug: LegalSlug;
  /** The H1. */
  title: string;
  eyebrow: string;
  /** Paragraph(s) under the H1 — Privacy has two, Terms has one. */
  intro: string[];
  body: RichBody;
  contact?: LegalContactCard;
  bannerPhoto?: CmsPhoto;
  /** Absent means on — only an explicit Studio opt-out drops the gradient. */
  darkOverlay?: boolean;
  /** Optional, and empty on purpose: neither reference page shows a date. */
  lastUpdated?: string;
  seoTitle?: string;
  seoDescription?: string;
}

type Block = RichBody[number];

const span = (key: string, text: string, marks: string[] = []) => ({
  _type: "span",
  _key: key,
  text,
  marks,
});

const h2 = (key: string, text: string): Block => ({
  _type: "block",
  _key: key,
  style: "h2",
  markDefs: [],
  children: [span(`${key}-t`, text)],
});

const p = (key: string, text: string): Block => ({
  _type: "block",
  _key: key,
  style: "normal",
  markDefs: [],
  children: [span(`${key}-t`, text)],
});

const bullets = (key: string, items: string[]): Block[] =>
  items.map((text, i) => ({
    _type: "block",
    _key: `${key}-${i}`,
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [span(`${key}-${i}-t`, text)],
  }));

/** A paragraph with one internal link applied to words already in the copy. */
const pLinked = (
  key: string,
  before: string,
  linkText: string,
  href: string,
  after: string,
): Block => ({
  _type: "block",
  _key: key,
  style: "normal",
  markDefs: [{ _type: "link", _key: `${key}-l`, href }],
  children: [
    span(`${key}-a`, before),
    span(`${key}-b`, linkText, [`${key}-l`]),
    span(`${key}-c`, after),
  ],
});

/** Identical in both documents. */
const CONTACT_CARD: LegalContactCard = {
  name: "Fred's Plumbing Service",
  phoneDisplay: "(972) 564 9081",
  // The source screenshot reads "fredsplumbingservices.com"; the owner has
  // confirmed that domain is wrong and the site is https://fredsplumbing.com.
  // The one place these documents deliberately depart from the screenshot.
  website: "fredsplumbing.com",
};

const TERMS_OF_SERVICE: LegalPageContent = {
  slug: "terms-of-service",
  title: "Terms Of Service For Fred's Plumbing Service",
  eyebrow: "FRED'S PLUMBING",
  intro: [
    "Welcome to the Fred's Plumbing Service website. By accessing or using this website, you agree to comply with and be bound by the following Terms of Service. Please read these terms carefully before using our website or requesting services.",
  ],
  body: [
    h2("tos-use", "Use of Website"),
    p(
      "tos-use-1",
      "This website is intended to provide information about Fred's Plumbing Service and the plumbing services we offer throughout the Dallas Fort Worth Metroplex.",
    ),
    p(
      "tos-use-2",
      "You agree to use this website only for lawful purposes and in a manner that does not interfere with the operation, security, or accessibility of the website.",
    ),

    h2("tos-requests", "Service Requests and Estimates"),
    p(
      "tos-requests-1",
      "Submitting a contact form or requesting an estimate through this website does not guarantee service availability or create a binding agreement. All services are subject to scheduling, property evaluation, and final approval by Fred's Plumbing Service.",
    ),
    p(
      "tos-requests-2",
      "Pricing estimates may vary depending on the scope of work, accessibility, materials required, and unforeseen conditions discovered during service.",
    ),

    h2("tos-emergency", "Emergency Services"),
    p(
      "tos-emergency-1",
      "Fred's Plumbing Service offers emergency plumbing support; however, response times may vary depending on technician availability, weather conditions, traffic, and service demand.",
    ),
    p(
      "tos-emergency-2",
      "We make every reasonable effort to respond quickly and provide reliable emergency assistance.",
    ),

    h2("tos-payments", "Payments and Billing"),
    p(
      "tos-payments-1",
      "Payment terms for plumbing services will be discussed and agreed upon before work begins whenever possible. Failure to submit payment according to agreed terms may result in delayed future services or additional collection efforts.",
    ),
    p(
      "tos-payments-2",
      "For commercial and multi family clients, invoicing terms may vary based on vendor agreements or approved billing arrangements.",
    ),

    h2("tos-content", "Website Content"),
    p(
      "tos-content-1",
      "All content on this website, including text, graphics, logos, images, and design elements, is the property of Fred's Plumbing Service unless otherwise stated.",
    ),
    p(
      "tos-content-2",
      "You may not copy, reproduce, distribute, or use website content without written permission from Fred's Plumbing Service.",
    ),

    h2("tos-liability", "Limitation of Liability"),
    p(
      "tos-liability-1",
      "Fred's Plumbing Service strives to keep website information accurate and up to date; however, we do not guarantee that all information is complete, accurate, or error free at all times.",
    ),
    p(
      "tos-liability-2",
      "Fred's Plumbing Service shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use of this website or reliance on its content.",
    ),

    h2("tos-third-party", "Third Party Links"),
    p(
      "tos-third-party-1",
      "This website may contain links to third party websites or vendor platforms. Fred's Plumbing Service is not responsible for the content, policies, or practices of third party websites.",
    ),

    h2("tos-privacy", "Privacy"),
    // The link sits on words already in the copy — the first mention only, so
    // the same target isn't linked twice in one paragraph.
    pLinked(
      "tos-privacy-1",
      "Your use of this website is also governed by our ",
      "Privacy Policy",
      "/privacy-policy",
      ". By using this website, you consent to the collection and use of information as described in the Privacy Policy.",
    ),

    h2("tos-changes", "Changes to Terms"),
    p(
      "tos-changes-1",
      "Fred's Plumbing Service reserves the right to update or modify these Terms of Service at any time without prior notice. Continued use of the website after changes are posted constitutes acceptance of the updated terms.",
    ),

    h2("tos-law", "Governing Law"),
    p(
      "tos-law-1",
      "These Terms of Service shall be governed by and interpreted in accordance with the laws of the State of Texas.",
    ),

    h2("tos-contact", "Contact Information"),
    p(
      "tos-contact-1",
      "If you have questions regarding these Terms of Service, please contact:",
    ),
  ],
  contact: CONTACT_CARD,
  seoTitle: "Terms of Service | Fred's Plumbing",
  seoDescription:
    "The Terms of Service for the Fred's Plumbing Service website, covering service requests and estimates, emergency response, payments, website content, and governing law.",
};

const PRIVACY_POLICY: LegalPageContent = {
  slug: "privacy-policy",
  title: "Privacy Policy For Fred's Plumbing Service",
  eyebrow: "FRED'S PLUMBING",
  intro: [
    "Fred's Plumbing Service respects your privacy and is committed to protecting the personal information you provide through our website and communication channels.",
    "This Privacy Policy explains how we collect, use, and safeguard your information when you interact with our company online or offline. By using our website, you agree to the practices described in this policy.",
  ],
  body: [
    h2("pp-collect", "Information We Collect"),
    p(
      "pp-collect-1",
      "We may collect personal information that you voluntarily provide when you:",
    ),
    ...bullets("pp-collect-list", [
      "Fill out a contact or service request form",
      "Call or email our office",
      "Request an estimate or emergency service",
      "Apply for employment opportunities",
      "Sign up for updates or communications",
    ]),
    p("pp-collect-2", "The information we collect may include:"),
    ...bullets("pp-collect-list2", [
      "Name",
      "Phone number",
      "Email address",
      "Property or service address",
      "Company or property management information",
      "Details related to your plumbing service request",
    ]),
    p(
      "pp-collect-3",
      "We may also collect limited technical information automatically through website analytics tools, including:",
    ),
    ...bullets("pp-collect-list3", [
      "IP address",
      "Browser type",
      "Device information",
      "Pages visited on our website",
      "Time spent on the site",
    ]),

    h2("pp-use", "How We Use Your Information"),
    p("pp-use-1", "Fred's Plumbing Service uses collected information to:"),
    ...bullets("pp-use-list", [
      "Respond to inquiries and service requests",
      "Schedule plumbing services and appointments",
      "Provide estimates and customer support",
      "Improve website performance and user experience",
      "Communicate important updates or service information",
      "Maintain internal business records",
      "Support hiring and employment processes",
    ]),
    p(
      "pp-use-2",
      "We do not sell or rent your personal information to third parties.",
    ),

    h2("pp-marketing", "Communication and Marketing"),
    p(
      "pp-marketing-1",
      "We may contact you regarding your inquiry, service appointment, or follow up communication related to our services. If you choose to receive marketing communications, you may opt out at any time by contacting our office.",
    ),

    h2("pp-sharing", "Information Sharing"),
    p(
      "pp-sharing-1",
      "We may share information with trusted service providers or business partners only when necessary to operate our business or complete requested services. These parties are required to maintain confidentiality and protect your information.",
    ),
    p(
      "pp-sharing-2",
      "We may also disclose information when required by law or when necessary to protect our legal rights, property, or safety.",
    ),

    h2("pp-security", "Data Security"),
    // ⚠️ The middle of this sentence was obscured by a floating accessibility
    // widget in the source screenshot. "can be guaranteed" is a
    // reconstruction awaiting the owner's confirmation against the live page.
    p(
      "pp-security-1",
      "Fred's Plumbing Service takes reasonable precautions to protect your personal information from unauthorized access, misuse, or disclosure. While no online transmission can be guaranteed completely secure, we use industry standard practices to safeguard the information we collect.",
    ),

    h2("pp-cookies", "Cookies and Website Analytics"),
    p(
      "pp-cookies-1",
      "Our website may use cookies and analytics tools to improve functionality and understand how visitors use the site. These technologies help us improve user experience and website performance.",
    ),
    p(
      "pp-cookies-2",
      "You may choose to disable cookies through your browser settings at any time.",
    ),

    h2("pp-third-party", "Third Party Links"),
    p(
      "pp-third-party-1",
      "Our website may contain links to third party websites or vendor platforms. Fred's Plumbing Service is not responsible for the privacy practices or content of external websites.",
    ),

    h2("pp-children", "Children's Privacy"),
    p(
      "pp-children-1",
      "Our website and services are not directed toward children under the age of 13. We do not knowingly collect personal information from children.",
    ),

    h2("pp-updates", "Updates to This Privacy Policy"),
    p(
      "pp-updates-1",
      "Fred's Plumbing Service may update this Privacy Policy periodically. Any changes will be posted on this page with the updated effective date.",
    ),

    h2("pp-contact", "Contact Us"),
    p(
      "pp-contact-1",
      "If you have questions about this Privacy Policy or how your information is handled, please contact us:",
    ),
  ],
  contact: CONTACT_CARD,
  seoTitle: "Privacy Policy | Fred's Plumbing",
  seoDescription:
    "How Fred's Plumbing Service collects, uses, and safeguards the information you provide through our website and communication channels.",
};

export const legalPages: Record<LegalSlug, LegalPageContent> = {
  "privacy-policy": PRIVACY_POLICY,
  "terms-of-service": TERMS_OF_SERVICE,
};

/** Short label used by the cross-link between the two documents. */
export const LEGAL_SHORT_TITLES: Record<LegalSlug, string> = {
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Terms of Service",
};
