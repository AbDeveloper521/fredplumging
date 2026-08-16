import { defineType } from "sanity";
import { commercialSectionsForSanity } from "@/data/commercialPage";
import { sectionsField } from "./sectionLibrary";

/**
 * The `/commercial` page as an orderable section stack — the same architecture
 * as every other page singleton. It defines no section types of its own: the
 * shared library covers every band, so `sectionsField()` gives it the
 * identical grouped insert menu.
 *
 * Titled "Commercial Page" for the standalone /commercial page. The separate
 * "Commercial Plumbing" document under Service Pages is the /services/
 * commercial-plumbing service — different page, different document, and the
 * Careers Page / Careers mix-up is why the wording here is deliberate.
 *
 * TypeScript twin: `data/commercialPage.ts`; mapping (shared):
 * `sanity/lib/sectionLibrary.ts`; rendering (shared):
 * `components/sections/SectionRenderer.tsx`.
 */
export const commercialPage = defineType({
  name: "commercialPage",
  title: "Commercial Page",
  type: "document",
  fields: [
    sectionsField({
      title: "Commercial-page sections",
      description:
        "The /commercial page, top to bottom — the same section library every page uses. Drag to reorder. The ⋮ menu on each section offers Duplicate and Remove; open a section and tick “Hide this section” to keep its content without showing it.",
    }),
  ],
  // Prefilled with the shipped stack in Sanity shape — nested card/benefit
  // rows keyed, and the Q&A band as a reference to the shared set. The
  // seeder writes the identical thing, so a document created either way
  // matches. (Publishing this prefill before the set exists leaves that one
  // band pointing at a missing document; the seeder creates the set for you.)
  initialValue: { sections: commercialSectionsForSanity() },
  preview: {
    prepare: () => ({ title: "Commercial Page" }),
  },
});
