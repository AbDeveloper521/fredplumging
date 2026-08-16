import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Reusable question sets, and the section band that shows one.
 *
 * NAMING: the object type is `faqBand`, not `faq` — `faq` is already taken by
 * the per-question FAQ document type (the homepage "Common Questions" list),
 * and Sanity's type registry is flat, so a second `faq` would collide. The
 * three Q&A section types read as a family in the insert menu:
 *   • "Q&A (shared FAQ set)"        — this one, reusable across pages
 *   • "Q&A (written in this section)" — serviceFaq, one-off per page
 *   • "Q&A (from the FAQs list)"     — homeFaq, the whole FAQs collection
 *
 * TypeScript twin: `data/faqSets.ts`; mapping (shared):
 * `sanity/lib/sectionLibrary.ts`; rendering (shared):
 * `components/sections/FaqBandSection.tsx`.
 */

function hiddenField() {
  return defineField({
    name: "hidden",
    title: "Hide this section",
    description:
      "Keeps the content but stops showing it on the site. Untick to bring it back exactly as it was.",
    type: "boolean",
    initialValue: false,
  });
}

const faqItem = defineArrayMember({
  name: "faqItem",
  title: "Question",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      description:
        "Phrase it the way a property manager would actually ask it, e.g. “How quickly can you respond to an emergency at one of our communities?”",
      type: "string",
      validation: (rule) =>
        rule.required().error("A question with no text can't be shown."),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      description:
        "Open with the direct answer (“Yes. …”), then the detail. Never leave a [bracketed] gap in place of a real figure — if the number isn't confirmed, word the answer so it's true without one.",
      type: "text",
      rows: 5,
      validation: (rule) =>
        rule
          .required()
          .error("A question with no answer would open an empty panel on the site."),
    }),
  ],
  preview: {
    select: { title: "question", answer: "answer" },
    prepare: ({ title, answer }: { title?: string; answer?: string }) => ({
      title: title ?? "Untitled question",
      subtitle: answer ? answer.slice(0, 90) : "No answer yet",
    }),
  },
});

export const faqSet = defineType({
  name: "faqSet",
  title: "FAQ Set",
  type: "document",
  description:
    "A set of questions used by more than one page. Edit an answer here and it updates everywhere the set is shown.",
  fields: [
    defineField({
      name: "title",
      title: "Set name (internal)",
      description:
        "Only you see this — it's how you pick the set when adding the band to a page, e.g. “Multi-Family FAQs”.",
      type: "string",
      validation: (rule) =>
        rule.required().error("Give the set a name so you can find it later."),
    }),
    defineField({
      name: "heading",
      title: "Heading shown on the page",
      description:
        "e.g. “Frequently Asked Questions”. Leave empty for that default. A single page can override this without changing the set.",
      type: "string",
    }),
    defineField({
      name: "intro",
      title: "Intro line (optional)",
      description: "One short line under the heading. Leave empty for none.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "items",
      title: "Questions",
      description:
        "Drag to reorder — the order here is the order on every page that shows this set.",
      type: "array",
      of: [faqItem],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .error("A set with no questions would render an empty band."),
    }),
  ],
  preview: {
    select: { title: "title", items: "items" },
    prepare: ({ title, items }: { title?: string; items?: unknown[] }) => {
      const count = Array.isArray(items) ? items.length : 0;
      return {
        title: title ?? "Untitled FAQ set",
        subtitle: `${count} question${count === 1 ? "" : "s"}`,
      };
    },
  },
});

/** True when this band is set to pull its questions from a shared set. */
function usesSharedSet(parent: unknown): boolean {
  const source = (parent as { source?: unknown } | undefined)?.source;
  // Absent means the default, which is the shared set.
  return source !== "inline";
}

export const faqBand = defineType({
  name: "faqBand",
  title: "Q&A (shared FAQ set)",
  type: "object",
  description:
    "An accordion of questions and answers. Normally it shows a set from FAQ Sets, so the same answers stay in step across every page that uses them.",
  fields: [
    defineField({
      name: "source",
      title: "Where the questions come from",
      description:
        "“A shared FAQ set” keeps this page in step with every other page using that set — change an answer once and it updates everywhere. “Written here” is for questions only this page should have.",
      type: "string",
      options: {
        list: [
          { title: "A shared FAQ set (recommended)", value: "set" },
          { title: "Written here, for this page only", value: "inline" },
        ],
        layout: "radio",
      },
      initialValue: "set",
      validation: (rule) =>
        rule.required().error("Pick where the questions come from."),
    }),
    defineField({
      name: "faqSet",
      title: "Which FAQ set",
      description: "The set of questions this band shows. Manage them under FAQ Sets.",
      type: "reference",
      to: [{ type: "faqSet" }],
      hidden: ({ parent }) => !usesSharedSet(parent),
      // Conditional on its sibling, so it must be a FIELD rule: a `validation`
      // on the parent object is accepted by the schema and never runs.
      validation: (rule) =>
        rule.custom((value, context) =>
          !usesSharedSet(context.parent) || value
            ? true
            : "Choose the FAQ set this band should show, or switch to “Written here, for this page only” and add the questions below.",
        ),
    }),
    defineField({
      name: "headingOverride",
      title: "Different heading on this page (optional)",
      description:
        "Leave empty to use the set's own heading. Fill it in only when this one page needs different wording — the questions stay shared either way.",
      type: "string",
      hidden: ({ parent }) => !usesSharedSet(parent),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      description: "e.g. “Frequently Asked Questions”. Leave empty for that default.",
      type: "string",
      hidden: ({ parent }) => usesSharedSet(parent),
    }),
    defineField({
      name: "intro",
      title: "Intro line (optional)",
      description: "One short line under the heading. Leave empty for none.",
      type: "text",
      rows: 2,
      hidden: ({ parent }) => usesSharedSet(parent),
    }),
    defineField({
      name: "items",
      title: "Questions",
      description: "Questions for this page only. Drag to reorder.",
      type: "array",
      of: [faqItem],
      hidden: ({ parent }) => usesSharedSet(parent),
      validation: (rule) =>
        rule.custom((value, context) =>
          usesSharedSet(context.parent) ||
          (Array.isArray(value) && value.length > 0)
            ? true
            : "Add at least one question, or switch to “A shared FAQ set” and choose a set.",
        ),
    }),
    hiddenField(),
  ],
  preview: {
    select: {
      source: "source",
      hidden: "hidden",
      setTitle: "faqSet.title",
      setCount: "faqSet.items",
      headingOverride: "headingOverride",
      heading: "heading",
      items: "items",
    },
    prepare: ({
      source,
      hidden,
      setTitle,
      setCount,
      headingOverride,
      heading,
      items,
    }: {
      source?: string;
      hidden?: boolean;
      setTitle?: string;
      setCount?: unknown[];
      headingOverride?: string;
      heading?: string;
      items?: unknown[];
    }) => {
      const shared = source !== "inline";
      const count = Array.isArray(shared ? setCount : items)
        ? (shared ? setCount : items)!.length
        : 0;
      const questions = `${count} question${count === 1 ? "" : "s"}`;
      const detail = shared
        ? setTitle
          ? `Shared set: ${setTitle} · ${questions}`
          : "Shared set: none chosen yet"
        : `Written here · ${questions}`;
      return {
        title: `${hidden ? "🚫 " : ""}Q&A — ${headingOverride ?? heading ?? "Frequently Asked Questions"}`,
        subtitle: hidden ? "HIDDEN — not shown on the site" : detail,
      };
    },
  },
});
