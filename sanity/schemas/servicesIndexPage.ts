import { defineType } from "sanity";
import { defaultServicesIndexSections } from "@/data/servicesIndexPage";
import { sectionsField } from "./sectionLibrary";

/**
 * The `/services` landing page as an orderable section stack — the same
 * architecture as every other page singleton. It defines no section types
 * of its own: the shared library already covers every band this page needs,
 * so `sectionsField()` gives it the identical grouped insert menu.
 *
 * Titled "Services Index Page" so it can't be mistaken for the "Service
 * Pages" collection in the sidebar (the individual /services/[slug]
 * documents) — the Careers Page / Careers pairing already confused that
 * once.
 *
 * TypeScript twin: `data/servicesIndexPage.ts`; mapping (shared):
 * `sanity/lib/sectionLibrary.ts`; rendering (shared):
 * `components/sections/SectionRenderer.tsx`.
 */
export const servicesIndexPage = defineType({
  name: "servicesIndexPage",
  title: "Services Index Page",
  type: "document",
  fields: [
    sectionsField({
      title: "Services-page sections",
      description:
        "The /services landing page, top to bottom — the same section library every page uses. Drag to reorder. The ⋮ menu on each section offers Duplicate and Remove; open a section and tick “Hide this section” to keep its content without showing it. This is the page that lists the services — the services themselves are edited under Service Pages.",
    }),
  ],
  // The Studio document starts prefilled with the shipped two-band stack.
  // JSON round-trip strips the `undefined`s (empty photo slots).
  initialValue: JSON.parse(
    JSON.stringify({ sections: defaultServicesIndexSections }),
  ),
  preview: {
    prepare: () => ({ title: "Services Index Page" }),
  },
});
