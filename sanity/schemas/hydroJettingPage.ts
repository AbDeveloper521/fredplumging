import { defineType } from "sanity";
import { hydroJettingSectionsForSanity } from "@/data/hydroJettingPage";
import { sectionsField } from "./sectionLibrary";

/**
 * The `/commercial/hydro-jetting` page as an orderable section stack — the
 * same architecture as every other page singleton. It defines no section types
 * of its own: the shared library covers every band, so `sectionsField()` gives
 * it the identical grouped insert menu.
 *
 * Titled "Hydro Jetting Page" for the one page about hydro jetting. There is
 * deliberately no second one: jetting is mentioned on Drain & Sewer and
 * Specialty Services under Service Pages, but those documents describe other
 * services and must not grow into rival jetting pages.
 *
 * TypeScript twin: `data/hydroJettingPage.ts`; mapping (shared):
 * `sanity/lib/sectionLibrary.ts`; rendering (shared):
 * `components/sections/SectionRenderer.tsx`.
 */
export const hydroJettingPage = defineType({
  name: "hydroJettingPage",
  title: "Hydro Jetting Page",
  type: "document",
  fields: [
    sectionsField({
      title: "Hydro-jetting-page sections",
      description:
        "The /commercial/hydro-jetting page, top to bottom — the same section library every page uses. Drag to reorder. The ⋮ menu on each section offers Duplicate and Remove; open a section and tick “Hide this section” to keep its content without showing it.",
    }),
  ],
  // Prefilled with the shipped stack in Sanity shape — nested card/item rows
  // keyed, and the Q&A band as a WEAK reference to the shared set. The seeder
  // writes the identical thing, so a document created either way matches. Weak
  // matters here: this prefill points at "Hydro Jetting FAQs", which does not
  // exist until the seeder runs (or the owner creates it), and a strong
  // reference would make Studio refuse to save the document at all. Until the
  // set exists that one band simply doesn't render, and says so in the server
  // log.
  initialValue: { sections: hydroJettingSectionsForSanity() },
  preview: {
    prepare: () => ({ title: "Hydro Jetting Page" }),
  },
});
