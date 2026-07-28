import type { Metadata } from "next";
import { getSite } from "@/sanity/lib/getSite";
import { getJobPostings } from "@/sanity/lib/getJobs";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
import { getReviewSettings } from "@/sanity/lib/getReviewSettings";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CareerValuesSection } from "@/components/sections/CareerValuesSection";
import { CareerTraitsSection } from "@/components/sections/CareerTraitsSection";
import { JobOpeningsSection } from "@/components/sections/JobOpeningsSection";
import { HiringProcessSection } from "@/components/sections/HiringProcessSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CareersCtaSection } from "@/components/sections/CareersCtaSection";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Careers | Fred's Plumbing",
  description:
    "Plumbing careers in Dallas–Fort Worth: apprentice, journeyman, and emergency service roles with training, steady work, and a team that treats its people well.",
  alternates: { canonical: "/about/careers" },
};

export default async function CareersPage() {
  const [site, jobs, testimonials, profile] = await Promise.all([
    getSite(),
    getJobPostings(),
    getTestimonials(),
    getReviewSettings(),
  ]);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
          { label: "Careers", href: "/about/careers" },
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
            Careers at Fred&rsquo;s Plumbing
          </h1>
          {/* The client's own lead paragraph, verbatim. */}
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-grey-300">
            Fred&rsquo;s is always looking to opportunistically grow our team.
            We treat our employees the way we want to be treated. They are paid
            well, supported, and respected. We keep them busy with work and
            provide the tools and training for them to be successful.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Button href="#open-roles" size="lg" withArrow>
              {jobs.length > 0
                ? `View ${jobs.length} open role${jobs.length === 1 ? "" : "s"}`
                : "View open roles"}
            </Button>
            <Button href={site.phoneHref} variant="phone" size="lg" withPhoneIcon>
              Call {site.phone}
            </Button>
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

      <CareerValuesSection />

      <CareerTraitsSection />

      <JobOpeningsSection jobs={jobs} site={site} id="open-roles" />

      <HiringProcessSection />

      <TestimonialsSection
        testimonials={testimonials}
        site={site}
        profile={profile}
        heading="Our Customers Know Our Technicians by Name"
        lead="These are real Google reviews from the property managers our crews serve — this is what they write, unprompted, about the people you would be working alongside."
        titleId="crew-reviews-heading"
        limit={4}
      />

      <CareersCtaSection site={site} />
    </>
  );
}
