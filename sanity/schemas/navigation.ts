import { defineArrayMember, defineField, defineType } from "sanity";
import type { NavIconName } from "@/data/navigation";

/** Friendly names for the icon picker — values must stay in NAV_ICON_NAMES. */
const ICON_CHOICES: Array<{ title: string; value: NavIconName }> = [
  { title: "Wrench (general plumbing)", value: "wrench" },
  { title: "Gear (specialty services)", value: "cog" },
  { title: "Siren (emergency)", value: "siren" },
  { title: "Waves (drain & sewer)", value: "waves" },
  { title: "Calendar check (maintenance)", value: "calendar-check" },
  { title: "Office building (commercial)", value: "building-2" },
  { title: "Heart pulse (senior care)", value: "heart-pulse" },
  { title: "Graduation cap (student housing)", value: "graduation-cap" },
  { title: "Apartment building", value: "building" },
  { title: "Condo / hotel building", value: "hotel" },
  { title: "Caring hands (assisted living)", value: "heart-handshake" },
  { title: "Stethoscope (nursing homes)", value: "stethoscope" },
  { title: "Map pin (locations)", value: "map-pin" },
];

const navLink = defineArrayMember({
  name: "navLink",
  title: "Menu link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Link text",
      description:
        "The words visitors click, e.g. “Emergency Plumbing”. Appears in the dropdown menu and the mobile menu.",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .error("Every menu link needs text — without it the link is invisible."),
    }),
    defineField({
      name: "href",
      title: "Page address",
      description:
        "Where the link goes, starting with a slash — e.g. /services/plumbing. Ask your developer before changing these: the page must exist.",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .error("A link with no address goes nowhere and breaks the menu.")
          .custom((value) => slashPathOrEmpty(value, "/services/plumbing")),
    }),
    defineField({
      name: "description",
      title: "Short description",
      description:
        "One line shown under the link in the large dropdown panels and the mobile menu, e.g. “24/7 response across the Metroplex.” Optional.",
      type: "string",
      validation: (rule) =>
        rule
          .max(80)
          .error("Keep descriptions under 80 characters so they fit on one line."),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      description:
        "Small picture shown next to the link in the large dropdown panels. Optional — leave empty for plain lists.",
      type: "string",
      options: { list: ICON_CHOICES },
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});

/**
 * True when a menu item actually carries dropdown links. A menu item is one of
 * two shapes, and this is the switch between them:
 *   - no children → a plain top-level link straight to `href`
 *   - one or more children → a dropdown, each child with its own `href`
 * Both the conditional validation and the dropdown-only fields read it, so the
 * Studio form and the rendered nav agree on which shape an item is in.
 */
function hasDropdownItems(parent: unknown): boolean {
  const children = (parent as { children?: unknown } | undefined)?.children;
  return Array.isArray(children) && children.length > 0;
}

/** Shared slash check — empty passes, because `href` is only sometimes required. */
function slashPathOrEmpty(value: string | undefined, example: string) {
  if (!value) return true;
  return value.startsWith("/") ? true : `Must start with a slash, e.g. ${example}.`;
}

const navGroup = defineArrayMember({
  name: "navGroup",
  title: "Menu item",
  type: "object",
  groups: [{ name: "advanced", title: "Advanced" }],
  fields: [
    defineField({
      name: "label",
      title: "Menu name",
      description:
        "The word in the top navigation bar, e.g. “Services”. Keep it to one or two words so the bar fits on screen.",
      type: "string",
      validation: (rule) =>
        rule.required().error("A menu item with no name can't be shown."),
    }),
    defineField({
      name: "href",
      title: "Page address",
      description:
        "The page that opens when someone clicks the menu name, starting with a slash — e.g. /commercial. Required for a plain link. If this menu has dropdown links you may still fill it in (the name stays clickable and the dropdown still opens), or leave it empty to make the name open the dropdown only.",
      type: "string",
      validation: (rule) =>
        rule.custom((value) => slashPathOrEmpty(value, "/commercial")),
    }),
    defineField({
      name: "children",
      title: "Links in this menu",
      description:
        "The links inside the dropdown. Drag to reorder — the order here is the order on the site. Leave this empty for a plain top-level link that goes straight to the page address above.",
      type: "array",
      of: [navLink],
    }),
    defineField({
      name: "layout",
      title: "Dropdown style",
      description:
        "“Large panel” shows links in columns with icons and descriptions (best for 4+ links). “Simple list” is a compact single column.",
      type: "string",
      options: {
        list: [
          { title: "Large panel with icons", value: "mega" },
          { title: "Simple list", value: "list" },
        ],
        layout: "radio",
      },
      initialValue: "list",
      // Meaningless without a dropdown — and hidden fields must never be
      // required, or publish blocks on something the owner can't even see.
      hidden: ({ parent }) => !hasDropdownItems(parent),
      validation: (rule) =>
        rule.custom((value, context) =>
          !hasDropdownItems(context.parent) || value
            ? true
            : "Pick a dropdown style so the menu knows how to draw itself.",
        ),
    }),
    defineField({
      name: "showServiceAreaCities",
      title: "Show the city list",
      description:
        "Adds the “Cities we cover” list (from Site Settings) at the bottom of this dropdown. Used by “Areas We Serve”. Technical — leave as is unless your developer says otherwise.",
      type: "boolean",
      initialValue: false,
      group: "advanced",
      hidden: ({ parent }) => !hasDropdownItems(parent),
    }),
  ],
  /**
   * The either/or rule, checked on the whole item because it reads two sibling
   * fields: a menu item is valid with an address and no dropdown links (plain
   * link), or with dropdown links and an optional address (dropdown). Only the
   * item with neither is rejected — it would have nowhere to go.
   */
  validation: (rule) =>
    rule.custom((value) => {
      const href = typeof (value as { href?: unknown })?.href === "string"
        ? ((value as { href: string }).href).trim()
        : "";
      if (href || hasDropdownItems(value)) return true;
      return {
        message:
          "This menu item has nowhere to go. Either fill in “Page address” to make it a " +
          "plain link, or add at least one link under “Links in this menu” to make it a dropdown.",
        paths: [["href"]],
      };
    }),
  preview: {
    select: { title: "label", href: "href", children: "children" },
    prepare: ({ title, href, children }) => {
      const count = Array.isArray(children) ? children.length : 0;
      return {
        title: title ?? "Untitled menu item",
        // The two states, told apart at a glance in the collapsed list.
        subtitle:
          count > 0
            ? `Dropdown · ${count} item${count === 1 ? "" : "s"}${href ? ` → ${href}` : ""}`
            : href
              ? `Plain link → ${href}`
              : "⚠ No page address and no dropdown items",
      };
    },
  },
});

