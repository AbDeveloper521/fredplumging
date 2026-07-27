import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIndustries, getIndustryBySlug } from "@/sanity/lib/getIndustries";
import { getServices } from "@/sanity/lib/getServices";
import { getSite } from "@/sanity/lib/getSite";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
import { getTrustLogos } from "@/sanity/lib/getTrustLogos";
import { industryHref } from "@/data/industries";
import type { ServiceFaqSection } from "@/data/serviceSections";
import { CmsDetailPage } from "@/components/layout/CmsDetailPage";
import { ServiceSectionRenderer } from "@/components/sections/ServiceSectionRenderer";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  ServiceJsonLd,
} from "@/components/seo/JsonLd";

/**
 * All published property types prerender at build time; one created in the
 * Studio afterwards is generated on first request (ISR) — no 404 window.
 */
export async function generateStaticParams() {
  const industries = await getIndustries();
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [industry, site] = await Promise.all([
    getIndustryBySlug(slug),
    getSite(),
  ]);
  if (!industry) return {};

  const title = industry.seoTitle ?? `${industry.title} | ${site.name}`;
  const description = industry.seoDescription ?? industry.description;
  const path = industryHref(industry.slug);

  return {
    title,
    description,
    // Relative — resolved to an absolute URL against metadataBase (root layout).
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      url: path,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) notFound();

  const path = industryHref(industry.slug);
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Multifamily", href: "/multifamily" },
    { label: industry.title, href: path },
  ];

  const structuredData = (
    <>
      <ServiceJsonLd
        name={`Plumbing Services for ${industry.title}`}
        description={industry.seoDescription ?? industry.description}
        path={path}
        audienceType={industry.title}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
    </>
  );

  // Legacy path: documents without a section stack keep the shared
  // body/CmsDetailPage layout — nothing breaks mid-migration.
  if (!industry.sections) {
    return (
      <>
        {structuredData}
        <CmsDetailPage
          eyebrow="Multifamily"
          title={industry.title}
          intro={industry.description}
          body={industry.body}
          bulletPoints={industry.bulletPoints}
          photo={industry.photo}
          photoPlaceholderLabel={industry.imageAlt}
        />
      </>
    );
  }

  const [site, services, testimonials, trustLogos] = await Promise.all([
    getSite(),
    getServices(),
    getTestimonials(),
    getTrustLogos(),
  ]);

  // FAQPage schema uses the exact strings the FAQ section renders.
  const faqSection = industry.sections.find(
    (section): section is ServiceFaqSection => section._type === "serviceFaq",
  );

  return (
    <>
      {structuredData}
      {faqSection && <FaqJsonLd faqs={faqSection.faqs} />}
      <ServiceSectionRenderer
        sections={industry.sections}
        site={site}
        currentSlug={industry.slug}
        breadcrumbs={breadcrumbs}
        services={services}
        testimonials={testimonials}
        trustLogos={trustLogos}
      />
    </>
  );
}
