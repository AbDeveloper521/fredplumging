/**
 * Seeds the `aboutPage` document's `sections[]` with the default About stack
 * from data/aboutPage.ts, VERBATIM — same order, same copy, proper
 * _key/_type per the schema. Photo slots stay empty (the fallback carries no
 * real images), so the styled placeholders keep rendering. Dry run:
 *   sanity exec scripts/seed-about-sections.ts
 * write pass (owner runs this after reading the plan):
 *   sanity exec scripts/seed-about-sections.ts -- --confirm
 *
 * What it does, and ALL it can do:
 *  - Patches `aboutPage`, and `drafts.aboutPage` when a draft exists — same
 *    treatment, one transaction. When NO document exists at all it uses
 *    createIfNotExists({_id: "aboutPage", _type: "aboutPage"}) and then
 *    seeds it — creation, never replacement.
 *  - Also unsets the leftover old-shape fields (storyParagraphs,
 *    storyPhotoPrimary, evolutionPhoto) in the same patch — but FIRST
 *    verifies each contains no image asset reference and no non-empty text.
 *    If any does, the script STOPS and reports instead of writing: content
 *    the migration should have moved must never be silently discarded.
 *
 * Refuses to run when:
 *  - a target document already has a non-empty `sections` array (e.g. the
 *    Studio's initialValue prefill — in that case just press Publish), or
 *  - a target document carries any OTHER unexpected field — that means the
 *    document is not in the assumed shape, and
 *    scripts/migrate-about-sections.ts (or a human) should look first.
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no other document types, under any flag.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import { defaultAboutSections } from "../data/aboutPage";

type Raw = Record<string, unknown>;

/** Old-shape leftovers this script may unset — ONLY after the content check. */
const LEFTOVER_FIELDS = ["storyParagraphs", "storyPhotoPrimary", "evolutionPhoto"];

/** Array fields inside sections whose object members need _type + _key. */
const CHILD_TYPE: Record<string, string> = { values: "value", links: "link" };

/**
 * The default stack as Sanity array items: JSON round-trip strips the
 * `undefined` photo slots; nested object-array members (values, links) get
 * deterministic _key/_type so Studio lists render and diffs stay stable.
 */
function preparedSections(): Raw[] {
  const stack = JSON.parse(JSON.stringify(defaultAboutSections)) as Raw[];
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
 * non-underscore path, and image asset references. Empty scaffolding
 * ({_type: "image"}, hotspot numbers, whitespace strings) does not count.
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
        "The document is not in the assumed empty-plus-leftovers shape — " +
        "run scripts/migrate-about-sections.ts (or inspect in /studio) " +
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
      `STOP: leftover old fields on ${id} still contain real content — ` +
        "unsetting them would discard it. Move it across (or clear it " +
        "deliberately in /studio) first:\n" +
        content.map((line) => `  - ${line}`).join("\n") +
        "\nNothing was changed.",
    );
    return null;
  }

  console.log(
    `${id}: sections is ${Array.isArray(sections) ? "empty" : "absent"}; ` +
      (present.length
        ? `leftover fields verified empty of content, will unset: ${present.join(", ")}`
        : "no leftover old fields present"),
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

  const [doc, draft] = await Promise.all([
    client.fetch<Raw | null>(`*[_id == "aboutPage"][0]`),
    client.fetch<Raw | null>(`*[_id == "drafts.aboutPage"][0]`),
  ]);

  const plans: Plan[] = [];
  if (!doc && !draft) {
    console.log(
      "No aboutPage document exists (published or draft) — the published " +
        "document will be CREATED and seeded. (Alternative without this " +
        "script: open About Page in /studio — it prefills with the same " +
        "stack — and press Publish.)",
    );
    plans.push({ id: "aboutPage", unset: [], create: true });
  } else {
    for (const [id, source] of [
      ["aboutPage", doc],
      ["drafts.aboutPage", draft],
    ] as const) {
      if (!source) continue;
      const plan = planFor(id, source);
      if (!plan) process.exit(1);
      plans.push(plan);
    }
  }

  const sections = preparedSections();
  console.log(`\nSections to seed, in order (photo slots stay empty):`);
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
        "  npx sanity exec scripts/seed-about-sections.ts -- --confirm",
    );
    return;
  }

  // One transaction: create the published doc only if missing, then per
  // target set the stack and drop the verified-empty leftovers. These are
  // the only writes in the script, and they target only the aboutPage ids.
  let transaction = client.transaction();
  for (const plan of plans) {
    if (plan.create) {
      transaction = transaction.createIfNotExists({
        _id: "aboutPage",
        _type: "aboutPage",
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
      "the default About stack. Check /studio (About Page shows the full " +
      "section list, no 'Unknown fields found') and reload /about — it must " +
      "render exactly what the code fallback rendered.",
  );
}

main().catch((error) => {
  console.error("seed-about-sections failed:", error);
  process.exit(1);
});
