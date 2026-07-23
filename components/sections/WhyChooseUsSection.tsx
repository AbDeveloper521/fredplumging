import {
  Clock,
  Building2,
  ShieldCheck,
  MessageSquare,
  ClipboardCheck,
  CalendarCheck,
  Award,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { IconFeature } from "@/components/ui/IconFeature";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

const features = [
  {
    icon: Clock,
    title: "24/7 Emergency Availability",
    description:
      "Around-the-clock response for urgent issues, with crews dispatched across the entire Metroplex.",
  },
  {
    icon: Building2,
    title: "Commercial and Multi-Family Experience",
    description:
      "Decades of work in occupied communities and operating facilities — we know how to work around residents and tenants.",
  },
  {
    icon: ShieldCheck,
    title: "Licensed and Insured Professionals",
    description:
      "Fully credentialed technicians with documentation ready for your vendor files at any time.",
  },
  {
    icon: MessageSquare,
    title: "Transparent Communication",
    description:
      "Clear scopes, honest timelines, and proactive updates from dispatch through completion.",
  },
  {
    icon: ClipboardCheck,
    title: "Vendor Compliance Support",
    description:
      "Registered with major vendor platforms and ready to meet your management company's onboarding requirements.",
  },
  {
    icon: CalendarCheck,
    title: "Preventive Maintenance Expertise",
    description:
      "Planned programs that catch problems early, reduce emergencies, and protect your budget.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section
      aria-labelledby="why-heading"
      className="bg-white py-16 sm:py-24 lg:py-28"
    >
      <Container className="grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* Sticky intro column */}
        <div className="lg:sticky lg:top-36 lg:self-start">
          <Reveal>
            <SectionHeading
              titleId="why-heading"
              eyebrow="Why Property Managers Choose Fred's"
              title="Dependable Service Without the Guesswork"
              description="Our team understands that plumbing problems affect residents, operations, budgets, and property reputation. We provide practical solutions, clear updates, and responsive support at every stage."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-9">
              <Button href="/contact" withArrow>
                Start a Conversation
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="relative mt-12 hidden overflow-hidden rounded-2xl lg:block">
              <div className="aspect-[16/10]">
                <ImagePlaceholder
                  label="Property manager and technician reviewing work order — /images/vendor-compliance.webp"
                  icon={Award}
                  tone="steel"
                />
              </div>
              <div className="absolute bottom-4 left-4 rounded-lg bg-white/95 px-4 py-2.5 backdrop-blur-sm">
                <p className="text-sm font-bold text-navy-900">
                  27+ years of repeat commercial clients
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Stacked feature rows */}
        <div className="flex flex-col divide-y divide-grey-100">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.05} className="py-7 first:pt-0">
              <IconFeature
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
