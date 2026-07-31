import { defineField, defineType } from "sanity";
import { imageWithAlt } from "./fields";

// The document type id stays "trustLogo" — changing it would need a dataset
// migration. The title is what editors see.
export const trustLogo = defineType({
  name: "trustLogo",
  title: "Partners & Vendor Systems",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Company / organization name",
      description:
        "The vendor system or association, e.g. “VendorCafe”. Shown in the logo strip under the homepage hero and in the compliance section. If no logo image is added, the name itself is shown as a styled wordmark.",
      type: "string",
      validation: (rule) =>
        rule.required().error("The strip needs a name to show, even without a logo image."),
    }),
    imageWithAlt({
      name: "logo",
      title: "Logo image",
      description:
        "This logo appears in the scrolling trust strip on the homepage, the Compliance section's logo row, and the partner cards on the Partners page. Please upload a transparent-background PNG or SVG — logos exported with a baked-in white or dark rectangle show that rectangle inside the strip's white tiles. Optional — without it the name is shown as styled text.",
      // Logos render object-contain inside the tile system — never cropped,
      // so a frame-shape control does not apply.
      frameRatio: false,
    }),
    defineField({
      name: "headline",
      title: "Partner-card heading",
      description:
        "The heading on this entry's card on the Partners page, e.g. “Verified Vendor On VendorCafe”. Optional — without it the card says “Approved vendor on [name]”.",
      type: "string",
    }),
    defineField({
      name: "blurb",
      title: "Partner-card paragraph",
      description:
        "Writing a paragraph here is what promotes this entry onto the Partners page: entries WITH a paragraph get a full card there, entries without one appear only in the homepage logo strips — same idea as the logo image, where leaving it empty shows the name as a styled wordmark.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "category",
      title: "Category",
      description:
        "What kind of organization this is — shown as the small pill on the partner card and used for grouping.",
      type: "string",
      options: {
        list: [
          { title: "Vendor portal", value: "vendor-portal" },
          { title: "Compliance network", value: "compliance-network" },
          { title: "Trade association", value: "association" },
          { title: "Credential", value: "credential" },
        ],
      },
      initialValue: "vendor-portal",
    }),
    defineField({
      name: "url",
      title: "Public profile link",
      description:
        "Optional link to Fred's Plumbing's public vendor profile on this platform. Only add a link that actually shows the profile.",
      type: "url",
      validation: (rule) =>
        rule.uri({ scheme: ["https"], allowRelative: false }),
    }),
    defineField({
      name: "verified",
      title: "Verified vendor status",
      description:
        "Shows the “verified” pill on the partner card. Untick if the registration on this platform lapses.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Display order",
      description:
        "Controls the order in the strip — lower numbers appear first. Use 10, 20, 30… so you can slot new logos in between later.",
      type: "number",
      validation: (rule) =>
        rule
          .required()
          .error("Without a number the site can't know where to place this logo.")
          .integer()
          .error("Use a whole number like 10 or 20.")
          .min(0)
          .error("Use 0 or higher."),
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrder",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", media: "logo", category: "category", blurb: "blurb" },
    prepare: ({ title, media, category, blurb }) => ({
      title,
      media,
      subtitle: `${category ?? "uncategorized"} · ${blurb ? "partner card + strips" : "strips only"}`,
    }),
  },
});
