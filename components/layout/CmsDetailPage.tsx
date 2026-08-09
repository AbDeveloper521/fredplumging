import Image from "next/image";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { getSite } from "@/sanity/lib/getSite";
import { PortableBody } from "@/components/ui/PortableBody";
import type { CmsPhoto, RichBody } from "@/data/services";

interface CmsDetailPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  /** Optional rich content; falls back to a call-us paragraph when absent. */
  body?: RichBody;
  bulletPoints?: string[];
  photo?: CmsPhoto;
  /** Placeholder caption when no photo is set. */
  photoPlaceholderLabel: string;
}

/**
 * Shared layout for CMS-driven detail pages (/services/[slug] and
 * /multifamily/[slug]): dark hero band, then content with photo, bullets,
 * and a conversion block. Async so it can fetch site settings itself.
 */
export async function CmsDetailPage({
  eyebrow,
  title,
  intro,
  body,
  bulletPoints,
  photo,
  photoPlaceholderLabel,
}: CmsDetailPageProps) {
  const site = await getSite();

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
          className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_85%_80%,rgb(211_33_39/0.16),transparent_65%)]"
        />

        <Container className="relative pt-[120px] pb-16 lg:pt-[190px] lg:pb-24">
          <p className="flex items-center gap-3 eyebrow text-red-500">
            <span aria-hidden="true" className="h-px w-8 bg-red-500" />
            {eyebrow}
          </p>
          <h1
            id="page-heading"
            className="mt-6 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight text-balance text-white sm:text-[44px] lg:text-[52px]"
          >
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-grey-300">
            {intro}
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
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              {body ? (
                <PortableBody value={body} site={site} />
              ) : (
                <p className="max-w-2xl text-[18px] leading-relaxed text-grey-700">
                  {`Our team is ready to help with ${title.toLowerCase()} for your property. Call ${site.phone} or request service and we'll follow up with the specifics for your property.`}
                </p>
              )}

              {bulletPoints && bulletPoints.length > 0 && (
                <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
                  {bulletPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2.5 text-[15px] font-semibold text-navy-900"
                    >
                      <Check
                        aria-hidden="true"
                        className="size-4 shrink-0 text-red-600"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button href="/contact" size="lg" withArrow>
                  Request Service
                </Button>
                <Button
                  href={site.phoneHref}
                  variant="ghost"
                  size="lg"
                  withPhoneIcon
                >
                  Call {site.phone}
                </Button>
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-2xl shadow-(--shadow-card-lg)"
              style={{ aspectRatio: photo?.ratio ?? 4 / 3 }}
            >
              {photo ? (
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <ImagePlaceholder label={photoPlaceholderLabel} />
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
