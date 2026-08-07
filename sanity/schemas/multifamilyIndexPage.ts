import { defineType } from "sanity";
import { defaultMultifamilyIndexSections } from "@/data/multifamilyIndexPage";
import { sectionsField } from "./sectionLibrary";

/**
 * The `/multifamily` landing page as an orderable section stack — the same
 * architecture as every other page singleton. It defines no section types of
 * its own: the shared library already covers every band this page needs, so
 * `sectionsField()` gives it the identical grouped insert menu.
 *
 * Titled "Multifamily Index Page" so it can't be mistaken for the "Property
 * Types" collection in the sidebar (the individual /multifamily/[slug]
 * documents whose cards this page lists) — the Careers Page / Careers pairing
 * already confused that once.
 *
 * TypeScript twin: `data/multifamilyIndexPage.ts`; mapping (shared):
 * `sanity/lib/sectionLibrary.ts`; rendering (shared):
 * `components/sections/SectionRenderer.tsx`.
 */
export const multifamilyIndexPage = defineType({
  name: "multifamilyIndexPage",
  title: "Multifamily Index Page",
  type: "document",
  fields: [
    sectionsField({
      title: "Multifamily-page sections",
      description:
        "The /multifamily landing page, top to bottom — the same section library every page uses. Drag to reorder. The ⋮ menu on each section offers Duplicate and Remove; open a section and tick “Hide this section” to keep its content without showing it. This is the page that lists the property types — the property types themselves are edited under Property Types, and the cards follow that list automatically.",
    }),
  ],
  // The Studio document starts prefilled with the shipped two-band stack.
  // JSON round-trip strips the `undefined`s (empty photo slots).
  initialValue: JSON.parse(
    JSON.stringify({ sections: defaultMultifamilyIndexSections }),
  ),
  preview: {
    prepare: () => ({ title: "Multifamily Index Page" }),
  },
});
