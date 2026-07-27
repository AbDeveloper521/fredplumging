/**
 * Seed script — run with:  npm run seed -- --confirm
 *
 * Creates published Sanity documents from every data/*.ts fallback constant,
 * so the CMS starts in exact agreement with the fallbacks and
 * `npm run check:drift` is silent from day one.
 *
 * Safety:
 *  - Requires the explicit `--confirm` flag before writing anything.
 *  - Refuses to run against a dataset that already contains any of our
 *    document types unless `--force` is ALSO passed (protects real client
 *    edits from being overwritten by a stray run).
 *  - Idempotent: deterministic document IDs mean re-running updates the same
 *    documents instead of duplicating them.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (an "Editor" token — Viewer cannot
 * write). Create it at sanity.io/manage → API → Tokens. It is read ONLY by
 * scripts/, never by application code.
 */
import { getCliClient } from "sanity/cli";
import { site, serviceAreaCities } from "../data/site";
import {
  STATIC_NAVIGATION,
  STATIC_FOOTER_NAVIGATION,
  STATIC_TRUST_LOGOS,
} from "../data/navigation";
import { faqs } from "../data/faqs";
import { testimonials } from "../data/testimonials";
import { services } from "../data/services";
import { industries } from "../data/industries";

const DOC_TYPES = [
  "siteSettings",
  "navigation",
  "faq",
  "testimonial",
  "service",
  "industry",
  "trustLogo",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Short placeholder Portable Text body so the rich rendering is visible. */
function placeholderBody(title: string) {
  return [
    {
      _type: "block",
      _key: "seed-h2",
      style: "h2",
      markDefs: [],
      children: [
        { _type: "span", _key: "seed-h2-span", text: `About ${title}`, marks: [] },
      ],
    },
    {
      _type: "block",
      _key: "seed-p",
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: "seed-p-span",
          text: `This is placeholder content. Replace it in the Studio with real copy about ${title.toLowerCase()} — what's included, how scheduling works, and why property managers choose us.`,
          marks: [],
        },
      ],
    },
    {
      _type: "callout",
      _key: "seed-callout",
      heading: "Need help right away?",
      text: "A live dispatcher answers around the clock — describe the problem and we'll get a technician moving.",
      showPhoneButton: true,
    },
  ];
}

async function main() {
  const args = process.argv.slice(2);
  const confirmed = args.includes("--confirm");
  const forced = args.includes("--force");

  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!writeToken) {
    console.error(
      "✗ SANITY_API_WRITE_TOKEN is not set. Create an *Editor* token at\n" +
        "  sanity.io/manage → API → Tokens and add it to .env.local.\n" +
        "  (Do NOT reuse SANITY_API_READ_TOKEN — it is Viewer-scope and cannot write.)",
    );
    process.exit(1);
  }

  const client = getCliClient({ apiVersion: "2026-07-01" }).withConfig({
    token: writeToken,
    useCdn: false,
  });
  const { projectId, dataset } = client.config();

  if (!confirmed) {
    console.log(
      `This would seed project "${projectId}", dataset "${dataset}" with:\n` +
        `  1 siteSettings, 1 navigation (incl. footer), ${services.length} services,\n` +
        `  ${industries.length} industries, ${faqs.length} FAQs, ${testimonials.length} testimonials, ${STATIC_TRUST_LOGOS.length} trust logos.\n\n` +
        `Nothing was written. Re-run with:  npm run seed -- --confirm`,
    );
    return;
  }

  const existing = await client.fetch<number>(
    `count(*[_type in $types])`,
    { types: DOC_TYPES },
  );
  if (existing > 0 && !forced) {
    console.error(
      `✗ Refusing to seed: dataset "${dataset}" already contains ${existing} document(s)\n` +
        `  of the types this script writes. Re-running would OVERWRITE any edits made\n` +
        `  in the Studio. If you are certain, re-run with:  npm run seed -- --confirm --force`,
    );
    process.exit(1);
  }

  const tx = client.transaction();

  tx.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    ...site,
    serviceAreaCities: [...serviceAreaCities],
  });

  tx.createOrReplace({
    _id: "navigation",
    _type: "navigation",
    items: STATIC_NAVIGATION.items.map((group) => ({
      _type: "navGroup",
      _key: group._key,
      label: group.label,
      href: group.href,
      layout: group.layout,
      showServiceAreaCities: group.showServiceAreaCities ?? false,
      children: group.children.map((child) => ({
        _type: "navLink",
        _key: child._key,
        label: child.label,
        href: child.href,
        ...(child.description ? { description: child.description } : {}),
        ...(child.icon ? { icon: child.icon } : {}),
      })),
    })),
    cta: { ...STATIC_NAVIGATION.cta },
    footerColumns: STATIC_FOOTER_NAVIGATION.columns.map((column) => ({
      _type: "footerColumn",
      _key: column._key,
      heading: column.heading,
      links: column.links.map((link) => ({
        _type: "footerLink",
        _key: link._key,
        label: link.label,
        href: link.href,
      })),
    })),
    legalLinks: STATIC_FOOTER_NAVIGATION.legal.map((link) => ({
      _type: "footerLink",
      _key: link._key,
      label: link.label,
      href: link.href,
    })),
  });

  services.forEach((service, i) => {
    tx.createOrReplace({
      _id: `service-${service.slug}`,
      _type: "service",
      title: service.title,
      slug: { _type: "slug", current: service.slug },
      shortDescription: service.shortDescription,
      icon: service.icon,
      featured: service.featured ?? false,
      order: (i + 1) * 10,
      body: placeholderBody(service.title),
    });
  });

  industries.forEach((industry, i) => {
    tx.createOrReplace({
      _id: `industry-${industry.slug}`,
      _type: "industry",
      title: industry.title,
      slug: { _type: "slug", current: industry.slug },
      description: industry.description,
      bulletPoints: [...industry.bulletPoints],
      order: (i + 1) * 10,
      body: placeholderBody(industry.title),
    });
  });

  faqs.forEach((faq, i) => {
    tx.createOrReplace({
      _id: `faq-${(i + 1) * 10}`,
      _type: "faq",
      question: faq.question,
      answer: faq.answer,
      order: (i + 1) * 10,
    });
  });

  testimonials.forEach((testimonial, i) => {
    tx.createOrReplace({
      _id: `testimonial-${slugify(testimonial.name)}`,
      _type: "testimonial",
      name: testimonial.name,
      ...(testimonial.role ? { role: testimonial.role } : {}),
      rating: testimonial.rating,
      quote: testimonial.quote,
      date: testimonial.date,
      featured: testimonial.featured ?? false,
      order: (i + 1) * 10,
    });
  });

  STATIC_TRUST_LOGOS.forEach((logo, i) => {
    tx.createOrReplace({
      _id: `trustLogo-${slugify(logo.name)}`,
      _type: "trustLogo",
      name: logo.name,
      order: (i + 1) * 10,
    });
  });

  await tx.commit();

  console.log(
    `✓ Seeded project "${projectId}", dataset "${dataset}":\n` +
      `  1 siteSettings, 1 navigation (header + footer + legal),\n` +
      `  ${services.length} services, ${industries.length} industries, ${faqs.length} FAQs,\n` +
      `  ${testimonials.length} testimonials, ${STATIC_TRUST_LOGOS.length} trust logos.\n\n` +
      `  ⚠ Images were NOT seeded — no image assets exist yet. Upload photos and\n` +
      `    logos through the Studio (/studio); each image field requires alt text.\n\n` +
      `  Next: npm run check:drift   (should print all ✓, no drift)`,
  );
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
