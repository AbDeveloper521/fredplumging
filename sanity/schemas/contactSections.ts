import { defineField, defineType } from "sanity";

/**
 * Two SHARED section types contributed by the Contact page, registered in the
 * one section library every page stack uses:
 *
 *   - `contactChannels` — the "call now / send the details" split
 *   - `contactForm`     — the lead form band with its contact-details sidebar
 *
 * They live in the library, not on the Contact document, because a
 * request-service band on a service or city page is an obvious want and the
 * site builds a band once.
 *
 * ⚠️ THE FORM'S FIELDS ARE FIXED IN CODE, DELIBERATELY. Everything the form
 * SAYS is editable here — labels, placeholders, button text, the success and
 * error messages. What it COLLECTS is not: the field set, the field names,
 * which fields are required, and the validation rules are defined once in
 * `lib/validations.ts` and enforced again server-side in
 * `app/api/contact/route.ts`. Making those editable would turn this into a
 * form builder, where a Studio edit could silently break lead capture or
 * desynchronise the client form from the server schema that has to match it.
 * A new field is a small developer task, not a content edit.
 *
 * TypeScript twins: `data/contactPage.ts`; mapping (shared):
 * `sanity/lib/sectionLibrary.ts`; rendering (shared):
 * `components/sections/SectionRenderer.tsx`.
 */

/** `rule.required()` alone accepts whitespace — refuse it at publish time. */
const notJustSpaces = (message: string) => (value?: string) =>
  value === undefined || value === null || value.trim() !== "" ? true : message;

const SPACES_ONLY =
  "Write real text or clear the field — spaces alone don't count.";

function requiredString(options: {
  name: string;
  title: string;
  description: string;
  error: string;
  fieldset?: string;
}) {
  return defineField({
    name: options.name,
    title: options.title,
    description: options.description,
    type: "string",
    fieldset: options.fieldset,
    validation: (rule) =>
      rule.required().error(options.error).custom(notJustSpaces(options.error)),
  });
}

function optionalString(options: {
  name: string;
  title: string;
  description: string;
  fieldset?: string;
}) {
  return defineField({
    name: options.name,
    title: options.title,
    description: options.description,
    type: "string",
    fieldset: options.fieldset,
    validation: (rule) => rule.custom(notJustSpaces(SPACES_ONLY)),
  });
}

function requiredText(options: {
  name: string;
  title: string;
  description: string;
  error: string;
  rows?: number;
  fieldset?: string;
}) {
  return defineField({
    name: options.name,
    title: options.title,
    description: options.description,
    type: "text",
    rows: options.rows ?? 3,
    fieldset: options.fieldset,
    validation: (rule) =>
      rule.required().error(options.error).custom(notJustSpaces(options.error)),
  });
}

/** Every section type carries the same hide toggle. */
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

function sectionPreview(bandTitle: string) {
  return {
    select: { heading: "heading", hidden: "hidden" },
    prepare: ({ heading, hidden }: { heading?: string; hidden?: boolean }) => ({
      title: `${hidden ? "🚫 " : ""}${bandTitle}`,
      subtitle: hidden ? "HIDDEN — not shown on the site" : heading,
    }),
  };
}

export const contactChannels = defineType({
  name: "contactChannels",
  title: "Call us / request a quote (two cards)",
  type: "object",
  description:
    "Two cards side by side: a dark one telling emergencies to call, and a light one pointing everyone else at the form. The phone number is not typed here — it comes from Site Settings.",
  fieldsets: [
    { name: "emergency", title: "Left card — call now", options: { collapsible: true } },
    { name: "quote", title: "Right card — request a quote", options: { collapsible: true } },
  ],
  fields: [
    requiredString({
      name: "emergencyHeading",
      title: "Heading",
      description: "Short and urgent, e.g. “Emergency? Call now.”",
      error: "The emergency card needs its heading.",
      fieldset: "emergency",
    }),
    requiredText({
      name: "emergencyBody",
      title: "Text",
      description:
        "One or two sentences telling people with a live emergency to call rather than type.",
      error: "The emergency card needs a sentence of text.",
      fieldset: "emergency",
    }),
    optionalString({
      name: "emergencyNote",
      title: "Small line under the phone number",
      description: "Tiny uppercase line, e.g. “24/7 emergency dispatch”.",
      fieldset: "emergency",
    }),
    requiredString({
      name: "quoteHeading",
      title: "Heading",
      description: "e.g. “Request a quote”.",
      error: "The quote card needs its heading.",
      fieldset: "quote",
    }),
    requiredText({
      name: "quoteBody",
      title: "Text",
      description:
        "What to send and when to expect a reply. Only promise a response time you actually commit to.",
      error: "The quote card needs a sentence of text.",
      fieldset: "quote",
    }),
    optionalString({
      name: "quoteCtaLabel",
      title: "Button text",
      description: "e.g. “Start Your Request”. Clear both button fields to hide the button.",
      fieldset: "quote",
    }),
    defineField({
      name: "quoteCtaHref",
      title: "Button link",
      description:
        "Usually a jump to the form band further down this page — “#contact-form” when the form section's key is “form”. A page on this site (/contact) works too.",
      type: "string",
      fieldset: "quote",
      validation: (rule) =>
        rule.custom((value?: string) => {
          if (!value || value.trim() === "") return true;
          return value.startsWith("/") || value.startsWith("#")
            ? true
            : "Start with # to jump to a band on this page, or / for a page on this site.";
        }),
    }),
    hiddenField(),
  ],
  preview: {
    select: { heading: "emergencyHeading", hidden: "hidden" },
    prepare: ({ heading, hidden }: { heading?: string; hidden?: boolean }) => ({
      title: `${hidden ? "🚫 " : ""}Call us / request a quote`,
      subtitle: hidden ? "HIDDEN — not shown on the site" : heading,
    }),
  },
});

