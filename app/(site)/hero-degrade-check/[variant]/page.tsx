// TEMPORARY verification harness — delete before committing.
import { getSite } from "@/sanity/lib/getSite";
import { HeroSection } from "@/components/sections/HeroSection";
import { homePageDefaults, type HomeHeroContent } from "@/data/homePage";

const VARIANTS: Record<string, HomeHeroContent> = {
  default: homePageDefaults.hero,
  "no-badge": { ...homePageDefaults.hero, showExperienceBadge: false },
  "no-chips": { ...homePageDefaults.hero, trustIndicators: [] },
  bare: {
    ...homePageDefaults.hero,
    trustIndicators: [],
    showExperienceBadge: false,
  },
};

export default async function HeroDegradeCheck({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  const site = await getSite();
  return (
    <HeroSection site={site} content={VARIANTS[variant] ?? VARIANTS.default} />
  );
}
