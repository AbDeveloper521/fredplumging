/**
 * Seeds the hydro jetting SERVICE document — `/services/hydro-jetting` — with
 * the eight-band stack from data/hydroJettingService.ts, VERBATIM, and creates
 * the "Hydro Jetting FAQs" set the Q&A band references.
 * Dry run:
 *   npx sanity exec scripts/seed-hydro-jetting-page.ts
 * write pass (owner runs this after reading the plan):
 *   npx sanity exec scripts/seed-hydro-jetting-page.ts -- --confirm
 *
 * ⚠️  BEFORE RUNNING --confirm: close (or hard-reload) every open Studio tab
 * showing Service Pages. A stale tab holding an old draft that presses Publish
 * afterwards will overwrite the seeded document — this exact accident happened
 * with the About page.
 *
 * Hydro jetting is a SERVICE, not a page singleton: it lives in the Services
 * collection with every other service and renders on the ordinary
 * /services/[slug] template. There is exactly ONE hydro jetting page on this
 * site, at /services/hydro-jetting. Jetting is mentioned on Drain & Sewer,
 * Specialty Services and in two FAQ sets — none of those is a rival page, and
 * the Commercial menu links to this same URL rather than to a twin.
 *
 * What it does, and ALL it can do:
 *  - CREATE path (what the audit found: no hydro jetting service exists) —
 *    creates the published `service-hydro-jetting` document with its identity
 *    fields and the stack, via createIfNotExists + patch. Creation, never
 *    replacement.
 *  - EXPAND path — if the document already exists it is PATCHED, not replaced:
 *    the stack is written, missing identity fields are filled in, and every
 *    field already set by a person (including the slug) is left exactly as it
 *    is. Published and draft get the same treatment, in one transaction.
 *  - It refuses outright on a non-empty `sections[]` — see `planFor`. Anything
 *    already in that array was put there by a person.
 *  - It refuses if a DIFFERENT service document already covers hydro jetting.
 *    Which URL is canonical, and the redirect a slug change needs, are the
 *    owner's call, not this script's.
 *
 * The "Hydro Jetting FAQs" set is created if missing; one that already has
 * questions is left completely alone. The Multi-Family and Commercial sets are
 * separate documents and are never touched. The navigation document is NEVER
 * touched either: the Services → Hydro Jetting and Commercial → Hydro Jetting
 * menu items are the owner's to add in Studio.
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no other document types, under any flag.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import {
  hydroJettingSectionsForSanity,
  HYDRO_JETTING_SLUG,
} from "../data/hydroJettingService";
import { serviceHref, services as fallbackServices } from "../data/services";
import {
  HYDRO_JETTING_FAQ_SET,
  HYDRO_JETTING_FAQ_SET_ID,
  UNCONFIRMED_COMMITMENTS,
  UNSPECIFIED_EQUIPMENT,
} from "../data/faqSets";

type Raw = Record<string, unknown>;

const DOC_ID = `service-${HYDRO_JETTING_SLUG}`;
const DRAFT_ID = `drafts.${DOC_ID}`;
const PATH = serviceHref(HYDRO_JETTING_SLUG);

/** Where the card sits in the services grid; nudged if 70 is taken. */
const PREFERRED_ORDER = 70;

/** Every field the `service` schema defines. Anything else stops the script. */
const KNOWN_SERVICE_FIELDS = [
  "title",
  "shortDescription",
  "sections",
  "body",
  "photo",
  "icon",
  "featured",
  "order",
  "slug",
  "seoTitle",
  "seoDescription",
];

/**
 * The service's identity fields, taken from the fallback in data/services.ts
 * so the published document and the fallback say the same thing. `sections`
 * and `slug` are handled separately — the stack is written through the shared
 * Sanity translation, and the slug is locked in the Studio once set.
 */
function identityFields(): Raw {
  const fallback = fallbackServices.find((s) => s.slug === HYDRO_JETTING_SLUG);
  if (!fallback) {
    throw new Error(
      `data/services.ts has no "${HYDRO_JETTING_SLUG}" entry — the fallback and ` +
        "the seeder must describe the same service.",
    );
  }
  return {
    title: fallback.title,
    shortDescription: fallback.shortDescription,
    icon: fallback.icon,
    featured: false,
    ...(fallback.seoTitle ? { seoTitle: fallback.seoTitle } : {}),
    ...(fallback.seoDescription
      ? { seoDescription: fallback.seoDescription }
      : {}),
  };
}

