import type { ServiceSection } from "./serviceSections";
import type { HomeSection } from "./homePage";
import type { AboutSection } from "./aboutPage";
import type { PartnersSection } from "./partnersPage";
import type { CareersSection } from "./careersPage";
import type { CitySection } from "./cities";

/**
 * THE shared section library: every section type any page stack can carry.
 * All seven page documents (service, industry, homePage, aboutPage,
 * partnersPage, careersPage, cityPage) accept this same union — a section
 * built once is usable everywhere.
 *
 * The union is composed from the per-page unions, which overlap on the
 * shared types (iconCardSection, serviceTestimonials, homeFinalCta, …);
 * overlapping members are structurally identical, so `_type` narrowing
 * stays exact. Schema twin: `sanity/schemas/sectionLibrary.ts`; mapping:
 * `sanity/lib/sectionLibrary.ts`; rendering:
 * `components/sections/SectionRenderer.tsx`.
 */
export type LibrarySection =
  | (ServiceSection & { hidden?: boolean })
  | HomeSection
  | AboutSection
  | PartnersSection
  | CareersSection
  | CitySection;

export type LibrarySectionType = LibrarySection["_type"];
