import { Clock, MapPin, ShieldCheck, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { AboutHeroContent } from "@/data/aboutPage";
import type { SiteContent } from "@/data/site";

/**
 * The /about dark hero. The credential chips are DERIVED from Site Settings
 * (licence, years, service area) — never stored copy; the section item only
 * toggles their presence. Carries the page's one H1.
 */
export function AboutHeroSection({
  site,
  content,
  titleId,
}: {
  site: SiteContent;
  content: AboutHeroContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId: string;
}) {
  const credentials = [
    { icon: ShieldCheck, label: `Licensed · ${site.licenseNumber}` },
    { icon: Wrench, label: `${site.yearsInBusiness} years in business` },
    { icon: Clock, label: "24/7 · 365 dispatch" },
    { icon: MapPin, label: site.serviceArea },
  ];

  return (
    <section
      aria-labelledby={titleId}
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

      <Container className="relative flex flex-col items-center pt-[120px] pb-16 text-center lg:pt-[190px] lg:pb-24">
        <p className="flex items-center gap-3 eyebrow text-red-500">
          <span aria-hidden="true" className="h-px w-8 bg-red-500" />
          {content.eyebrow}
          <span aria-hidden="true" className="h-px w-8 bg-red-500" />
        </p>
        <h1
          id={titleId}
          className="mt-6 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight text-balance text-white sm:text-[44px] lg:text-[52px]"
        >
          {content.heading}
        </h1>
        {content.paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className="mt-6 max-w-2xl text-[18px] leading-relaxed text-grey-300"
          >
            {paragraph}
          </p>
        ))}
        {content.showCredentials && (
          <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {credentials.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-sm font-bold text-white"
              >
                <Icon aria-hidden="true" className="size-4 text-red-500" />
                {label}
              </li>
            ))}
          </ul>
        )}
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
  );
}