/**
 * The stack in Sanity shape: nested card/item rows keyed, and the Q&A band
 * written as a REFERENCE to the shared set rather than a copy of its
 * questions — the fallback in data/ carries them inline because there is
 * nothing to dereference when Sanity is unreachable.
 */
const preparedSections = (): Raw[] => hydroJettingSectionsForSanity();

/** The FAQ set document, with _type/_key on every question. */
function faqSetDocument(): Raw {
  return {
    _id: HYDRO_JETTING_FAQ_SET_ID,
    _type: "faqSet",
    title: HYDRO_JETTING_FAQ_SET.title,
    ...(HYDRO_JETTING_FAQ_SET.heading
      ? { heading: HYDRO_JETTING_FAQ_SET.heading }
      : {}),
    ...(HYDRO_JETTING_FAQ_SET.intro
      ? { intro: HYDRO_JETTING_FAQ_SET.intro }
      : {}),
    items: HYDRO_JETTING_FAQ_SET.items.map((item) => ({
      _type: "faqItem",
      _key: item._key,
      question: item.question,
      answer: item.answer,
    })),
  };
}

interface Plan {
  id: string;
  /** True when this document must be created before it can be patched. */
  create: boolean;
  /** Identity fields missing on this document, which will be filled in. */
  fill: string[];
  /** Identity fields already set by a person, which are left alone. */
  keep: string[];
}

/** Validates one existing document and returns its plan, or null to stop. */
function planFor(id: string, doc: Raw): Plan | null {
  const sections = doc.sections;
  if (Array.isArray(sections) && sections.length > 0) {
    console.error(
      `STOP: ${id} already has a non-empty sections array ` +
        `(${sections.length} item(s)) — so it is content someone built, and ` +
        "this script will not overwrite it. To add the hydro jetting bands to " +
        "that service, add them in /studio (Service Pages → Hydro Jetting), " +
        "or empty the section list there first and re-run this. Nothing was " +
        "changed.",
    );
    return null;
  }

  const unexpected = Object.keys(doc).filter(
    (key) => !key.startsWith("_") && !KNOWN_SERVICE_FIELDS.includes(key),
  );
  if (unexpected.length > 0) {
    console.error(
      `STOP: ${id} carries unexpected field(s): ${unexpected.join(", ")}. ` +
        "The document is not in the assumed shape — inspect it in /studio " +
        "first. Nothing was changed.",
    );
    return null;
  }

  const wanted = identityFields();
  const fill = Object.keys(wanted).filter(
    (field) => doc[field] === undefined || doc[field] === null,
  );
  const keep = Object.keys(wanted).filter((field) => !fill.includes(field));

  console.log(
    `${id}: exists; sections is ${Array.isArray(sections) ? "empty" : "absent"} — ` +
      "the stack will be written." +
      (fill.length ? ` Missing field(s) filled in: ${fill.join(", ")}.` : "") +
      (keep.length ? ` Left as-is (already set): ${keep.join(", ")}.` : ""),
  );
  if (doc.body !== undefined && doc.body !== null) {
    console.log(
      `  note: ${id} also has “Page content” (body) prose. It is NOT deleted, ` +
        "but once the section list has sections the template renders those " +
        "instead and the body is ignored.",
    );
  }
  return { id, create: false, fill, keep };
}

