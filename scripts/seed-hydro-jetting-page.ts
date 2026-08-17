/**
 * Seeds the `hydroJettingPage` document's `sections[]` with the
 * /commercial/hydro-jetting stack from data/hydroJettingPage.ts, VERBATIM, and
 * creates the "Hydro Jetting FAQs" set the Q&A band references.
 * Dry run:
 *   sanity exec scripts/seed-hydro-jetting-page.ts
 * write pass (owner runs this after reading the plan):
 *   sanity exec scripts/seed-hydro-jetting-page.ts -- --confirm
 *
 * ⚠️  BEFORE RUNNING --confirm: close (or hard-reload) every open Studio tab
 * showing Hydro Jetting Page. A stale tab holding an old draft that presses
 * Publish afterwards will overwrite the seeded document — this exact accident
 * happened with the About page.
 *
 * What it does, and ALL it can do:
 *  - Patches `hydroJettingPage`, and `drafts.hydroJettingPage` when a draft
 *    exists — same treatment, one transaction. When NO document exists at all
 *    it uses createIfNotExists({_id: "hydroJettingPage", _type:
 *    "hydroJettingPage"}) and then seeds it — creation, never replacement.
 *  - This page is NEW (the audit found no hydro jetting page anywhere on the
 *    site: no route, no service document, no sitemap entry), so this is a
 *    first seed rather than an expansion of an existing page. It has no old
 *    fixed-field shape and no leftover fields are expected; if a target
 *    document carries ANY unexpected field the script stops and reports rather
 *    than guessing.
 *  - It refuses outright on a non-empty `sections[]` — see `planFor`. There is
 *    no shipped-placeholder exception here, because this page never shipped a
 *    placeholder: anything already in that array was put there by a person.
 *
 * The "Hydro Jetting FAQs" set is created if missing; one that already has
 * questions is left completely alone. The Multi-Family and Commercial sets are
 * separate documents and are never touched. The navigation document is NEVER
 * touched either: the Commercial → Hydro Jetting menu item is the owner's to
 * add in Studio.
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no other document types, under any flag.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import {
  hydroJettingSectionsForSanity,
  HYDRO_JETTING_PATH,
} from "../data/hydroJettingPage";
import {
  HYDRO_JETTING_FAQ_SET,
  HYDRO_JETTING_FAQ_SET_ID,
  UNCONFIRMED_COMMITMENTS,
  UNSPECIFIED_EQUIPMENT,
} from "../data/faqSets";

type Raw = Record<string, unknown>;

const PAGE_ID = "hydroJettingPage";
const DRAFT_ID = `drafts.${PAGE_ID}`;

/** Old fields this script may unset — none exist for this page. */
const LEFTOVER_FIELDS: string[] = [];

/**
 * The stack in Sanity shape. Shared with the Studio prefill (`initialValue` in
 * sanity/schemas/hydroJettingPage.ts) so a document created either way is
 * identical: nested card/item rows keyed, and the Q&A band written as a
 * REFERENCE to the shared set rather than a copy of its questions — the
 * fallback in data/ carries them inline because there is nothing to
 * dereference when Sanity is unreachable.
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

/**
 * Collects every piece of real content inside a value: non-empty text on any
 * non-underscore path, and image asset references. Empty scaffolding does
 * not count.
 */
