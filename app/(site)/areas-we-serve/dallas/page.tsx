import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCityPage } from "@/sanity/lib/getCityPage";
import { getSite } from "@/sanity/lib/getSite";
import { getSectionData } from "@/sanity/lib/getSectionData";
import { cityHeroIntro, cityHref } from "@/data/cities";
import { CityPage } from "@/components/layout/CityPage";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const SLUG = "dallas";

export async function generateMetadata(): Promise<Metadata> {
  const [content, site] = await Promise.all([getCityPage(SLUG), getSite()]);
  if (!content) return {};

  const title =
    content.seoTitle ?? `Plumbing Services in ${content.city}, TX | ${site.name}`;
  const description = content.seoDescription ?? cityHeroIntro(content);
  const path = cityHref(SLUG);

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

export default async function DallasPage() {
  const [content, data] = await Promise.all([getCityPage(SLUG), getSectionData()]);
  if (!content) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { label: "Home", href: "/" },
          { label: "Areas We Serve", href: "/areas-we-serve" },
          { label: content.city, href: cityHref(SLUG) },
        ]}
      />
      <CityPage content={content} data={data} />
    </>
  );
}
