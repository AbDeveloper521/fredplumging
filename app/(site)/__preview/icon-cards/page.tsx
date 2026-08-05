// TEMPORARY verification route — renders the new IconCardSection in every
// background/card-colour configuration without touching the dataset.
// Deleted before commit.
import { getServiceBySlug } from "@/sanity/lib/getServices";
import { IconCardSection } from "@/components/sections/IconCardSection";
import type { IconCardSection as IconCardData } from "@/data/serviceSections";
import type { NavIconName } from "@/data/navigation";

const ICONS: NavIconName[] = [
  "droplets",
  "wrench",
  "shield-check",
  "flame",
  "gauge",
  "waves",
  "clock",
];

function cards(
  n: number,
  overrides: Record<number, Partial<IconCardData["cards"][number]>> = {},
): IconCardData["cards"] {
  return Array.from({ length: n }, (_, i) => ({
    _key: `card-${i}`,
    icon: ICONS[i % ICONS.length],
    title: `Card ${i + 1} Title`,
    description:
      "One or two sentences of card copy so the equal-height behaviour and bottom-pinned link are visible in the preview.",
    ctaLabel: "Get Started",
    ctaHref: "/contact",
    ...overrides[i],
  }));
}

export default async function IconCardPreviewPage() {
  const service = await getServiceBySlug("plumbing");
  const heroPhoto = service?.sections?.find(
    (s) => s._type === "serviceHero" && s.photo,
  );
  const photo =
    heroPhoto && "photo" in heroPhoto ? heroPhoto.photo : undefined;

  const sections: IconCardData[] = [
    {
      _type: "iconCardSection",
      _key: "t1",
      eyebrow: "Five cards",
      heading: "Balanced 3 + 2, First Card Without a Link, One Navy Override",
      background: "default",
      defaultCardColor: "white",
      cards: cards(5, {
        0: { ctaLabel: undefined, ctaHref: undefined },
        3: { cardColor: "navy" },
      }),
    },
    {
      _type: "iconCardSection",
      _key: "t2",
      heading: "Dark Navy Band, White Cards, Seven Cards (4 + 3)",
      background: "dark",
      defaultCardColor: "white",
      cards: cards(7),
    },
    {
      _type: "iconCardSection",
      _key: "t3",
      eyebrow: "Photo background",
      heading: "Photo Background With Automatic Overlay",
      defaultCardColor: "offwhite",
      photo,
      cards: cards(3, { 1: { cardColor: "red" } }),
    },
    {
      _type: "iconCardSection",
      _key: "t4",
      heading: "Red Cards on the Light Band",
      background: "default",
      defaultCardColor: "red",
      cards: cards(2),
    },
  ];

  return (
    <>
      {sections.map((section, i) => (
        <IconCardSection key={section._key} section={section} id={`icon-cards-${i + 1}`} />
      ))}
    </>
  );
}