export const contactForm = defineType({
  name: "contactForm",
  title: "Contact form (lead capture)",
  type: "object",
  description:
    "The band people actually submit: the request form, with your contact details beside it. All the WORDING is editable below. The fields themselves are fixed in code — ask your developer to add or remove one, so the form and the server that receives it can never fall out of step.",
  fieldsets: [
    {
      name: "labels",
      title: "Field labels & placeholders",
      description:
        "What each box on the form is called. Changing these never changes what is collected or which boxes are required.",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "submit",
      title: "Button & the line under it",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "messages",
      title: "Messages (success, error, emergency)",
      description:
        "Write {phone} anywhere in these and it becomes a tappable link to the number in Site Settings.",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "details",
      title: "Contact-details sidebar",
      description:
        "Row LABELS only. Every value — number, email, service area, hours, licence — comes from Site Settings, so it is written in exactly one place.",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    requiredString({
      name: "heading",
      title: "Band heading",
      description: "The heading above the form, e.g. “Tell Us About the Work”.",
      error: "The form band can't render without its heading.",
    }),
    defineField({
      name: "intro",
      title: "Intro line",
      description:
        "One sentence under the heading, e.g. how much of the form is required.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.custom(notJustSpaces(SPACES_ONLY)),
    }),

    optionalString({
      name: "workLegend",
      title: "First group heading",
      description: "Above the job questions, e.g. “About the work”.",
      fieldset: "labels",
    }),
    optionalString({
      name: "contactLegend",
      title: "Second group heading",
      description: "Above the contact questions, e.g. “How we reach you”.",
      fieldset: "labels",
    }),
    optionalString({
      name: "serviceLabel",
      title: "“Service needed” label",
      description: "The dropdown of services. Its options come from your Service Pages.",
      fieldset: "labels",
    }),
    optionalString({
      name: "servicePlaceholder",
      title: "“Service needed” placeholder",
      description: "The greyed-out first option, e.g. “Select a service…”.",
      fieldset: "labels",
    }),
    optionalString({
      name: "propertyTypeLabel",
      title: "“Property type” label",
      description: "Optional field — “(optional)” is added automatically.",
      fieldset: "labels",
    }),
    optionalString({
      name: "locationLabel",
      title: "“City or property address” label",
      description: "Optional field — “(optional)” is added automatically.",
      fieldset: "labels",
    }),
    optionalString({
      name: "urgencyLabel",
      title: "“How soon do you need us?” label",
      description: "The four urgency choices themselves are fixed in code.",
      fieldset: "labels",
    }),
    optionalString({
      name: "messageLabel",
      title: "“Describe the work” label",
      description: "The big text box. Required for the visitor.",
      fieldset: "labels",
    }),
    defineField({
      name: "messagePlaceholder",
      title: "“Describe the work” placeholder",
      description:
        "The faint prompt inside the empty box — a good place to ask for what you actually need to quote.",
      type: "text",
      rows: 2,
      fieldset: "labels",
      validation: (rule) => rule.custom(notJustSpaces(SPACES_ONLY)),
    }),
    optionalString({
      name: "nameLabel",
      title: "“Full name” label",
      description: "Required for the visitor.",
      fieldset: "labels",
    }),
    optionalString({
      name: "companyLabel",
      title: "“Company or property group” label",
      description: "Optional field — “(optional)” is added automatically.",
      fieldset: "labels",
    }),
    optionalString({
      name: "phoneLabel",
      title: "“Phone” label",
      description: "Required for the visitor.",
      fieldset: "labels",
    }),
    optionalString({
      name: "emailLabel",
      title: "“Email” label",
      description: "Required for the visitor.",
      fieldset: "labels",
    }),
    optionalString({
      name: "contactMethodLabel",
      title: "“Preferred contact” label",
      description: "Phone / Text / Email. The three choices are fixed in code.",
      fieldset: "labels",
    }),
    optionalString({
      name: "referralLabel",
      title: "“How did you hear about us?” label",
      description: "Optional field — “(optional)” is added automatically.",
      fieldset: "labels",
    }),

    optionalString({
      name: "submitLabel",
      title: "Button text",
      description: "e.g. “Request a Quote”.",
      fieldset: "submit",
    }),
    optionalString({
      name: "submittingLabel",
      title: "Button text while sending",
      description: "Shown for the moment the request is in flight, e.g. “Sending…”.",
      fieldset: "submit",
    }),
    defineField({
      name: "submitNote",
      title: "Line under the button",
      description:
        "Reassurance, e.g. your response time. Only promise what you actually commit to. Write {phone} to include a call link.",
      type: "text",
      rows: 2,
      fieldset: "submit",
      validation: (rule) => rule.custom(notJustSpaces(SPACES_ONLY)),
    }),
    defineField({
      name: "consentLine",
      title: "Privacy / consent line",
      description:
        "Optional small print under the button, e.g. how you use the details and a link to your privacy policy. EMPTY by default — the page has never carried one, and the right wording is a decision for you (and, if it matters, your lawyer), not something to guess at. Leave empty to show nothing.",
      type: "text",
      rows: 2,
      fieldset: "submit",
      validation: (rule) => rule.custom(notJustSpaces(SPACES_ONLY)),
    }),

    defineField({
      name: "emergencyNotice",
      title: "Emergency callout",
      description:
        "Appears the moment someone picks “Emergency” — tell them to call instead. Write {phone} for the call link.",
      type: "text",
      rows: 3,
      fieldset: "messages",
      validation: (rule) => rule.custom(notJustSpaces(SPACES_ONLY)),
    }),
    optionalString({
      name: "successHeading",
      title: "Thank-you heading",
      description: "Replaces the form once it sends, e.g. “Request received”.",
      fieldset: "messages",
    }),
    defineField({
      name: "successBody",
      title: "Thank-you text",
      description:
        "What happens next. Write {phone} for the call link. Say only what you will actually do — this is the promise the visitor remembers.",
      type: "text",
      rows: 3,
      fieldset: "messages",
      validation: (rule) => rule.custom(notJustSpaces(SPACES_ONLY)),
    }),
    optionalString({
      name: "successAgainLabel",
      title: "“Send another” link text",
      description: "e.g. “Submit another request”.",
      fieldset: "messages",
    }),
    defineField({
      name: "errorMessage",
      title: "Something-went-wrong message",
      description:
        "Shown if the request fails to send. ALWAYS give them the phone number here — write {phone} — because this is the moment a lead is otherwise lost.",
      type: "text",
      rows: 3,
      fieldset: "messages",
      validation: (rule) => rule.custom(notJustSpaces(SPACES_ONLY)),
    }),

    optionalString({
      name: "detailsHeading",
      title: "Sidebar heading",
      description: "e.g. “Contact details”.",
      fieldset: "details",
    }),
    optionalString({
      name: "phoneRowLabel",
      title: "Phone row label",
      description: "e.g. “Phone — answered 24/7”. The number comes from Site Settings.",
      fieldset: "details",
    }),
    optionalString({
      name: "emailRowLabel",
      title: "Email row label",
      description: "The address comes from Site Settings.",
      fieldset: "details",
    }),
    optionalString({
      name: "serviceAreaRowLabel",
      title: "Service-area row label",
      description: "The area comes from Site Settings.",
      fieldset: "details",
    }),
    optionalString({
      name: "hoursRowLabel",
      title: "Hours row label",
      description: "The hours themselves are edited in Site Settings → Opening hours.",
      fieldset: "details",
    }),
    optionalString({
      name: "licenseRowLabel",
      title: "Licence row label",
      description: "The licence number comes from Site Settings.",
      fieldset: "details",
    }),

    hiddenField(),
  ],
  preview: sectionPreview("Contact form (lead capture)"),
});

export const contactSectionTypes = [contactChannels, contactForm];
