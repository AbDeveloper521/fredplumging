import { Clock, MapPin, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import type { Testimonial } from "@/data/testimonials";
import type { SiteContent } from "@/data/site";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  site: SiteContent;
}

export function TestimonialsSection({
  testimonials,
  site,
}: TestimonialsSectionProps) {
  const summaryMetrics = [
    { icon: Star, label: "5-star client feedback" },
    { icon: MapPin, label: `${site.yearsInBusiness} years serving DFW` },
    { icon: Clock, label: "24/7 response availability" },
  ];

  const featured = testimonials.find((t) => t.featured) ?? testimonials[0];
  const supporting = testimonials.filter((t) => t !== featured).slice(0, 3);

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="bg-white py-16 sm:py-24 lg:py-28"
    >
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              titleId="testimonials-heading"
              eyebrow="Client Feedback"
              title="Trusted by Property Managers Across DFW"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
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
          <Reveal delay={0.08}>
            <TestimonialCard testimonial={supporting[0]} className="h-full" />
          </Reveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-3">
            {supporting.slice(1, 3).map((t, i) => (
              <Reveal key={t.name} delay={0.08 + i * 0.06}>
                <TestimonialCard testimonial={t} className="h-full" />
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
