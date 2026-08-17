import type { Metadata } from "next";
import { getHydroJettingPage } from "@/sanity/lib/getHydroJettingPage";
import { getSectionData } from "@/sanity/lib/getSectionData";
import { HYDRO_JETTING_PATH } from "@/data/hydroJettingPage";
import { SectionRenderer } from "@/components/sections/SectionRenderer";

export const metadata: Metadata = {
  title: "Hydro Jetting in Dallas–Fort Worth | Fred's Plumbing",
  description:
    "High-pressure hydro jetting for commercial and multi-family drain and sewer lines across the Dallas–Fort Worth Metroplex — camera inspected before and after.",
  // Relative — resolved to an absolute URL against metadataBase (root layout).
  alternates: { canonical: HYDRO_JETTING_PATH },
};

/**
 * `/commercial/hydro-jetting` — THE hydro jetting page. One page, one URL:
 * jetting appears in service copy and in the FAQ sets elsewhere on the site,
 * but every link about jetting points here, so the page never competes with a
 * twin for its own ranking.
 *
 * A section stack the owner composes in Studio (Hydro Jetting Page), rendered
 * by the shared `SectionRenderer` with no page-specific mapper or renderer of
 * its own.
 *
 * Deliberately carries NO structured data — same decision as /commercial: the
 * breadcrumb trail below is the visible nav row in the banner, not JSON-LD,
 * and the Q&A band emits no FAQPage schema (the Multi-Family FAQ decision).
 */
export default async function HydroJettingPage() {
  const [sections, data] = await Promise.all([
    getHydroJettingPage(),
    getSectionData(),
  ]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Commercial", href: "/commercial" },
    { label: "Hydro Jetting", href: HYDRO_JETTING_PATH },
  ];

  return (
    <SectionRenderer
      sections={sections}
      data={data}
      idPrefix="hydro-jetting"
      breadcrumbs={breadcrumbs}
    />
  );
}
