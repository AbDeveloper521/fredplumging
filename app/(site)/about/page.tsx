import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, MapPin, ShieldCheck, Wrench } from "lucide-react";
import { getSite } from "@/sanity/lib/getSite";
import { getAboutPage } from "@/sanity/lib/getAboutPage";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { AboutCollage } from "@/components/sections/AboutSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { navIcons } from "@/components/layout/navIcons";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "About Us | Fred's Plumbing",
  description:
    "Family and employee owned since 1996, Fred's Plumbing provides multi-family and commercial plumbing across the Dallas–Fort Worth Metroplex — 24/7, 365 days a year.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [site, content] = await Promise.all([getSite(), getAboutPage()]);

  const credentials = [
    { icon: ShieldCheck, label: `Licensed · ${site.licenseNumber}` },
    { icon: Wrench, label: `${site.yearsInBusiness} years in business` },
    { icon: Clock, label: "24/7 · 365 dispatch" },
    { icon: MapPin, label: site.serviceArea },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
        ]}
      />

      {/* 1 — Hero */}
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

        <Container className="relative flex flex-col items-center pt-[120px] pb-16 text-center lg:pt-[190px] lg:pb-24">
          <p className="flex items-center gap-3 text-[13px] font-bold tracking-[0.14em] text-red-500 uppercase">
            <span aria-hidden="true" className="h-px w-8 bg-red-500" />
            {content.heroEyebrow}
            <span aria-hidden="true" className="h-px w-8 bg-red-500" />
          </p>
          <h1
            id="page-heading"
            className="mt-6 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight text-balance text-white sm:text-[44px] lg:text-[52px]"
          >
            {content.heroHeading}
          </h1>
          {content.heroParagraphs.map((paragraph, i) => (
            <p
              key={i}
              className="mt-6 max-w-2xl text-[17px] leading-relaxed text-grey-300"
            >
              {paragraph}
            </p>
          ))}
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

      {/* 2 — Committed to Quality and Service Since 1996 */}
      <section
        aria-labelledby="story-heading"
        className="bg-white py-16 sm:py-24 lg:py-28"
      >
        <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <SectionHeading
                titleId="story-heading"
                eyebrow="Our Story"
                title={content.storyHeading}
              />
            </Reveal>
            {content.storyParagraphs.map((paragraph, i) => (
              <Reveal key={i} delay={0.08 + i * 0.06}>
                <p className="mt-6 text-[17px] leading-relaxed text-grey-700">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.12} className="relative">
            <AboutCollage
              badgeTitle={`Since ${site.foundedYear}`}
              badgeSubtitle="Family and employee owned"
              primaryPhoto={content.storyPhotoPrimary}
              primaryLabel={content.storyPhotoSubjectPrimary}
              secondaryPhoto={content.storyPhotoSecondary}
              secondaryLabel={content.storyPhotoSubjectSecondary}
              frameClass="border-white"
            />
          </Reveal>
        </Container>
      </section>

      {/* 3 — Evolving to Meet the Needs of a Growing Region */}
      <section
        aria-labelledby="evolution-heading"
        className="relative isolate overflow-hidden bg-navy-950 py-16 sm:py-24 lg:py-28"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_15%_20%,rgb(27_48_73/0.9),transparent_65%)]"
        />
        <Container className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <SectionHeading
                titleId="evolution-heading"
                eyebrow="Then and Now"
                title={content.evolutionHeading}
                theme="dark"
              />
            </Reveal>
            {content.evolutionParagraphs.map((paragraph, i) => (
              <Reveal key={i} delay={0.08 + i * 0.06}>
                <p className="mt-6 text-[17px] leading-relaxed text-grey-300">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.12}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-(--shadow-card-lg)">
              {content.evolutionPhoto ? (
                <Image
                  src={content.evolutionPhoto.url}
                  alt={content.evolutionPhoto.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <ImagePlaceholder label={content.evolutionPhotoSubject} />
              )}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* 4 — What we stand for */}
      <section
        aria-labelledby="values-heading"
        className="bg-offwhite py-16 sm:py-24 lg:py-28"
      >
        <Container>
          <Reveal>
            <SectionHeading
              titleId="values-heading"
              eyebrow="How We Work"
              title={content.valuesHeading}
              align="center"
            />
          </Reveal>
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.values.map((value, i) => {
              const Icon = navIcons[value.icon];
              return (
                <li key={value.title}>
                  <Reveal delay={(i % 3) * 0.08} className="h-full">
                    <div className="h-full rounded-2xl border border-grey-100 bg-white p-7 shadow-(--shadow-card)">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-red-600 shadow-[0_8px_20px_rgb(211_33_39/0.28)]">
                        <Icon aria-hidden="true" className="size-5 text-white" />
                      </span>
                      <h3 className="mt-6 text-lg font-extrabold tracking-tight text-navy-900">
                        {value.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-grey-500">
                        {value.description}
                      </p>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* 5 — Where to next */}
      <section
        aria-labelledby="next-heading"
        className="bg-white py-16 sm:py-24"
      >
        <Container>
          <Reveal>
            <SectionHeading
              titleId="next-heading"
              eyebrow="Keep Exploring"
              title={content.linksHeading}
              align="center"
            />
          </Reveal>
          <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {content.links.map((link, i) => (
              <li key={link.href}>
                <Reveal delay={i * 0.07} className="h-full">
                  <Link
                    href={link.href}
                    className="group flex h-full flex-col rounded-2xl border border-grey-100 bg-white p-7 shadow-(--shadow-card) transition-all duration-200 hover:shadow-(--shadow-card-lg)"
                  >
                    <h3 className="flex items-center justify-between gap-3 text-lg font-extrabold tracking-tight text-navy-900">
                      {link.title}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-5 shrink-0 text-red-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-grey-500">
                      {link.description}
                    </p>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <FinalCTASection site={site} />
    </>
  );
}
