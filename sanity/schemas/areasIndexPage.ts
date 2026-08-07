import { defineType } from "sanity";
import { defaultAreasIndexSections } from "@/data/areasIndexPage";
import { sectionsField } from "./sectionLibrary";

/**
 * The `/areas-we-serve` landing page as an orderable section stack — the same
 * architecture as every other page singleton. It defines no section types of
 * its own: the shared library already covers every band this page needs, so
 * `sectionsField()` gives it the identical grouped insert menu.
 *
 * Titled "Areas We Serve Index Page" so it can't be mistaken for the "City
 * Pages" collection in the sidebar (the individual Dallas / Fort Worth
 * documents) — the Careers Page / Careers pairing already confused that once.
 *
 * TypeScript twin: `data/areasIndexPage.ts`; mapping (shared):
 * `sanity/lib/sectionLibrary.ts`; rendering (shared):
 * `components/sections/SectionRenderer.tsx`.
 */
export const areasIndexPage = defineType({
  name: "areasIndexPage",
  title: "Areas We Serve Index Page",
  type: "document",
  fields: [
    sectionsField({
      title: "Areas-page sections",
      description:
        "The /areas-we-serve landing page, top to bottom — the same section library every page uses. Drag to reorder. The ⋮ menu on each section offers Duplicate and Remove; open a section and tick “Hide this section” to keep its content without showing it. This is the page that lists the areas — each city's own page is edited under City Pages.",
    }),
  ],
  // The Studio document starts prefilled with the shipped two-band stack.
  // JSON round-trip strips the `undefined`s (empty photo slots).
  initialValue: JSON.parse(
    JSON.stringify({ sections: defaultAreasIndexSections }),
  ),
  preview: {
    prepare: () => ({ title: "Areas We Serve Index Page" }),
  },
});
