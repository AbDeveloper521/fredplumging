import { defineField, defineType } from "sanity";

/**
 * Singleton mirroring `data/site.ts` exactly — same field names, same types.
 * Every field that is required in TypeScript is required here: a missing
 * phone number should be impossible to publish, not a runtime undefined.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Business name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "legalName",
      title: "Legal name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Phone (display)",
      description: "As shown to visitors, e.g. 972-564-9081",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "phoneHref",
      title: "Phone (tel: link)",
      description: "Must start with tel:, e.g. tel:+19725649081",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            value?.startsWith("tel:") ? true : "Must start with tel:",
          ),
    }),
    defineField({
      name: "email",
      title: "Email (display)",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "emailHref",
      title: "Email (mailto: link)",
      description: "Must start with mailto:",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            value?.startsWith("mailto:") ? true : "Must start with mailto:",
          ),
    }),
    defineField({
      name: "serviceArea",
      title: "Service area",
      description: "e.g. Dallas–Fort Worth Metroplex",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "foundedYear",
      title: "Founded year",
      type: "number",
      validation: (rule) => rule.required().integer().min(1900),
    }),
    defineField({
      name: "yearsInBusiness",
      title: "Years in business (display)",
      description: 'Display string, e.g. "27+"',
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "Production URL",
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "serviceAreaCities",
      title: "Service area cities",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
