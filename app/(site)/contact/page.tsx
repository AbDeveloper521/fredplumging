import type { Metadata } from "next";
import {
  Clock,
  FileCheck2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { getSite } from "@/sanity/lib/getSite";
import { getServices } from "@/sanity/lib/getServices";
import { getContactPage } from "@/sanity/lib/getContactPage";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
import { getReviewSettings } from "@/sanity/lib/getReviewSettings";
import type { SiteContent } from "@/data/site";
import type {
  ServiceAreaSection as ServiceAreaSectionData,
  ServiceFaqSection as ServiceFaqSectionData,
} from "@/data/serviceSections";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ContactQuoteForm } from "@/components/forms/ContactQuoteForm";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ServiceFaqSection } from "@/components/sections/ServiceFaqSection";
import { ServiceAreaCmsSection } from "@/components/sections/ServiceAreaCmsSection";
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

function DetailsColumn({
  site,
  hours,
}: {
  site: SiteContent;
  hours: Array<{ days: string; hours: string }>;
}) {
  return (
    <div className="rounded-2xl border border-grey-100 bg-white p-6 shadow-(--shadow-card) sm:p-8">
      <h3 className="text-lg font-extrabold tracking-tight text-navy-900">
        Contact details
      </h3>
      <ul className="mt-5 space-y-5 text-[15px]">
        <li className="flex items-start gap-3">
          <Phone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div>
            <p className="font-bold text-navy-900">Phone — answered 24/7</p>
            <a href={site.phoneHref} className="text-grey-700 hover:text-red-600">
              {site.phone}
            </a>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div>
            <p className="font-bold text-navy-900">Email</p>
            <a href={site.emailHref} className="break-all text-grey-700 hover:text-red-600">
              {site.email}
            </a>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div>
            <p className="font-bold text-navy-900">Service area</p>
            <p className="text-grey-700">{site.serviceArea}</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div>
            <p className="font-bold text-navy-900">Hours</p>
            {hours.map((row) => (
              <p key={row.days} className="text-grey-700">
                {row.days}: {row.hours}
              </p>
            ))}
          </div>
        </li>
        <li className="flex items-start gap-3">
          <FileCheck2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div>
            <p className="font-bold text-navy-900">Licensed &amp; insured</p>
            <p className="text-grey-700">{site.licenseNumber}</p>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default async function ContactPage() {
  const [site, services, content, testimonials, profile] = await Promise.all([
    getSite(),
    getServices(),
    getContactPage(),
    getTestimonials(),
    getReviewSettings(),
  ]);

  const serviceOptions = [...services.map((service) => service.title), "Other"];

  const credentials = [
    { icon: ShieldCheck, label: `Licensed · ${site.licenseNumber}` },
    { icon: MapPin, label: `${site.yearsInBusiness} years in DFW` },
    { icon: Clock, label: "24/7 dispatch" },
  ];

  const faqSection: ServiceFaqSectionData = {
    _type: "serviceFaq",
    _key: "contact-faq",
    heading: "Contacting Us, Answered",
    background: "offwhite",
    faqs: content.faqs.map((faq, i) => ({
      _key: `contact-faq-${i + 1}`,
      question: faq.question,
      answer: faq.answer,
    })),
  };

  const areaSection: ServiceAreaSectionData = {
    _type: "serviceArea",
    _key: "contact-area",
    heading: "Where We Work",
    body: `We serve commercial and multi-family properties across the ${site.serviceArea}. The cities below are representative, not exhaustive — if your property is in the metro area, call and we'll confirm coverage on the spot.`,
    photoSubject: "The Dallas–Fort Worth skyline",
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
      />
      <FaqJsonLd faqs={faqSection.faqs} />
      <ContactPageJsonLd />

      {/* Hero — same dark treatment as the Partners page */}
      <section
        aria-labelledby="page-heading"
        className="relative isolate overflow-hidden bg-navy-950"
      >
        <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_10%,rgb(27_48_73/0.9),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_85%_80%,rgb(211_33_39/0.16),transparent_65%)]"
        />

        <Container className="relative pt-[120px] pb-16 lg:pt-[190px] lg:pb-24">
          <p className="flex items-center gap-3 text-[13px] font-bold tracking-[0.14em] text-red-500 uppercase">
            <span aria-hidden="true" className="h-px w-8 bg-red-500" />
            {content.heroEyebrow}
          </p>
          <h1
            id="page-heading"
            className="mt-6 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight text-balance text-white sm:text-[44px] lg:text-[52px]"
          >
            {content.heroHeading}
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-grey-300">
            {content.heroIntro}
          </p>
          <ul className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            {credentials.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-sm font-bold text-white"
              >
                <Icon aria-hidden="true" className="size-4 text-red-500" />
                {label}
              </li>
            ))}
          </ul>
        </Container>

        <svg
          aria-hidden="true"
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          className="relative block h-10 w-full text-white sm:h-16"
        >
          <path
            d="M0 64h1440V22C1200 2 960 0 720 12S240 44 0 30v34Z"
            fill="currentColor"
          />
        </svg>
      </section>

      {/* Two paths: emergency call vs. quote */}
      <section aria-label="How to reach us" className="bg-white pt-2 pb-16 sm:pb-20">
        <Container className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-navy-950 p-8 sm:p-10">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-red-600" />
            <p className="flex items-center gap-3 text-[13px] font-bold tracking-[0.14em] text-red-500 uppercase">
              <span
                aria-hidden="true"
                className="availability-dot size-1.5 rounded-full bg-red-500"
              />
              {content.emergencyHeading}
            </p>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-grey-300">
              {content.emergencyBody}
            </p>
            <a
              href={site.phoneHref}
              className="mt-6 inline-flex items-center gap-3 text-[30px] font-extrabold tracking-tight text-white transition-colors hover:text-red-500 sm:text-[38px]"
            >
              <Phone aria-hidden="true" className="size-8 text-red-500" />
              {site.phone}
            </a>
            <p className="mt-2 text-[13px] font-semibold tracking-wide text-grey-300 uppercase">
              24/7 emergency dispatch
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-grey-100 bg-offwhite p-8 shadow-(--shadow-card) sm:p-10">
            <div>
              <p className="text-[13px] font-bold tracking-[0.14em] text-red-600 uppercase">
                Request a quote
              </p>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-grey-700">
                Not an emergency? Send the details of the property and the
                work. {content.responsePromise}
              </p>
            </div>
            <div className="mt-7">
              <Button href="#quote-form" variant="dark" size="lg" withArrow>
                Start Your Request
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Form + details */}
      <section
        id="quote-form"
        aria-labelledby="quote-form-heading"
        className="scroll-mt-24 bg-offwhite py-16 sm:py-24"
      >
        <Container>
          <h2
            id="quote-form-heading"
            className="max-w-2xl text-[28px] leading-tight font-extrabold tracking-tight text-navy-900 sm:text-[34px]"
          >
            Tell Us About the Work
          </h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-grey-700">
            Five required fields, the rest optional — we confirm everything
            else on the callback.
          </p>
          <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
            <ContactQuoteForm site={site} serviceOptions={serviceOptions} />
            <DetailsColumn site={site} hours={content.hours} />
          </div>
        </Container>
      </section>

      <ServiceAreaCmsSection section={areaSection} site={site} id="contact-area" />

      <TestimonialsSection
        testimonials={testimonials}
        site={site}
        profile={profile}
        heading="Property Teams That Already Rely on Us"
        titleId="contact-reviews-heading"
        limit={3}
      />

      <ServiceFaqSection section={faqSection} id="contact-faq" />
    </>
  );
}
