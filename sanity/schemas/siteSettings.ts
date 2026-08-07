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
      title: "Years in business (manual override)",
      description:
        "LEAVE EMPTY to show the value calculated from the founded year (recommended — it updates itself every year). Only fill this in to force a specific display string, e.g. “30+”.",
      type: "string",
    }),
    defineField({
      name: "licenseNumber",
      title: "State plumbing licence number",
      description: "As shown in the site footer and vendor pages, e.g. RMP 44890",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "Production URL (no longer used)",
      description:
        "⚠️ This field is ignored by the website. Which domain serves the site is a deployment setting, not content — it is set on the hosting platform (NEXT_PUBLIC_SITE_URL) so that search-engine canonical links can never point at a domain that is not live yet. Ask your developer to change the domain; nothing you type here has any effect.",
      type: "url",
      readOnly: true,
    }),
    defineField({
      name: "streetAddress",
      title: "Street address",
      description:
        "Optional. Filling in the full address (all four fields) is what lets job postings appear in Google's job search.",
      type: "string",
    }),
    defineField({
      name: "addressLocality",
      title: "City",
      description: "e.g. Dallas. Part of the business address.",
      type: "string",
    }),
    defineField({
      name: "addressRegion",
      title: "State",
      description: "e.g. TX. Part of the business address.",
      type: "string",
    }),
    defineField({
      name: "postalCode",
      title: "ZIP code",
      description: "Part of the business address.",
      type: "string",
    }),
    defineField({
      name: "mapHeading",
      title: "Map band — heading",
      description:
        "Heading of the Google-map band shown on the homepage and every service page, e.g. “Serving the Dallas–Fort Worth Metroplex”. Leave empty to use the built-in default.",
      type: "string",
    }),
    defineField({
      name: "mapDescription",
      title: "Map band — supporting line",
      description:
        "One sentence under the map-band heading. Leave empty to use the built-in default.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "mapEmbedUrl",
      title: "Map band — Google Maps embed address",
      description:
        "From Google Maps: Share → Embed a map → copy ONLY the address inside src=\"…\" (it starts with https://www.google.com/maps/embed). Do not paste the whole <iframe> code. Leave empty to use the built-in default.",
      type: "url",
      validation: (rule) =>
        rule
          .uri({ scheme: ["https"] })
          .custom((value?: string) =>
            !value || value.startsWith("https://www.google.com/maps/embed")
              ? true
              : "Paste only the embed address — it must start with https://www.google.com/maps/embed. If you copied the whole <iframe> code, take just the part between the quotes after src=.",
          ),
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
