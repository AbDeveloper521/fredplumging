import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceBySlug, getServices } from "@/sanity/lib/getServices";
import { getSite } from "@/sanity/lib/getSite";
import { serviceHref } from "@/data/services";
import { CmsDetailPage } from "@/components/layout/CmsDetailPage";

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
  return {
    title: service.seoTitle ?? `${service.title} | ${site.name}`,
    description: service.seoDescription ?? service.shortDescription,
    alternates: { canonical: serviceHref(service.slug) },
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

  return (
    <CmsDetailPage
      eyebrow="Services"
      title={service.title}
      intro={service.shortDescription}
      body={service.body}
      photo={service.photo}
      photoPlaceholderLabel={service.imageAlt}
    />
  );
}
