import { defineArrayMember, defineField, defineType } from "sanity";
import { LEGAL_SLUGS, LEGAL_SHORT_TITLES, type LegalSlug } from "@/data/legalPages";
import { imageWithAlt, seoFields } from "./fields";

/**
 * The two legal documents — Privacy Policy and Terms of Service — as ONE
 * document type keyed by a slug restricted to those two values, so this can
 * never sprawl into a general page builder.
 *
 * Deliberately NOT on the shared `sectionsField()` stack that every other
 * page uses. Those pages are marketing layouts assembled from bands; a legal
 * document is one continuous prose run, and Portable Text is the right shape
 * for it. The banner is the only shared-looking part, and it lives in
 * dedicated fields.
 *
 * The `body` block list is kept tight on purpose — h2, paragraph, bullets,
 * bold and links, nothing else. No images, no custom blocks, no h1 (the title
 * owns that), no h3 (neither document nests that deep). That restraint is
 * what stops a legal page turning into a freeform page builder.
 *
 * TypeScript twin + verbatim fallback copy: `data/legalPages.ts`.
 */
export const legalPage = defineType({
  name: "legalPage",
  title: "Legal Page",
  type: "document",
  groups: [{ name: "seo", title: "Search (SEO)" }],
  fields: [
    // A fixed choice, not a free slug field: the site has exactly these two
    // legal routes, and both are indexed by Google. A dropdown of two is also
    // the honest UI — the owner is identifying a document, not naming a URL.
    defineField({
      name: "slug",
      title: "Which document is this?",
      description:
        "Sets the page's web address: /privacy-policy or /terms-of-service. Do not change this on a published document — those addresses are indexed by Google and linked from the footer.",
      type: "string",
      options: {
        layout: "radio",
        list: LEGAL_SLUGS.map((value) => ({
          title: `${LEGAL_SHORT_TITLES[value]} (/${value})`,
          value,
        })),
      },
      validation: (rule) =>
        rule
          .required()
          .error("Choose which legal document this is.")
          .custom((value: string | undefined) =>
            value && (LEGAL_SLUGS as readonly string[]).includes(value)
              ? true
              : "Must be one of the two legal pages: privacy-policy or terms-of-service.",
          ),
    }),
    defineField({
      name: "title",
      title: "Page heading",
      description:
        "The big heading at the top of the page, e.g. “Privacy Policy For Fred's Plumbing Service”.",
      type: "string",
      validation: (rule) =>
        rule.required().error("The page needs its heading."),
    }),
    defineField({
      name: "eyebrow",
      title: "Small label above the heading",
      description:
        "The little red line of text above the heading. Both documents show the company name here.",
      type: "string",
      initialValue: "FRED'S PLUMBING",
    }),
    defineField({
      name: "intro",
      title: "Opening paragraph(s)",
      description:
        "The paragraph or two under the heading, before the first section. One entry per paragraph — the Privacy Policy has two, the Terms have one.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "body",
      title: "Document text",
      description:
        "The document itself. Use “Section heading” for each numbered section — the “On this page” list down the side is built from those headings automatically, so anything you add or rename appears there too. Bullet lists, bold and links are available; there is deliberately nothing else.",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          // No h3: neither document nests that deep. No h1: the title owns it.
          styles: [
            { title: "Paragraph", value: "normal" },
            { title: "Section heading", value: "h2" },
          ],
          lists: [{ title: "Bullet list", value: "bullet" }],
          marks: {
            decorators: [{ title: "Bold", value: "strong" }],
            annotations: [
              defineArrayMember({
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "Link address",
                    description:
                      "A page on this site starting with a slash (e.g. /privacy-policy) or a full web address (https://…).",
                    type: "string",
                    validation: (rule) =>
                      rule
                        .required()
                        .error("A link needs an address to point at.")
                        .custom((value) =>
                          value?.startsWith("/") || value?.startsWith("https://")
                            ? true
                            : "Start with a slash for pages on this site (/contact) or https:// for other websites.",
                        ),
                  }),
                ],
              }),
            ],
          },
        }),
      ],
      validation: (rule) =>
        rule.required().min(1).error("The document needs its text."),
    }),
    defineField({
      name: "contact",
      title: "Contact box at the end",
      description:
        "The bordered box that closes the document. Kept as separate fields (not part of the text above) so the phone number can be a real tap-to-call link.",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "name",
          title: "Business name",
          type: "string",
        }),
        defineField({
          name: "phoneDisplay",
          title: "Phone number, as it should read",
          description:
            "Shown exactly as typed. The tap-to-call link is built from the digits, so “(972) 564 9081” works.",
          type: "string",
        }),
        defineField({
          name: "website",
          title: "Website",
          description: "Shown as plain text, exactly as typed.",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "lastUpdated",
      title: "Last updated",
      description:
        "Optional, and empty on purpose — neither document currently shows a date. Set one and a “Last updated” line appears under the heading; clear it and the line disappears. Nothing fills this in automatically.",
      type: "date",
      options: { dateFormat: "MMMM D, YYYY" },
    }),
    imageWithAlt({
      name: "bannerPhoto",
      title: "Banner background photo",
      description:
        "The photo behind the heading at the top of the page. A dark building or job-site photo works best — the text sits on top of it.",
      // The banner crops wide and full-bleed; a frame-shape override would
      // fight the layout.
      frameRatio: false,
    }),
    defineField({
      name: "darkOverlay",
      title: "Darken the banner photo",
      description:
        "Keeps the white heading readable over the photo. Turn this off only if the photo is already very dark.",
      type: "boolean",
      initialValue: true,
    }),
    ...seoFields(),
  ],
  preview: {
    select: { title: "title", slug: "slug" },
    prepare: ({ title, slug }) => ({
      title:
        (typeof slug === "string" &&
          LEGAL_SHORT_TITLES[slug as LegalSlug]) ||
        (typeof title === "string" ? title : "Legal page"),
      subtitle: typeof slug === "string" ? `/${slug}` : undefined,
    }),
  },
});
