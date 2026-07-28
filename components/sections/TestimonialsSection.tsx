import Link from "next/link";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { GoogleRatingBadge } from "@/components/ui/GoogleRatingBadge";
import { reviewsForTags, type GoogleReviewProfile } from "@/data/googleReviews";
import type { Testimonial } from "@/data/testimonials";
import type { SiteContent } from "@/data/site";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  site: SiteContent;
  profile: GoogleReviewProfile;
  /** Section heading — defaults to the homepage wording. */
  heading?: string;
  /** id for aria-labelledby — override when the section appears off-homepage. */
  titleId?: string;
  /** Service / property-type slugs to prefer. Omit on the homepage. */
  filterTags?: string[];
  /** Max cards, 1–6. Defaults to 4. */
  limit?: number;
  /** Link to the full /about/testimonials page. Defaults true off-homepage. */
  showAllLink?: boolean;
}

export function TestimonialsSection({
  testimonials,
  site,
  profile,
  heading = "Trusted by Property Managers Across DFW",
  titleId = "testimonials-heading",
  filterTags,
  limit = 4,
  showAllLink = true,
}: TestimonialsSectionProps) {
  const selected = reviewsForTags(testimonials, filterTags, { limit });
  if (selected.length === 0) return null;

  const summaryMetrics = [
    { icon: MapPin, label: `${site.yearsInBusiness} years serving DFW` },
    { icon: Clock, label: "24/7 response availability" },
  ];

  const featured = selected.find((t) => t.featured) ?? selected[0];
  const supporting = selected.filter((t) => t !== featured).slice(0, 3);

  return (
    <section
      aria-labelledby={titleId}
      className="bg-white py-16 sm:py-24 lg:py-28"
    >
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              titleId={titleId}
              eyebrow={profile.headline ?? "Client Feedback"}
              title={heading}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <li>
                <GoogleRatingBadge profile={profile} />
              </li>
              {summaryMetrics.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 text-sm font-bold text-navy-900"
                >
                  <Icon aria-hidden="true" className="size-4 text-red-600" />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Featured review spans two columns */}
          <Reveal className="lg:col-span-2">
            <TestimonialCard testimonial={featured} featured className="h-full" />
          </Reveal>
          {supporting[0] && (
            <Reveal delay={0.08}>
              <TestimonialCard testimonial={supporting[0]} className="h-full" />
            </Reveal>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-3">
            {supporting.slice(1, 3).map((t, i) => (
              <Reveal key={t.id} delay={0.08 + i * 0.06}>
                <TestimonialCard testimonial={t} className="h-full" />
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.12}>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            {showAllLink && (
              <Link
                href="/about/testimonials"
                className="text-sm font-bold text-navy-900 underline-offset-4 hover:text-red-600 hover:underline"
              >
                Read all {profile.reviewCount} reviews
              </Link>
            )}
            <a
              href={profile.reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-semibold text-grey-500 underline-offset-4 hover:text-navy-900 hover:underline"
            >
              See them on Google
              <ArrowUpRight aria-hidden="true" className="size-4" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
