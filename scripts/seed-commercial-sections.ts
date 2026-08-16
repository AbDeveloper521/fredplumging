/**
 * Seeds the `commercialPage` document's `sections[]` with the /commercial
 * stack from data/commercialPage.ts, VERBATIM, and creates the "Commercial
 * FAQs" set the Q&A band references.
 * Dry run:
 *   sanity exec scripts/seed-commercial-sections.ts
 * write pass (owner runs this after reading the plan):
 *   sanity exec scripts/seed-commercial-sections.ts -- --confirm
 *
 * ⚠️  BEFORE RUNNING --confirm: close (or hard-reload) every open Studio tab
 * showing Commercial Page. A stale tab holding an old draft that presses
 * Publish afterwards will overwrite the seeded document — this exact accident
 * happened with the About page.
 *
 * What it does, and ALL it can do:
 *  - Patches `commercialPage`, and `drafts.commercialPage` when a draft
 *    exists — same treatment, one transaction. When NO document exists at all
 *    it uses createIfNotExists({_id: "commercialPage", _type:
 *    "commercialPage"}) and then seeds it — creation, never replacement.
 *  - This page is new, so it has no old fixed-field shape and no leftover
 *    fields are expected; if a target document carries ANY unexpected field
 *    the script stops and reports rather than guessing. If a field ever
 *    needs unsetting, it is content-checked first (no image asset._ref, no
 *    non-empty text) — content is never silently discarded.
 *
 * ONE overwrite is permitted, and only one: a document carrying nothing but
 * the placeholder banner this repo itself shipped (matched on its exact
 * subheading) is replaced by the full stack — there is no content there to
 * lose. Any OTHER non-empty `sections` array belongs to whoever built it and
 * stops the script with instructions instead. The "Commercial FAQs" set is
 * created if missing; one that already has questions is left alone. The
 * navigation document is NEVER touched: the Commercial menu link is the
 * owner's to add in Studio.
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no other document types, under any flag.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import { commercialSectionsForSanity } from "../data/commercialPage";
import { COMMERCIAL_FAQ_SET, COMMERCIAL_FAQ_SET_ID, UNCONFIRMED_CLAIMS } from "../data/faqSets";

type Raw = Record<string, unknown>;

/** Old fields this script may unset — none exist for this page. */
const LEFTOVER_FIELDS: string[] = [];

/**
 * The exact placeholder banner this repo shipped as the first default stack.
 * Matching it is how the script knows a one-band document is the placeholder
 * and not the owner's work — see `planFor`.
 */
const PLACEHOLDER_SUBHEADING =
  "Placeholder banner — the sections for this page have not been added yet.";

/**
 * The stack in Sanity shape. Shared with the Studio prefill
 * (`initialValue` in sanity/schemas/commercialPage.ts) so a document created
 * either way is identical: nested card/benefit rows keyed, and the Q&A band
 * written as a REFERENCE to the shared set rather than a copy of its
 * questions — the fallback in data/ carries them inline because there is
 * nothing to dereference when Sanity is unreachable.
 */
const preparedSections = (): Raw[] => commercialSectionsForSanity();

