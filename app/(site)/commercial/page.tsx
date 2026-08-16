import type { Metadata } from "next";
import { getCommercialPage } from "@/sanity/lib/getCommercialPage";
import { getSectionData } from "@/sanity/lib/getSectionData";
import { SectionRenderer } from "@/components/sections/SectionRenderer";

export const metadata: Metadata = {
  title: "Commercial | Fred's Plumbing",
  description:
    "Commercial plumbing from Fred's Plumbing, serving businesses and commercial properties across the Dallas–Fort Worth Metroplex.",
  alternates: { canonical: "/commercial" },
};

/**
 * `/commercial` — a section stack the owner composes in Studio (Commercial
 * Page), rendered by the shared `SectionRenderer` with no page-specific
 * mapper or renderer of its own.
 *
 * Deliberately carries NO structured data: the breadcrumb trail below is the
 * visible nav row in the banner, not JSON-LD.
 */
export default async function CommercialPage() {
  const [sections, data] = await Promise.all([
    getCommercialPage(),
    getSectionData(),
  ]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Commercial", href: "/commercial" },
  ];

  return (
    <SectionRenderer
      sections={sections}
      data={data}
      idPrefix="commercial"
      breadcrumbs={breadcrumbs}
    />
  );
}
