import { Award, CheckCircle2, Clock, MapPin, ShieldCheck, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { StatCard } from "@/components/ui/StatCard";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { SiteContent } from "@/data/site";

const highlights = [
  "Commercial and multi-family specialists",
  "Responsive scheduling and emergency support",
  "Clear communication from start to finish",
];

export function AboutSection({ site }: { site: SiteContent }) {
  const metrics = [
    { value: site.yearsInBusiness, label: "Years of Experience", icon: Award },
    { value: "24/7", label: "Emergency Availability", icon: Clock },
    { value: "DFW", label: "Metroplex-Wide Coverage", icon: MapPin },
    { value: "100%", label: "Licensed and Insured", icon: ShieldCheck },
  ];

  return (
    <section aria-labelledby="about-heading" className="bg-offwhite py-16 sm:py-24 lg:py-28">
      <Container>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Image composition */}
          <Reveal className="relative">
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-(--shadow-card-lg)">
                <ImagePlaceholder
                  label="Fred's Plumbing commercial service team on site — /images/commercial-plumber-team.webp"
                  icon={Users}
                />
              </div>
              {/* Overlapping secondary image */}
              <div className="absolute -bottom-8 -right-3 hidden w-[46%] overflow-hidden rounded-2xl border-4 border-offwhite shadow-(--shadow-card-lg) sm:block lg:-right-8">
                <div className="aspect-[4/3]">
                  <ImagePlaceholder
                    label="Technician at a DFW multi-family property — /images/technician-working.webp"
                    tone="steel"
                    showCaption={false}
                  />
                </div>
              </div>
              {/* Experience badge */}
              <div className="absolute -top-5 -left-3 rounded-xl bg-red-600 px-5 py-3.5 text-white shadow-[0_12px_28px_rgb(211_33_39/0.4)] lg:-left-6">
                <p className="font-heading text-2xl leading-none font-extrabold">
                  Since {site.foundedYear}
                </p>
                <p className="mt-1 text-xs font-semibold tracking-wide uppercase opacity-90">
                  Family-owned &amp; operated
                </p>
              </div>
              {/* Decorative accent line */}
              <div
                aria-hidden="true"
                className="absolute -bottom-4 left-10 hidden h-px w-40 bg-gradient-to-r from-red-500 to-transparent sm:block"
              />
            </div>
          </Reveal>

          {/* Copy */}
          <div>
            <Reveal>
              <SectionHeading
                titleId="about-heading"
                eyebrow="Built on Experience. Trusted Across DFW."
                title="Commercial Plumbing Expertise Since 1996"
                description="Fred's Plumbing has supported apartment communities, property managers, commercial buildings, and multi-family facilities throughout the Dallas–Fort Worth Metroplex for more than two decades. Our team combines responsive service, reliable communication, and practical plumbing solutions designed to reduce disruption and protect your property."
              />
            </Reveal>

            <Reveal delay={0.1}>
              <ul className="mt-8 space-y-3.5">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[16px] font-semibold text-navy-900">
                    <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-red-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-10">
                <Button href="/about" variant="dark" withArrow>
                  Learn About Fred&rsquo;s Plumbing
                </Button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Metrics row */}
        <Reveal delay={0.1}>
          <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-grey-300/60 pt-12 sm:mt-24 lg:grid-cols-4">
            {metrics.map((metric) => (
              <StatCard
                key={metric.label}
                value={metric.value}
                label={metric.label}
                icon={metric.icon}
              />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