async function main() {
  const confirm = process.argv.includes("--confirm");

  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (confirm && !writeToken) {
    console.error("SANITY_API_WRITE_TOKEN is not set (Editor scope, .env.local).");
    process.exit(1);
  }
  // Writing needs the Editor token; the dry run only reads, so it settles for
  // the read token (or CLI login) and still prints the full plan.
  const token = writeToken ?? process.env.SANITY_API_READ_TOKEN;
  const client = getCliClient({ apiVersion: "2026-07-01" }).withConfig({
    ...(token ? { token } : {}),
    useCdn: false,
  });
  const { projectId, dataset } = client.config();
  console.log(
    `${confirm ? "WRITE PASS" : "DRY RUN"} against ${projectId}/${dataset}\n`,
  );
  console.log(
    "⚠️  Close or hard-reload any open Studio tab showing Service Pages " +
      "before --confirm — a stale tab pressing Publish afterwards overwrites " +
      "the seeded document (this happened with the About page).\n",
  );

  // Audit guard: exactly one page on this site is about hydro jetting. If
  // another service document already covers it at a different address,
  // seeding this one would put two pages about the same service on one site,
  // competing for the same ranking — stop and let a human decide.
  const rivals = await client.fetch<Array<{ _id: string; slug: string | null }>>(
    `*[_type == "service" && _id != $id && !(_id in path("drafts.**")) &&
       (slug.current match "*jet*" || title match "*jet*")]{_id, "slug": slug.current}`,
    { id: DOC_ID },
  );
  if (rivals.length > 0) {
    console.error(
      "STOP: another hydro-jetting SERVICE document already exists — " +
        rivals.map((r) => `${r._id} (/services/${r.slug})`).join(", ") +
        `.\nSeeding ${PATH} as well would put two hydro jetting pages on one ` +
        "site. Expand the existing document instead, or decide which URL is " +
        "canonical first — moving one needs a redirect, which is the owner's " +
        "call, not this script's. Nothing was changed.",
    );
    process.exit(1);
  }

  const [doc, draft] = await Promise.all([
    client.fetch<Raw | null>(`*[_id == $id][0]`, { id: DOC_ID }),
    client.fetch<Raw | null>(`*[_id == $id][0]`, { id: DRAFT_ID }),
  ]);

  // Keep the card out of an occupied slot in the services grid.
  const takenOrders = await client.fetch<number[]>(
    `*[_type == "service" && _id != $id && defined(order)].order`,
    { id: DOC_ID },
  );
  const order = takenOrders.includes(PREFERRED_ORDER)
    ? Math.max(...takenOrders) + 10
    : PREFERRED_ORDER;

  const plans: Plan[] = [];
  if (!doc && !draft) {
    console.log(
      `No ${DOC_ID} document exists (published or draft) — the published ` +
        "service will be CREATED and seeded. (Alternative without this " +
        "script: add a Service in /studio by hand, set its web address to " +
        `“${HYDRO_JETTING_SLUG}”, build all ${preparedSections().length} ` +
        "bands, and create the “Hydro Jetting FAQs” set under FAQ Sets " +
        "yourself, or the Q&A band points at nothing.)",
    );
    plans.push({ id: DOC_ID, create: true, fill: Object.keys(identityFields()), keep: [] });
  } else {
    for (const [id, source] of [
      [DOC_ID, doc],
      [DRAFT_ID, draft],
    ] as const) {
      if (!source) continue;
      const plan = planFor(id, source);
      if (!plan) process.exit(1);
      plans.push(plan);
    }
  }

  // The FAQ set the Q&A band points at. An existing set WITH questions is
  // the owner's and is left completely alone.
  const [faqDoc, faqDraft] = await Promise.all([
    client.fetch<Raw | null>(`*[_id == $id][0]`, { id: HYDRO_JETTING_FAQ_SET_ID }),
    client.fetch<Raw | null>(`*[_id == $id][0]`, {
      id: `drafts.${HYDRO_JETTING_FAQ_SET_ID}`,
    }),
  ]);
  const itemCount = (d: Raw | null) => (d && Array.isArray(d.items) ? d.items.length : 0);
  const faqSetHasContent = itemCount(faqDoc) > 0 || itemCount(faqDraft) > 0;

  console.log("\nFAQ set:");
  if (faqSetHasContent) {
    console.log(
      `  • ${HYDRO_JETTING_FAQ_SET_ID} already exists with ` +
        `${Math.max(itemCount(faqDoc), itemCount(faqDraft))} question(s) — LEFT ` +
        "UNTOUCHED. The Q&A band will show whatever is published there; edit " +
        "it in /studio under FAQ Sets.",
    );
  } else {
    console.log(
      `  • ${HYDRO_JETTING_FAQ_SET_ID} ${faqDoc || faqDraft ? "exists but has no questions" : "does not exist"} — ` +
        `the ${HYDRO_JETTING_FAQ_SET.items.length} “${HYDRO_JETTING_FAQ_SET.title}” questions will be written:`,
    );
    HYDRO_JETTING_FAQ_SET.items.forEach((item, i) =>
      console.log(`      ${i + 1}. ${item.question}`),
    );
  }
  console.log(
    "  • The Multi-Family and Commercial sets are SEPARATE documents and are " +
      "not touched.",
  );

  const identity = identityFields();
  console.log(`\nService document (${PATH}):`);
  console.log(`  • _id ${DOC_ID}, web address “${HYDRO_JETTING_SLUG}”`);
  for (const [field, value] of Object.entries(identity)) {
    console.log(`  • ${field}: ${JSON.stringify(value)}`);
  }
  console.log(
    `  • order: ${order}${order === PREFERRED_ORDER ? "" : ` (${PREFERRED_ORDER} was taken)`} — ` +
      "where its card sits in the services grid.",
  );

  const sections = preparedSections();
  console.log(`\nSections to seed, in order (photo slots stay empty):`);
  sections.forEach((section, i) => {
    const fields = Object.keys(section).filter((key) => !key.startsWith("_"));
    const detail =
      section._type === "faqBand"
        ? ` — references ${HYDRO_JETTING_FAQ_SET_ID} (not a copy of the questions)`
        : ` — ${fields.join(", ")}`;
    console.log(`  ${i + 1}. ${section._type} (_key: ${section._key})${detail}`);
  });
  console.log(
    "  + the badge strip and the map band, which the service template closes " +
      "every service page with — not part of the stack.",
  );
  console.log(
    `\nTargets: ${plans
      .map((plan) => `${plan.id}${plan.create ? " (will be created)" : ""}`)
      .join(", ")}`,
  );

  console.log(
    "\nConfirm with the client before this page goes live — a service " +
      "commitment, not a description:",
  );
  for (const item of UNCONFIRMED_COMMITMENTS) {
    console.log(`  • ${item.commitment} (${item.where})\n    ${item.confirmWithClient}`);
  }
  console.log("\nDeliberately NOT published on this page:");
  for (const item of UNSPECIFIED_EQUIPMENT) {
    console.log(`  • ${item.spec}\n    ${item.askTheClient}`);
  }

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/seed-hydro-jetting-page.ts -- --confirm",
    );
    return;
  }

  // One transaction. These are the only writes in the script, and they target
  // only the hydro jetting service ids and the hydro jetting FAQ set.
  let transaction = client.transaction();

  if (!faqSetHasContent) {
    // createIfNotExists then patch, so an existing-but-empty set is filled
    // rather than replaced.
    const set = faqSetDocument();
    transaction = transaction.createIfNotExists({
      _id: HYDRO_JETTING_FAQ_SET_ID,
      _type: "faqSet",
    });
    transaction = transaction.patch(HYDRO_JETTING_FAQ_SET_ID, (patch) =>
      patch.set({
        title: set.title,
        ...(set.heading ? { heading: set.heading } : {}),
        ...(set.intro ? { intro: set.intro } : {}),
        items: set.items,
      }),
    );
  }

  for (const plan of plans) {
    if (plan.create) {
      transaction = transaction.createIfNotExists({
        _id: DOC_ID,
        _type: "service",
      });
    }
    transaction = transaction.patch(plan.id, (patch) =>
      patch
        // Fields a person has already set — including the slug, which the
        // Studio locks once it exists — are only supplied if missing.
        .setIfMissing({
          ...identity,
          order,
          slug: { _type: "slug", current: HYDRO_JETTING_SLUG },
        })
        .set({ sections }),
    );
  }
  await transaction.commit();

  console.log(
    `\nDone. ${plans.map((plan) => plan.id).join(" and ")} now carr${plans.length === 1 ? "ies" : "y"} ` +
      `the ${sections.length}-band ${PATH} stack` +
      (faqSetHasContent ? "" : `, and “${HYDRO_JETTING_FAQ_SET.title}” exists under FAQ Sets`) +
      ". Hard-reload /studio (Service Pages → Hydro Jetting shows the section " +
      `list, no 'Unknown fields found') and reload ${PATH} — every band should ` +
      "render, with the Q&A band reading from the shared set, and the card " +
      "should appear in the /services grid. Then add the banner and collage " +
      "photos in Studio, and the nav links: under Navigation Menu → Services " +
      `add “Hydro Jetting” → “${PATH}”, and under Commercial add the same ` +
      "title and the SAME address. One page, two menus — that is intended.",
  );
}

main().catch((error) => {
  console.error("seed-hydro-jetting-page failed:", error);
  process.exit(1);
});
