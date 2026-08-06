import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCityPage } from "@/sanity/lib/getCityPage";
import { getSite } from "@/sanity/lib/getSite";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
import { getReviewSettings } from "@/sanity/lib/getReviewSettings";
import { getTrustLogos } from "@/sanity/lib/getTrustLogos";
import { cityHeroIntro, cityHref } from "@/data/cities";
import { CityPage } from "@/components/layout/CityPage";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const SLUG = "fort-worth";

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

export default async function FortWorthPage() {
  const [content, site, testimonials, profile, trustLogos] = await Promise.all([
    getCityPage(SLUG),
    getSite(),
    getTestimonials(),
    getReviewSettings(),
    getTrustLogos(),
  ]);
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
      <CityPage
        content={content}
        site={site}
        testimonials={testimonials}
        profile={profile}
        trustLogos={trustLogos}
      />
    </>
  );
}
