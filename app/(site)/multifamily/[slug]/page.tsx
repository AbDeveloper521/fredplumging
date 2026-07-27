import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIndustries, getIndustryBySlug } from "@/sanity/lib/getIndustries";
import { getSite } from "@/sanity/lib/getSite";
import { industryHref } from "@/data/industries";
import { CmsDetailPage } from "@/components/layout/CmsDetailPage";

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
  return {
    title: industry.seoTitle ?? `${industry.title} | ${site.name}`,
    description: industry.seoDescription ?? industry.description,
    alternates: { canonical: industryHref(industry.slug) },
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

  return (
    <CmsDetailPage
      eyebrow="Multifamily"
      title={industry.title}
      intro={industry.description}
      body={industry.body}
      bulletPoints={industry.bulletPoints}
      photo={industry.photo}
      photoPlaceholderLabel={industry.imageAlt}
    />
  );
}
