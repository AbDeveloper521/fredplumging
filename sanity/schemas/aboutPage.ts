import { defineArrayMember, defineField, defineType } from "sanity";
import type { NavIconName } from "@/data/navigation";
import { imageWithAlt } from "./fields";

/**
 * Singleton mirroring `data/aboutPage.ts` exactly — the /about page's
 * editable copy. Built now, populated later (standing rule): the page falls
 * back to the static data until this document is published.
 */

const VALUE_ICONS: Array<{ title: string; value: NavIconName }> = [
  { title: "Award (professionalism)", value: "award" },
  { title: "Shield check (integrity)", value: "shield-check" },
  { title: "Clock (reliability)", value: "clock" },
  { title: "Siren (safety)", value: "siren" },
  { title: "Wrench (licensed team)", value: "wrench" },
  { title: "Office building (vendor portals)", value: "building-2" },
  { title: "Heart handshake", value: "heart-handshake" },
];

function paragraphsField(name: string, title: string, description: string) {
  return defineField({
    name,
    title,
    description,
    type: "array",
    of: [defineArrayMember({ type: "text", rows: 5 })],
    validation: (rule) => rule.required().min(1),
  });
}

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({
      name: "heroEyebrow",
      title: "Small label above the heading",
      description: "Tiny uppercase label, e.g. “Fred's Plumbing”.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroHeading",
      title: "Big heading",
      description: "The page's one H1, e.g. “About Fred's Plumbing”.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    paragraphsField(
      "heroParagraphs",
      "Intro paragraphs",
      "The paragraphs under the heading. One entry per paragraph.",
    ),
    defineField({
      name: "storyHeading",
      title: "Story section heading",
      description: "e.g. “Committed to Quality and Service Since 1996”.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    paragraphsField(
      "storyParagraphs",
      "Story paragraphs",
      "The founder/history copy. One entry per paragraph.",
    ),
    imageWithAlt({
      name: "storyPhotoPrimary",
      title: "Story — main photo",
      description:
        "The large photo in the story section's collage, part-way down the page.",
    }),
    defineField({
      name: "storyPhotoSubjectPrimary",
      title: "Intended main-photo subject",
      description:
        "What the main story photo should eventually show. Shown inside the styled placeholder until a real photo is uploaded.",
      type: "string",
    }),
    imageWithAlt({
      name: "storyPhotoSecondary",
      title: "Story — small overlapping photo",
      description: "The smaller photo overlapping the main one in the collage.",
    }),
    defineField({
      name: "storyPhotoSubjectSecondary",
      title: "Intended small-photo subject",
      description:
        "What the small story photo should eventually show. Shown inside the styled placeholder until a real photo is uploaded.",
      type: "string",
    }),
    defineField({
      name: "evolutionHeading",
      title: "Evolution section heading",
      description: "e.g. “Evolving to Meet the Needs of a Growing Region”.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    paragraphsField(
      "evolutionParagraphs",
      "Evolution paragraphs",
      "The growth/today copy on the dark band. One entry per paragraph.",
    ),
    imageWithAlt({
      name: "evolutionPhoto",
      title: "Evolution photo",
      description: "The single large photo beside the evolution copy.",
    }),
    defineField({
      name: "evolutionPhotoSubject",
      title: "Intended evolution-photo subject",
      description:
        "What the photo should eventually show. Shown inside the styled placeholder until a real photo is uploaded.",
      type: "string",
    }),
    defineField({
      name: "valuesHeading",
      title: "Values section heading",
      description: "e.g. “What We Stand For”.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "values",
      title: "Values",
      description:
        "Four to six cards, each a quality the copy above actually claims — don't invent new ones to fill the grid.",
      type: "array",
      of: [
        defineArrayMember({
          name: "value",
          title: "Value",
          type: "object",
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              description: "Small symbol on the card. Leave empty to use the wrench icon.",
              type: "string",
              options: { list: VALUE_ICONS },
            }),
            defineField({
              name: "title",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              title: "One line",
              type: "text",
              rows: 2,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        }),
      ],
      validation: (rule) => rule.required().min(4).max(6),
    }),
    defineField({
      name: "linksHeading",
      title: "Closing links heading",
      description: "e.g. “Where to Next”.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "links",
      title: "Closing link cards",
      description: "Cards to the About child pages (Partners, Careers, Testimonials).",
      type: "array",
      of: [
        defineArrayMember({
          name: "link",
          title: "Link card",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              title: "One line of context",
              type: "text",
              rows: 2,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "Page",
              description: "A page on this site, starting with a slash — e.g. /about/partners.",
              type: "string",
              validation: (rule) =>
                rule
                  .required()
                  .custom((value?: string) =>
                    value?.startsWith("/")
                      ? true
                      : "Use a page on this site, starting with a slash.",
                  ),
            }),
          ],
          preview: { select: { title: "title", subtitle: "href" } },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare: () => ({ title: "About Page" }),
  },
});