/**
 * Singleton mirroring `data/navigation.ts` exactly (`_key` on array members
 * comes free — Sanity adds it to every array item).
 */
const footerLink = defineArrayMember({
  name: "footerLink",
  title: "Footer link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Link text",
      description: "The words visitors click.",
      type: "string",
      validation: (rule) =>
        rule.required().error("Every footer link needs text."),
    }),
    defineField({
      name: "href",
      title: "Page address",
      description: "Where the link goes, starting with a slash — e.g. /services/plumbing.",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .error("A link with no address goes nowhere.")
          .custom((value) =>
            value?.startsWith("/")
              ? true
              : "Must start with a slash, e.g. /contact.",
          ),
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

export const navigation = defineType({
  name: "navigation",
  title: "Navigation Menu",
  type: "document",
  groups: [
    { name: "header", title: "Header menu", default: true },
    { name: "footer", title: "Footer links" },
  ],
  fields: [
    defineField({
      name: "items",
      title: "Menu items",
      description:
        "The items in the site header, left to right. Drag to reorder. An item with links inside it opens a dropdown; an item with no links is a plain link straight to its page address.",
      type: "array",
      group: "header",
      of: [navGroup],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .error("The site header needs at least one menu item.")
          .max(6)
          .error("More than 6 items won't fit in the header bar."),
    }),
    defineField({
      name: "cta",
      title: "Header button",
      description:
        "The red button on the right side of the header (currently “Request Service”). Shown on every page.",
      type: "object",
      group: "header",
      fields: [
        defineField({
          name: "label",
          title: "Button text",
          description: "Keep it short — two or three words.",
          type: "string",
          validation: (rule) =>
            rule.required().error("The header button needs text."),
        }),
        defineField({
          name: "href",
          title: "Page address",
          description: "Where the button goes, e.g. /contact.",
          type: "string",
          validation: (rule) =>
            rule
              .required()
              .error("The header button needs a page to link to.")
              .custom((value) =>
                value?.startsWith("/")
                  ? true
                  : "Must start with a slash, e.g. /contact.",
              ),
        }),
      ],
      validation: (rule) =>
        rule.required().error("The header always shows this button — it can't be empty."),
    }),
    defineField({
      name: "footerColumns",
      title: "Footer link columns",
      description:
        "The link columns at the bottom of every page (currently Services, Industries, Company). Drag to reorder columns and links.",
      type: "array",
      group: "footer",
      of: [
        defineArrayMember({
          name: "footerColumn",
          title: "Footer column",
          type: "object",
          fields: [
            defineField({
              name: "heading",
              title: "Column heading",
              description: "The heading above this column of links, e.g. “Services”.",
              type: "string",
              validation: (rule) =>
                rule.required().error("Each footer column needs a heading."),
            }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              of: [footerLink],
              validation: (rule) =>
                rule
                  .required()
                  .min(1)
                  .error("A footer column with no links would render an empty heading."),
            }),
          ],
          preview: {
            select: { title: "heading", links: "links" },
            prepare: ({ title, links }) => ({
              title: title ?? "Untitled column",
              subtitle: Array.isArray(links)
                ? `${links.length} link${links.length === 1 ? "" : "s"}`
                : "No links yet",
            }),
          },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .error("The footer needs at least one link column.")
          .max(4)
          .error("More than 4 columns won't fit the footer layout."),
    }),
    defineField({
      name: "legalLinks",
      title: "Legal links",
      description:
        "The small links in the very bottom bar (Privacy Policy, Terms of Service, Accessibility).",
      type: "array",
      group: "footer",
      of: [footerLink],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .error("The bottom bar needs at least one legal link."),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Navigation Menu" }),
  },
});
