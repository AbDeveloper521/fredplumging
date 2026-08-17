import type { ServiceSection } from "./serviceSections";
import type { HomeSection } from "./homePage";
import type { AboutSection } from "./aboutPage";
import type { PartnersSection } from "./partnersPage";
import type { CareersSection } from "./careersPage";
import type { CitySection } from "./cities";
import type { FaqBandSection } from "./faqSets";

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
  | CitySection
  // Owned by no page: the shared Q&A band, which any stack may carry.
  | FaqBandSection;

export type LibrarySectionType = LibrarySection["_type"];

/**
 * Array fields whose object members need `_type` + `_key` in Sanity, by the
 * schema's array-member name. String arrays (`paragraphs`) need neither.
 */
const CHILD_MEMBER_TYPE: Record<string, string> = {
  credentials: "credential",
  cards: "card",
  benefits: "item",
  items: "item",
  steps: "step",
};

/**
 * A rendered fallback stack translated to SANITY shape, for anything that
 * writes a document: nested array members gain `_type`/`_key`, and a Q&A band
 * becomes a REFERENCE to a shared set rather than a copy of its questions.
 *
 * Both a document schema's Studio prefill (`initialValue`) and its seeder go
 * through this, so a document created either way is identical. Without it the
 * prefill would drop unkeyed cards into Studio and leave the Q&A band pointing
 * at nothing.
 *
 * The reference target only exists once that page's seeder has run (or the set
 * has been created by hand under FAQ Sets) — publishing the prefill first
 * leaves that one band pointing at a missing document until then, which is
 * exactly why the reference is written `_weak`.
 */
export function sectionsForSanity(
  sections: LibrarySection[],
  options: { faqSetId: string },
): Record<string, unknown>[] {
  // JSON round-trip strips `undefined`s (the empty photo slots).
  const stack = JSON.parse(JSON.stringify(sections)) as Record<
    string,
    unknown
  >[];

  return stack.map((section) => {
    if (section._type === "faqBand") {
      return {
        _type: "faqBand",
        _key: section._key,
        source: "set",
        // `_weak` matches the schema's weak reference field, so a document
        // written before the set exists saves instead of being rejected.
        faqSet: { _type: "reference", _ref: options.faqSetId, _weak: true },
        hidden: false,
      };
    }
    for (const [field, memberType] of Object.entries(CHILD_MEMBER_TYPE)) {
      const value = section[field];
      if (!Array.isArray(value)) continue;
      section[field] = value.map((entry, i) =>
        entry && typeof entry === "object" && !Array.isArray(entry)
          ? {
              _type: memberType,
              _key:
                (entry as Record<string, unknown>)._key ??
                `${section._key}-${field}-${i}`,
              ...(entry as Record<string, unknown>),
            }
          : entry,
      );
    }
    return section;
  });
}
