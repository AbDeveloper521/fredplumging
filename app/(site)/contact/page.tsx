import type { Metadata } from "next";
import { getSite } from "@/sanity/lib/getSite";
import { getContactPage } from "@/sanity/lib/getContactPage";
import { getSectionData } from "@/sanity/lib/getSectionData";
import type { ServiceFaqSection } from "@/data/serviceSections";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Contact Fred's Plumbing | Commercial & Multi-Family Plumbers in DFW",
  description:
    "Call 24/7 or request a quote for commercial and multi-family plumbing across the Dallas–Fort Worth Metroplex. We typically respond within one business hour during business hours.",
  alternates: { canonical: "/contact" },
};

/**
 * ContactPage structured data: telephone + email + service area. No
 * PostalAddress (there is no published street address) and — as everywhere
 * on this site — no review or rating markup.
 */
async function ContactPageJsonLd() {
  const site = await getSite();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Fred's Plumbing",
          url: `${site.url}/contact`,
          mainEntity: {
            "@type": "Plumber",
            name: site.name,
            legalName: site.legalName,
            telephone: site.phoneHref.replace(/^tel:/, ""),
            email: site.email,
            url: site.url,
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              telephone: site.phoneHref.replace(/^tel:/, ""),
              email: site.email,
              areaServed: {
                "@type": "AdministrativeArea",
                name: site.serviceArea,
              },
              availableLanguage: "English",
            },
          },
        }),
      }}
    />
  );
}

export default async function ContactPage() {
  const [sections, data] = await Promise.all([
    getContactPage(),
    getSectionData(),
  ]);

  // FAQPage schema uses the exact strings a Q&A section renders — the page
  // has carried one since it was hand-built, so the stack keeps it.
  const faqSection = sections.find(
    (section): section is ServiceFaqSection => section._type === "serviceFaq",
  );

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {faqSection && <FaqJsonLd faqs={faqSection.faqs} />}
      <ContactPageJsonLd />
      <SectionRenderer sections={sections} data={data} idPrefix="contact" />
    </>
  );
}
