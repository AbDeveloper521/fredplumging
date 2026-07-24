import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { site } from "@/data/site";

interface PagePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
}

/**
 * Shared shell for routes that exist in the navigation but have no content
 * written yet. Header and footer come from the root layout; this supplies the
 * dark hero band and a short holding paragraph.
 */
export function PagePlaceholder({
  eyebrow,
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <>
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
          className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_85%_80%,rgb(217_39_46/0.16),transparent_65%)]"
        />

        <Container className="relative pt-[120px] pb-16 lg:pt-[190px] lg:pb-24">
          <p className="flex items-center gap-3 text-[13px] font-bold tracking-[0.14em] text-red-500 uppercase">
            <span aria-hidden="true" className="h-px w-8 bg-red-500" />
            {eyebrow}
          </p>
          <h1
            id="page-heading"
            className="mt-6 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight text-balance text-white sm:text-[44px] lg:text-[52px]"
          >
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-grey-300">
            {description}
          </p>
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

      <section className="bg-white py-16 lg:py-24">
        <Container>
          <div className="max-w-2xl">
            <p className="text-[17px] leading-relaxed text-grey-500">
              Detailed content for this page is on the way. In the meantime, our
              team is ready to help — call{" "}
              <a
                href={site.phoneHref}
                className="font-semibold text-navy-900 underline underline-offset-4 hover:text-red-600"
              >
                {site.phone}
              </a>{" "}
              or request service and we&rsquo;ll follow up with the specifics for
              your property.
            </p>
            <div className="mt-8">
              <Button href="/contact" size="lg" withArrow>
                Request Service
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