/** The FAQ set document, with _type/_key on every question. */
function faqSetDocument(): Raw {
  return {
    _id: COMMERCIAL_FAQ_SET_ID,
    _type: "faqSet",
    title: COMMERCIAL_FAQ_SET.title,
    ...(COMMERCIAL_FAQ_SET.heading ? { heading: COMMERCIAL_FAQ_SET.heading } : {}),
    ...(COMMERCIAL_FAQ_SET.intro ? { intro: COMMERCIAL_FAQ_SET.intro } : {}),
    items: COMMERCIAL_FAQ_SET.items.map((item) => ({
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

/**
 * True only for the exact one-band placeholder this repo shipped: a single
 * serviceHero carrying the placeholder subheading. Deliberately narrow — the
 * script may overwrite content it wrote itself, and nothing else.
 */
function isShippedPlaceholder(sections: unknown): boolean {
  if (!Array.isArray(sections) || sections.length !== 1) return false;
  const only = sections[0] as Raw | null;
  return Boolean(
    only &&
      typeof only === "object" &&
      only._type === "serviceHero" &&
      only.subheading === PLACEHOLDER_SUBHEADING,
  );
}

/** Validates one existing document and returns its plan, or null to stop. */
function planFor(id: string, doc: Raw): Plan | null {
  const sections = doc.sections;
  if (Array.isArray(sections) && sections.length > 0) {
    // The one overwrite this script permits: the placeholder banner it shipped
    // itself, which exists only to keep the route from rendering blank. Any
    // other non-empty stack is the owner's and is never touched.
    if (isShippedPlaceholder(sections)) {
      console.log(
        `${id}: carries ONLY the shipped placeholder banner — it will be ` +
          "REPLACED by the full stack. (No other content exists to lose.)",
      );
      return { id, unset: [], create: false };
    }
    console.error(
      `STOP: ${id} already has a non-empty sections array ` +
        `(${sections.length} item(s)) that is not the shipped placeholder — ` +
        "so it is content someone built, and this script will not overwrite " +
        "it. To add the commercial bands to that page, add them in /studio " +
        "(Commercial Page), or empty the sections list there first and re-run " +
        "this. Nothing was changed.",
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
    "⚠️  Close or hard-reload any open Studio tab showing Commercial Page " +
      "before --confirm — a stale tab pressing Publish afterwards overwrites " +
      "the seeded document (this happened with the About page).\n",
  );

  const [doc, draft] = await Promise.all([
    client.fetch<Raw | null>(`*[_id == "commercialPage"][0]`),
    client.fetch<Raw | null>(`*[_id == "drafts.commercialPage"][0]`),
  ]);

  const plans: Plan[] = [];
  if (!doc && !draft) {
    console.log(
      "No commercialPage document exists (published or draft) — the published " +
        "document will be CREATED and seeded. (Alternative without this " +
        "script: open Commercial Page in /studio — it prefills with the same " +
        "stack, but you must also create the “Commercial FAQs” set under FAQ " +
        "Sets yourself, or the Q&A band points at nothing — and press Publish.)",
    );
    plans.push({ id: "commercialPage", unset: [], create: true });
  } else {
    for (const [id, source] of [
      ["commercialPage", doc],
      ["drafts.commercialPage", draft],
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
    client.fetch<Raw | null>(`*[_id == $id][0]`, { id: COMMERCIAL_FAQ_SET_ID }),
    client.fetch<Raw | null>(`*[_id == $id][0]`, {
      id: `drafts.${COMMERCIAL_FAQ_SET_ID}`,
    }),
  ]);
  const itemCount = (d: Raw | null) => (d && Array.isArray(d.items) ? d.items.length : 0);
  const faqSetHasContent = itemCount(faqDoc) > 0 || itemCount(faqDraft) > 0;

  console.log("\nFAQ set:");
  if (faqSetHasContent) {
    console.log(
      `  • ${COMMERCIAL_FAQ_SET_ID} already exists with ` +
        `${Math.max(itemCount(faqDoc), itemCount(faqDraft))} question(s) — LEFT ` +
        "UNTOUCHED. The Q&A band will show whatever is published there; edit " +
        "it in /studio under FAQ Sets.",
    );
  } else {
    console.log(
      `  • ${COMMERCIAL_FAQ_SET_ID} ${faqDoc || faqDraft ? "exists but has no questions" : "does not exist"} — ` +
        `the ${COMMERCIAL_FAQ_SET.items.length} “${COMMERCIAL_FAQ_SET.title}” questions will be written:`,
    );
    COMMERCIAL_FAQ_SET.items.forEach((item, i) =>
      console.log(`      ${i + 1}. ${item.question}`),
    );
  }
  console.log(
    "  • The Multi-Family set is a SEPARATE document and is not touched.",
  );

  const sections = preparedSections();
  console.log(`\nSections to seed, in order (banner photo slot stays empty):`);
  sections.forEach((section, i) => {
    const fields = Object.keys(section).filter((key) => !key.startsWith("_"));
    const detail =
      section._type === "faqBand"
        ? ` — references ${COMMERCIAL_FAQ_SET_ID} (not a copy of the questions)`
        : ` — ${fields.join(", ")}`;
    console.log(`  ${i + 1}. ${section._type} (_key: ${section._key})${detail}`);
  });
  console.log(
    `\nTargets: ${plans
      .map((plan) => `${plan.id}${plan.create ? " (will be created)" : ""}`)
      .join(", ")}`,
  );

  console.log(
    "\nLicence-gated claims in this content — confirm with the client before " +
      "this page goes live:",
  );
  for (const claim of UNCONFIRMED_CLAIMS) {
    console.log(`  • ${claim.claim} — ${claim.confirmWithClient}`);
  }

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/seed-commercial-sections.ts -- --confirm",
    );
    return;
  }

  // One transaction: create the published doc only if missing, then per
  // target set the stack and drop any verified-empty leftovers. These are
  // the only writes in the script, and they target only the commercialPage
  // ids.
  let transaction = client.transaction();

  if (!faqSetHasContent) {
    // createIfNotExists then patch, so an existing-but-empty set is filled
    // rather than replaced.
    const set = faqSetDocument();
    transaction = transaction.createIfNotExists({
      _id: COMMERCIAL_FAQ_SET_ID,
      _type: "faqSet",
    });
    transaction = transaction.patch(COMMERCIAL_FAQ_SET_ID, (patch) =>
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
        _id: "commercialPage",
        _type: "commercialPage",
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
      `the ${sections.length}-band /commercial stack` +
      (faqSetHasContent ? "" : `, and “${COMMERCIAL_FAQ_SET.title}” exists under FAQ Sets`) +
      ". Hard-reload /studio (Commercial Page shows the section list, no " +
      "'Unknown fields found') and reload /commercial — every band should " +
      "render, with the Q&A band reading from the shared set. Then add the " +
      "banner and intro photos in Studio, and the nav link: title " +
      "“Commercial”, address “/commercial”, no dropdown items.",
  );
}

main().catch((error) => {
  console.error("seed-commercial-sections failed:", error);
  process.exit(1);
});
