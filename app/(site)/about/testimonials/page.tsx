import type { Metadata } from "next";
import { getSite } from "@/sanity/lib/getSite";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
import { getReviewSettings } from "@/sanity/lib/getReviewSettings";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { GoogleRatingBadge } from "@/components/ui/GoogleRatingBadge";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Testimonials | Fred's Plumbing",
  description:
    "Reviews and testimonials from Dallas–Fort Worth property managers and facilities teams who rely on Fred's Plumbing — rated 5.0 across 133 Google reviews.",
  alternates: { canonical: "/about/testimonials" },
};

export default async function TestimonialsPage() {
  const [site, testimonials, profile] = await Promise.all([
    getSite(),
    getTestimonials(),
    getReviewSettings(),
  ]);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
          { label: "Testimonials", href: "/about/testimonials" },
        ]}
      />

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
            About Us
          </p>
          <h1
            id="page-heading"
            className="mt-6 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight text-balance text-white sm:text-[44px] lg:text-[52px]"
          >
            Testimonials
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-grey-300">
            What property managers, facilities directors, and owners say about
            working with our crews — as posted on our public Google listing, as
            of {profile.verifiedOn}.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <GoogleRatingBadge profile={profile} variant="dark" />
            {profile.writeReviewUrl && (
              <Button
                href={profile.writeReviewUrl}
                variant="outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Leave a review
                <span className="sr-only"> (opens in a new tab)</span>
              </Button>
            )}
          </div>
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

      <section aria-label="All reviews" className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          {/* CSS columns handle the very uneven quote lengths (one review is a
              single line, another a full paragraph) without grid gaps. */}
          <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
            {testimonials.map((testimonial, i) => (
              <Reveal
                key={testimonial.id}
                delay={Math.min(i, 5) * 0.05}
                className="mb-6 break-inside-avoid"
              >
                <TestimonialCard testimonial={testimonial} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <FinalCTASection site={site} />
    </>
  );
}
