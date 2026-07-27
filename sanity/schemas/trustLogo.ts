import { defineField, defineType } from "sanity";
import { imageWithAlt } from "./fields";

export const trustLogo = defineType({
  name: "trustLogo",
  title: "Trust Logo",
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
        "The organization's logo file (PNG with transparent background works best). Optional — without it the name is shown as styled text.",
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
    select: { title: "name", media: "logo" },
  },
});
