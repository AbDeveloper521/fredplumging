"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2, Check, ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { industryHref, type Industry } from "@/data/industries";
import { homePageDefaults, type HomeIndustriesContent } from "@/data/homePage";
import { cn } from "@/lib/utils";

export function IndustriesSection({
  industries,
  content = homePageDefaults.industries,
  titleId = "industries-heading",
}: {
  industries: Industry[];
  content?: HomeIndustriesContent;
  /** Unique per instance — sections can be duplicated in the Studio; the tab/accordion ids derive from it. */
  titleId?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const active = industries[Math.min(activeIndex, industries.length - 1)];

  return (
    <section
      aria-labelledby={titleId}
      className="bg-offwhite py-16 sm:py-24 lg:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            titleId={titleId}
            eyebrow={content.eyebrow}
            title={content.heading}
            description={content.description}
            align="center"
          />
        </Reveal>

        {/* Desktop: selector + detail panel */}
        <div className="mt-14 hidden gap-8 lg:grid lg:grid-cols-[0.85fr_1.15fr]">
          <div role="tablist" aria-label="Property types" className="flex flex-col gap-2">
            {industries.map((industry, index) => (
              <button
                key={industry.slug}
                role="tab"
                id={`${titleId}-tab-${industry.slug}`}
                aria-selected={index === activeIndex}
                aria-controls={`${titleId}-panel-${industry.slug}`}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                    e.preventDefault();
                    const next = (index + 1) % industries.length;
                    setActiveIndex(next);
                    document.getElementById(`${titleId}-tab-${industries[next].slug}`)?.focus();
                  }
                  if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const prev = (index - 1 + industries.length) % industries.length;
                    setActiveIndex(prev);
                    document.getElementById(`${titleId}-tab-${industries[prev].slug}`)?.focus();
                  }
                }}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-6 py-4.5 text-left transition-all duration-200",
                  index === activeIndex
                    ? "border-transparent border-l-4 border-l-red-600 bg-white shadow-(--shadow-card)"
                    : "border-transparent hover:bg-white/60",
                )}
              >
                <span
                  className={cn(
                    "text-[17px] font-bold tracking-tight",
                    index === activeIndex ? "text-navy-900" : "text-grey-500",
                  )}
                >
                  {industry.title}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 rounded-full transition-colors",
                    index === activeIndex ? "bg-red-600" : "bg-grey-300",
                  )}
                />
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            id={`${titleId}-panel-${active.slug}`}
            aria-labelledby={`${titleId}-tab-${active.slug}`}
            className="overflow-hidden rounded-2xl bg-white shadow-(--shadow-card)"
          >
            <div className="relative h-60 overflow-hidden">
              {active.photo ? (
                <Image
                  src={active.photo.url}
                  alt={active.photo.alt}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <ImagePlaceholder label={active.imageAlt} icon={Building2} showCaption={false} />
              )}
            </div>
            <div className="p-8 lg:p-10">
              <h3 className="text-2xl font-extrabold tracking-tight text-navy-900">
                {active.title}
              </h3>
              <p className="mt-3.5 leading-relaxed text-grey-500">{active.description}</p>
              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3">
                {active.bulletPoints.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2.5 text-[15px] font-semibold text-navy-900"
                  >
                    <Check aria-hidden="true" className="size-4 shrink-0 text-red-600" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href={industryHref(active.slug)} variant="dark" withArrow>
                  Explore {active.title}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / tablet: accordion cards */}
        <div className="mt-12 space-y-3 lg:hidden">
          {industries.map((industry, index) => {
            const isOpen = openAccordion === index;
            return (
              <div
                key={industry.slug}
                className="overflow-hidden rounded-xl bg-white shadow-(--shadow-card)"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`${titleId}-acc-${industry.slug}`}
                  onClick={() => setOpenAccordion(isOpen ? null : index)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-[16px] font-bold tracking-tight text-navy-900">
                    {industry.title}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "size-5 shrink-0 text-grey-500 transition-transform duration-200",
                      isOpen && "rotate-180 text-red-600",
                    )}
                  />
                </button>
                <div
                  id={`${titleId}-acc-${industry.slug}`}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-grey-100 px-5 pt-4 pb-5">
                      <p className="text-[15px] leading-relaxed text-grey-500">
                        {industry.description}
                      </p>
                      <ul className="mt-4 space-y-2.5">
                        {industry.bulletPoints.map((point) => (
                          <li
                            key={point}
                            className="flex items-center gap-2.5 text-[14px] font-semibold text-navy-900"
                          >
                            <Check aria-hidden="true" className="size-4 shrink-0 text-red-600" />
                            {point}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5">
                        <Button href={industryHref(industry.slug)} variant="dark" withArrow className="w-full">
                          Explore {industry.title}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