function findContent(value: unknown, path: string, out: string[]): void {
  if (typeof value === "string") {
    if (value.trim() !== "") out.push(`${path} = ${JSON.stringify(value.slice(0, 80))}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, i) => findContent(entry, `${path}[${i}]`, out));
    return;
  }
  if (value && typeof value === "object") {
    const asset = (value as Raw).asset as Raw | undefined;
    if (asset && typeof asset === "object" && typeof asset._ref === "string") {
      out.push(`${path}.asset._ref = ${asset._ref}`);
    }
    for (const [key, inner] of Object.entries(value as Raw)) {
      if (key.startsWith("_")) continue;
      findContent(inner, `${path}.${key}`, out);
    }
  }
}

interface Plan {
  id: string;
  /** Leftover fields actually present on this document (to unset). */
  unset: string[];
  /** True when the published document must be created first. */
  create: boolean;
}

/** Validates one existing document and returns its plan, or null to stop. */
function planFor(id: string, doc: Raw): Plan | null {
  const sections = doc.sections;
  if (Array.isArray(sections) && sections.length > 0) {
    console.error(
      `STOP: ${id} already has a non-empty sections array ` +
        `(${sections.length} item(s)) — so it is content someone built, and ` +
        "this script will not overwrite it. To add the hydro jetting bands to " +
        "that page, add them in /studio (Hydro Jetting Page), or empty the " +
        "sections list there first and re-run this. Nothing was changed.",
    );
    return null;
  }

  const fields = Object.keys(doc).filter((key) => !key.startsWith("_"));
  const unexpected = fields.filter(
    (field) => field !== "sections" && !LEFTOVER_FIELDS.includes(field),
  );
  if (unexpected.length > 0) {
    console.error(
      `STOP: ${id} carries unexpected field(s): ${unexpected.join(", ")}. ` +
        "The document is not in the assumed shape — inspect it in /studio " +
        "first. Nothing was changed.",
    );
    return null;
  }

  const present = LEFTOVER_FIELDS.filter(
    (field) => doc[field] !== undefined && doc[field] !== null,
  );
  const content: string[] = [];
  for (const field of present) findContent(doc[field], `${id}.${field}`, content);
  if (content.length > 0) {
    console.error(
      `STOP: leftover fields on ${id} still contain real content — ` +
        "unsetting them would discard it:\n" +
        content.map((line) => `  - ${line}`).join("\n") +
        "\nNothing was changed.",
    );
    return null;
  }

  console.log(
    `${id}: sections is ${Array.isArray(sections) ? "empty" : "absent"}; ` +
      (present.length
        ? `leftover fields verified empty of content, will unset: ${present.join(", ")}`
        : "no leftover fields present"),
  );
  return { id, unset: present, create: false };
}

async function main() {
  const confirm = process.argv.includes("--confirm");

  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (confirm && !writeToken) {
    console.error("SANITY_API_WRITE_TOKEN is not set (Editor scope, .env.local).");
    process.exit(1);
  }
  const client = getCliClient({ apiVersion: "2026-07-01" }).withConfig({
    ...(writeToken ? { token: writeToken } : {}),
    useCdn: false,
  });
  const { projectId, dataset } = client.config();
  console.log(
    `${confirm ? "WRITE PASS" : "DRY RUN"} against ${projectId}/${dataset}\n`,
  );
  console.log(
    "⚠️  Close or hard-reload any open Studio tab showing Hydro Jetting Page " +
      "before --confirm — a stale tab pressing Publish afterwards overwrites " +
      "the seeded document (this happened with the About page).\n",
  );

  // Audit guard: this page exists exactly once on the site. If a hydro jetting
  // SERVICE document has appeared since, seeding a second page about the same
  // service would split its ranking — stop and let a human decide.
  const rivals = await client.fetch<Array<{ _id: string; slug: string | null }>>(
    `*[_type == "service" && (slug.current match "*jet*" || title match "*Jet*")]{_id, "slug": slug.current}`,
  );
  if (rivals.length > 0) {
    console.error(
      "STOP: a hydro-jetting SERVICE document now exists in Sanity — " +
        rivals.map((r) => `${r._id} (/services/${r.slug})`).join(", ") +
        `.\nSeeding ${HYDRO_JETTING_PATH} as well would put two hydro jetting ` +
        "pages on one site, competing for the same search ranking. Decide " +
        "which URL is canonical first (moving one needs a 301 redirect — the " +
        "owner's call, not this script's). Nothing was changed.",
    );
    process.exit(1);
  }

  const [doc, draft] = await Promise.all([
    client.fetch<Raw | null>(`*[_id == $id][0]`, { id: PAGE_ID }),
    client.fetch<Raw | null>(`*[_id == $id][0]`, { id: DRAFT_ID }),
  ]);

  const plans: Plan[] = [];
  if (!doc && !draft) {
    console.log(
      `No ${PAGE_ID} document exists (published or draft) — the published ` +
        "document will be CREATED and seeded. (Alternative without this " +
        "script: open Hydro Jetting Page in /studio — it prefills with the " +
        "same stack, but you must also create the “Hydro Jetting FAQs” set " +
        "under FAQ Sets yourself, or the Q&A band points at nothing — and " +
        "press Publish.)",
    );
    plans.push({ id: PAGE_ID, unset: [], create: true });
  } else {
    for (const [id, source] of [
      [PAGE_ID, doc],
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

  // One transaction: create the published doc only if missing, then per
  // target set the stack and drop any verified-empty leftovers. These are
  // the only writes in the script, and they target only the hydroJettingPage
  // ids and the hydro jetting FAQ set.
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
        _id: PAGE_ID,
        _type: PAGE_ID,
      });
    }
    transaction = transaction.patch(plan.id, (patch) => {
      const withSections = patch.set({ sections });
      return plan.unset.length ? withSections.unset(plan.unset) : withSections;
    });
  }
  await transaction.commit();

  console.log(
    `\nDone. ${plans.map((plan) => plan.id).join(" and ")} now carr${plans.length === 1 ? "ies" : "y"} ` +
      `the ${sections.length}-band ${HYDRO_JETTING_PATH} stack` +
      (faqSetHasContent ? "" : `, and “${HYDRO_JETTING_FAQ_SET.title}” exists under FAQ Sets`) +
      ". Hard-reload /studio (Hydro Jetting Page shows the section list, no " +
      `'Unknown fields found') and reload ${HYDRO_JETTING_PATH} — every band ` +
      "should render, with the Q&A band reading from the shared set. Then add " +
      "the banner and collage photos in Studio, and the nav link: under " +
      "Navigation Menu → Commercial, add a dropdown item titled “Hydro " +
      `Jetting” with the address “${HYDRO_JETTING_PATH}”.`,
  );
}

main().catch((error) => {
  console.error("seed-hydro-jetting-page failed:", error);
  process.exit(1);
});
