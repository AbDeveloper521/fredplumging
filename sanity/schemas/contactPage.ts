import { defineType } from "sanity";
import { contactSectionsForSanity } from "@/data/contactPage";
import { sectionsField } from "./sectionLibrary";

/**
 * The /contact page as an orderable section stack — the same architecture as
 * every other page singleton. Its two own band types (`contactForm`,
 * `contactChannels`) are registered in the SHARED library rather than here,
 * so any page can carry a form band; see `sanity/schemas/contactSections.ts`.
 *
 * The form band is an ordinary section: it can be reordered, hidden,
 * duplicated or removed like any other, because the owner asked for full
 * control of this page. Removing it is warned about — see below — but never
 * blocked.
 *
 * TypeScript twin: `data/contactPage.ts`; mapping (shared):
 * `sanity/lib/sectionLibrary.ts`; rendering (shared):
 * `components/sections/SectionRenderer.tsx`.
 */
export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fields: [
    sectionsField({
      title: "Contact-page sections",
      description:
        "The /contact page, top to bottom — the same section library every page uses. Drag to reorder. The ⋮ menu on each section offers Duplicate and Remove; open a section and tick “Hide this section” to keep its content without showing it. Your phone number, email, service area, opening hours and licence number are NOT typed into these sections — they all come from Site Settings.",
    }),
  ],
  // Prefilled with the shipped stack, in the same Sanity shape the seeder
  // writes — so a document created either way is identical.
  initialValue: { sections: contactSectionsForSanity() },
  /**
   * A Contact page with no form still publishes — the owner may genuinely
   * want a call-only page, and blocking publish over a layout choice is
   * worse than a warning. But it is a business failure often enough to be
   * worth saying out loud, in consequences rather than jargon.
   */
  validation: (rule) =>
    rule.custom((doc) => {
      const sections = (
        doc as
          | { sections?: Array<{ _type?: string; hidden?: boolean } | null> }
          | undefined
      )?.sections;
      // No array at all = a brand-new document, not a removal. The page
      // falls back to the shipped stack, which has a form.
      if (!Array.isArray(sections) || sections.length === 0) return true;
      const visibleForm = sections.some(
        (section) => section?._type === "contactForm" && section.hidden !== true,
      );
      if (visibleForm) return true;
      const hiddenOnly = sections.some(
        (section) => section?._type === "contactForm",
      );
      return hiddenOnly
        ? "This page's contact form is hidden — visitors can't send you a request, so every enquiry has to come by phone. Untick “Hide this section” on the Contact form band to bring it back."
        : "This page has no contact form — visitors can't send you a request, so every enquiry has to come by phone. Add “Contact form (lead capture)” from the Contact & forms group to bring it back.";
    }).warning(),
  preview: {
    prepare: () => ({ title: "Contact Page" }),
  },
});
