import { Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { QuoteRequestForm } from "@/components/forms/QuoteRequestForm";
import { site } from "@/data/site";

export function FinalCTASection() {
  return (
    <section
      aria-labelledby="finalcta-heading"
      className="relative isolate overflow-hidden bg-navy-950 py-16 sm:py-24 lg:py-28"
    >
      {/*
        Background composition — swap the gradients for
        /images/technician-working.webp behind a navy overlay when available.
      */}
      <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_20%_30%,rgb(27_48_73/0.9),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_90%_85%,rgb(217_39_46/0.15),transparent_60%)]"
      />
      {/* Thin red top divider */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-red-600" />

      <Container className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <Reveal>
            <SectionHeading
              titleId="finalcta-heading"
              eyebrow="Let's Solve the Problem"
              title="Schedule Commercial Plumbing Service Today"
              description="Tell us about your property and the plumbing support you need. Our team will contact you to discuss the next steps."
              theme="dark"
            />
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Button href="/contact" size="lg" withArrow>
                Request Service
              </Button>
              <Button href={site.phoneHref} variant="phone" size="lg" withPhoneIcon>
                Call {site.phone}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-10 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-red-600">
                <Phone aria-hidden="true" className="size-5 text-white" />
              </span>
              <p className="text-[15px] leading-relaxed text-grey-300">
                Prefer to talk it through? Our office answers around the clock —{" "}
                <a
                  href={site.phoneHref}
                  className="font-bold text-white underline-offset-4 hover:underline"
                >
                  {site.phone}
                </a>
                , 24 hours a day, 7 days a week.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="lg:justify-self-end lg:w-full lg:max-w-[500px]">
          <QuoteRequestForm />
        </Reveal>
      </Container>
    </section>
  );
}
