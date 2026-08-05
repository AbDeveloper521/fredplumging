import type { Metadata } from "next";
import { getSite } from "@/sanity/lib/getSite";
import { getAboutPage } from "@/sanity/lib/getAboutPage";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
import { getReviewSettings } from "@/sanity/lib/getReviewSettings";
import { AboutSectionRenderer } from "@/components/sections/AboutSectionRenderer";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "About Us | Fred's Plumbing",
  description:
    "Family and employee owned since 1996, Fred's Plumbing provides multi-family and commercial plumbing across the Dallas–Fort Worth Metroplex — 24/7, 365 days a year.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  // Testimonials/reviews are fetched even though the default stack has no
  // reviews band — the owner can add one in Studio, and the map band needs
  // the reviews profile for its directions link.
  const [site, sections, testimonials, profile] = await Promise.all([
    getSite(),
    getAboutPage(),
    getTestimonials(),
    getReviewSettings(),
  ]);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
        ]}
      />
      <AboutSectionRenderer
        sections={sections}
        site={site}
        testimonials={testimonials}
        profile={profile}
      />
    </>
  );
}
