import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceBySlug, getServices } from "@/sanity/lib/getServices";
import { getSite } from "@/sanity/lib/getSite";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
import { getTrustLogos } from "@/sanity/lib/getTrustLogos";
import { serviceHref } from "@/data/services";
import type { ServiceFaqSection } from "@/data/serviceSections";
import { CmsDetailPage } from "@/components/layout/CmsDetailPage";
import { ServiceSectionRenderer } from "@/components/sections/ServiceSectionRenderer";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  ServiceJsonLd,
} from "@/components/seo/JsonLd";

/**
 * All published services prerender at build time; a service created in the
 * Studio afterwards is generated on first request (ISR) — no 404 window, no
 * redeploy needed.
 */
export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [service, site] = await Promise.all([getServiceBySlug(slug), getSite()]);
  if (!service) return {};

  const title = service.seoTitle ?? `${service.title} | ${site.name}`;
  const description = service.seoDescription ?? service.shortDescription;
  const path = serviceHref(service.slug);

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

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const path = serviceHref(service.slug);
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: service.title, href: path },
  ];

  const structuredData = (
    <>
      <ServiceJsonLd
        name={service.title}
        description={service.seoDescription ?? service.shortDescription}
        path={path}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
    </>
  );

  // Legacy path: documents without a section stack keep the shared
  // body/CmsDetailPage layout — nothing breaks mid-migration.
  if (!service.sections) {
    return (
      <>
        {structuredData}
        <CmsDetailPage
          eyebrow="Services"
          title={service.title}
          intro={service.shortDescription}
          body={service.body}
          photo={service.photo}
          photoPlaceholderLabel={service.imageAlt}
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
  const faqSection = service.sections.find(
    (section): section is ServiceFaqSection => section._type === "serviceFaq",
  );

  return (
    <>
      {structuredData}
      {faqSection && <FaqJsonLd faqs={faqSection.faqs} />}
      <ServiceSectionRenderer
        sections={service.sections}
        site={site}
        currentSlug={service.slug}
        breadcrumbs={breadcrumbs}
        services={services}
        testimonials={testimonials}
        trustLogos={trustLogos}
      />
    </>
  );
}
