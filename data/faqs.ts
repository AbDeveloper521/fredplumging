export interface Faq {
  question: string;
  answer: string;
}

/**
 * Vendor-onboarding questions — rendered on /about/partners AND appended to
 * the shared list below (FAQPage JSON-LD must use the exact rendered
 * strings, so both pages read from this single source).
 */
export const vendorFaqs: Faq[] = [
  {
    question: "Which vendor compliance systems is Fred's Plumbing registered with?",
    answer:
      "We are registered and in good standing on VendorCafe, Compliance Depot, Vendor Nexus, NetVendor, and RealPage. Our Partners page describes each registration and what it covers.",
  },
  {
    question: "How long does vendor approval take if we use a portal you're already in?",
    answer:
      "Usually a same-day lookup rather than a new onboarding cycle — our documentation, insurance, and certifications are already on file in those systems. If you use a different platform, send us its requirements and we will start the registration right away.",
  },
  {
    question: "Can you provide certificates of insurance naming our property as additional insured?",
    answer:
      "Yes. Certificates can be issued through your vendor portal or directly from our carrier. Request one through the portal, or contact our office with the exact wording your property requires.",
  },
];

export const faqs: Faq[] = [
  {
    question: "Do you provide 24/7 emergency plumbing service?",
    answer:
      "Yes. Our team is available around the clock, every day of the year, for urgent issues like active leaks, sewer backups, burst pipes, and overflowing fixtures. Call 972-564-9081 any time and we will dispatch a technician.",
  },
  {
    question: "Do you work with apartment and multi-family properties?",
    answer:
      "Multi-family is our specialty. We support apartment communities, condominiums, senior care facilities, and student housing with unit-level repairs, common-area systems, turnover work, and preventive maintenance programs.",
  },
  {
    question: "Which areas do you serve?",
    answer:
      "We serve the entire Dallas–Fort Worth Metroplex, including Dallas, Fort Worth, Arlington, Irving, Plano, Frisco, Grapevine, Grand Prairie, McKinney, Richardson, and surrounding communities.",
  },
  {
    question: "Can you support ongoing preventive maintenance?",
    answer:
      "Yes. We build planned maintenance programs around your property — scheduled inspections, drain and sewer maintenance, water heater service, and seasonal preparation — to reduce emergencies and extend system life.",
  },
  {
    question: "Are you licensed and insured?",
    answer:
      "Yes. Fred's Plumbing is fully licensed and insured, and we maintain current documentation that we can provide for your vendor files at any time.",
  },
  {
    question: "Can your company meet vendor compliance requirements?",
    answer:
      "Yes. We maintain the insurance, licensing, and credentialing required by major property management organizations and are registered with common vendor systems such as VendorCafe, NetVendor, and Nexus.",
  },
  ...vendorFaqs,
];
