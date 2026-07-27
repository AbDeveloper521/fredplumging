import { defineArrayMember, defineField } from "sanity";

/**
 * Shared image-with-required-alt field. Alt text is enforced whenever an
 * image is set — accessibility is first-class, and that only holds if the
 * CMS enforces it.
 */
export function imageWithAlt(options: {
  name: string;
  title: string;
  description: string;
}) {
  return defineField({
    name: options.name,
    title: options.title,
    description: options.description,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Describe this image",
        description:
          "A short sentence saying what's in the picture, e.g. “Technician repairing a commercial water heater”. This is what screen readers announce to blind and low-vision visitors, and what shows if the image fails to load.",
        type: "string",
      }),
    ],
    validation: (rule) =>
      rule.custom((value: { asset?: unknown; alt?: string } | undefined) => {
        if (value?.asset && !value.alt) {
          return "Please describe the image. Screen readers announce this description to blind and low-vision visitors — without it the image is invisible to them.";
        }
        return true;
      }),
  });
}

/**
 * Shared slug field, locked once it has a value. Slugs drive live URLs;
 * changing a published one breaks inbound links and search rankings.
 * Unlock path for corrections: `npm run fix:slug` (see scripts/fix-slug.ts).
 */
export function lockedSlug(options: { source: string; prefix: string }) {
  return defineField({
    name: "slug",
    title: "Web address",
    description:
      `⚠️ Check this carefully BEFORE saving. This becomes the page's web address (${options.prefix}/…) and is set permanently the FIRST TIME this document is saved — it cannot be changed afterwards, even before publishing. Changing an address later breaks links from Google and anywhere the page has been shared. If it's wrong, stop and contact your developer instead of saving.`,
    type: "slug",
    options: {
      source: options.source,
      maxLength: 60,
    },
    // Locks as soon as a slug exists (slightly stricter than
    // "after publish" — Studio schema callbacks can't see publish state).
    // The slug is NEVER regenerated when the title changes; the Generate
    // button is manual and disabled once locked.
    readOnly: ({ value }) => Boolean(value?.current),
    validation: (rule) =>
      rule.required().error(
        "The page needs a web address before it can be published — click Generate to create one from the title.",
      ),
  });
}

/**
 * Rich page body, deliberately constrained: h2/h3 (h1 belongs to the page
 * title), bold, italic, links, bullet/numbered lists, and one custom block —
 * a call-to-action callout. No colours, no font control: the client writes
 * content; the design system controls appearance.
 */
export function richBody(options: { description: string }) {
  return defineField({
    name: "body",
    title: "Page content",
    description: options.description,
    type: "array",
    of: [
      defineArrayMember({
        type: "block",
        styles: [
          { title: "Paragraph", value: "normal" },
          { title: "Section heading", value: "h2" },
          { title: "Sub-heading", value: "h3" },
        ],
        lists: [
          { title: "Bullet list", value: "bullet" },
          { title: "Numbered list", value: "number" },
        ],
        marks: {
          decorators: [
            { title: "Bold", value: "strong" },
            { title: "Italic", value: "em" },
          ],
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
                    "A page on this site starting with a slash (e.g. /contact) or a full web address (https://…).",
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
      defineArrayMember({
        name: "callout",
        title: "Call-us box",
        type: "object",
        fields: [
          defineField({
            name: "heading",
            title: "Heading",
            description: "Short and urgent, e.g. “Dealing with this right now?”",
            type: "string",
            validation: (rule) =>
              rule.required().error("The box needs a heading."),
          }),
          defineField({
            name: "text",
            title: "Text",
            description: "One or two sentences under the heading.",
            type: "text",
            rows: 2,
            validation: (rule) =>
              rule.required().error("The box needs a sentence of text."),
          }),
          defineField({
            name: "showPhoneButton",
            title: "Show the call button",
            description:
              "Adds the red call button with the phone number from Site Settings.",
            type: "boolean",
            initialValue: true,
          }),
        ],
        preview: {
          select: { title: "heading" },
          prepare: ({ title }) => ({
            title: title ?? "Call-us box",
            subtitle: "Call-us box",
          }),
        },
      }),
    ],
  });
}

/**
 * Per-document SEO overrides in a collapsed group. Warning-level (not
 * error) so publishing is never blocked — empty fields fall back to the
 * generated metadata.
 */
export function seoFields() {
  return [
    defineField({
      name: "seoTitle",
      title: "Search result title",
      description:
        "The blue headline Google shows for this page. Aim for 50–60 characters — longer gets cut off with “…”. Leave empty to use the page name automatically.",
      type: "string",
      group: "seo",
      validation: (rule) =>
        rule
          .max(60)
          .warning("Over 60 characters — Google will likely cut this off."),
    }),
    defineField({
      name: "seoDescription",
      title: "Search result description",
      description:
        "The grey text under the headline in Google. Aim for 120–160 characters and include what a property manager would search for. Leave empty to use the short description automatically.",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) =>
        rule
          .max(160)
          .warning("Over 160 characters — Google will likely cut this off."),
    }),
  ];
}
