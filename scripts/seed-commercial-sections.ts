/**
 * Seeds the `commercialPage` document's `sections[]` with the default
 * /commercial stack from data/commercialPage.ts, VERBATIM — one placeholder
 * banner, nothing else, because the owner builds this page himself in Studio.
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
 * Refuses to run when a target document already has a non-empty `sections`
 * array (e.g. the Studio's initialValue prefill — in that case just press
 * Publish). The navigation document is NEVER touched: the Commercial menu
 * link is the owner's to add in Studio.
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no other document types, under any flag.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import { defaultCommercialSections } from "../data/commercialPage";

type Raw = Record<string, unknown>;

/** Old fields this script may unset — none exist for this page. */
const LEFTOVER_FIELDS: string[] = [];

/** Array fields inside sections whose object members need _type + _key. */
const CHILD_TYPE: Record<string, string> = {
  credentials: "item",
};

/**
 * The default stack as Sanity array items: JSON round-trip strips any
 * `undefined`s (empty photo slots); nested object-array members get
 * deterministic _key/_type so Studio lists render and diffs stay stable.
 */
function preparedSections(): Raw[] {
  const stack = JSON.parse(JSON.stringify(defaultCommercialSections)) as Raw[];
  return stack.map((section) => {
    for (const [field, childType] of Object.entries(CHILD_TYPE)) {
      const value = section[field];
      if (!Array.isArray(value)) continue;
      section[field] = value.map((entry, i) =>
        entry && typeof entry === "object" && !Array.isArray(entry)
          ? { _type: childType, _key: `${section._key}-${field}-${i}`, ...(entry as Raw) }
          : entry,
      );
    }
    return section;
  });
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
        `(${sections.length} item(s)). If that is the Studio's prefill, just ` +
        "press Publish — this script never merges into or overwrites " +
        "existing sections. Nothing was changed.",
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
        "stack — and press Publish.)",
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

  const sections = preparedSections();
  console.log(`\nSections to seed, in order (banner photo slot stays empty):`);
  sections.forEach((section, i) => {
    const fields = Object.keys(section).filter((key) => !key.startsWith("_"));
    console.log(
      `  ${i + 1}. ${section._type} (_key: ${section._key}) — ${fields.join(", ")}`,
    );
  });
  console.log(
    `\nTargets: ${plans
      .map((plan) => `${plan.id}${plan.create ? " (will be created)" : ""}`)
      .join(", ")}`,
  );

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
      "the placeholder /commercial stack. Hard-reload /studio (Commercial Page " +
      "shows the one-section list, no 'Unknown fields found') and reload " +
      "/commercial — the placeholder banner must be unchanged. Then build the " +
      "page by adding sections in Studio.",
  );
}

main().catch((error) => {
  console.error("seed-commercial-sections failed:", error);
  process.exit(1);
});
