/**
 * Seeds the two `legalPage` documents — Privacy Policy and Terms of Service —
 * with the client's verbatim copy from data/legalPages.ts. Dry run:
 *   sanity exec scripts/seed-legal-pages.ts
 * write pass (owner runs this after reading the plan):
 *   sanity exec scripts/seed-legal-pages.ts -- --confirm
 *
 * ⚠️  BEFORE RUNNING --confirm: close (or hard-reload) every open Studio tab
 * showing Privacy Policy or Terms of Service. A stale tab holding an old draft
 * that presses Publish afterwards will overwrite the seeded document — this
 * exact accident happened with the About page.
 *
 * What it does, and ALL it can do:
 *  - For each of the two fixed ids (`legal-privacy-policy`,
 *    `legal-terms-of-service`): patches the published document, and
 *    `drafts.<id>` when a draft exists — same treatment, one transaction.
 *    When no document exists it uses createIfNotExists and then seeds it —
 *    creation, never replacement.
 *  - Writes only: slug, title, eyebrow, intro, body, contact, darkOverlay,
 *    seoTitle, seoDescription. It never writes `bannerPhoto` (the owner
 *    uploads that) and never writes `lastUpdated` — neither reference page
 *    shows a date, and it must not be auto-populated.
 *
 * REFUSES to run against a document that already has a non-empty `body`.
 * Legal text the owner has edited must never be clobbered: if a document is
 * already populated the script stops and reports, changing nothing. Same for
 * any unexpected field — it reports rather than guessing.
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no other document types, under any flag.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import { LEGAL_SLUGS, legalPages, type LegalSlug } from "../data/legalPages";

type Raw = Record<string, unknown>;

/** The Studio structure pins these ids — keep the two in sync. */
const documentId = (slug: LegalSlug) => `legal-${slug}`;

/** Every field this document type has; anything else is unexpected. */
const KNOWN_FIELDS = [
  "slug",
  "title",
  "eyebrow",
  "intro",
  "body",
  "contact",
  "lastUpdated",
  "bannerPhoto",
  "darkOverlay",
  "seoTitle",
  "seoDescription",
];

/**
 * The fallback document as Sanity field values. JSON round-trip strips any
 * `undefined`s; `body` is already Portable Text with stable `_key`s, so
 * Studio lists render and diffs stay readable.
 */
function seedFields(slug: LegalSlug): Raw {
  const content = legalPages[slug];
  return JSON.parse(
    JSON.stringify({
      slug,
      title: content.title,
      eyebrow: content.eyebrow,
      intro: content.intro,
      body: content.body,
      contact: content.contact,
      darkOverlay: true,
      seoTitle: content.seoTitle,
      seoDescription: content.seoDescription,
      // bannerPhoto and lastUpdated are deliberately not written.
    }),
  ) as Raw;
}

interface Plan {
  id: string;
  slug: LegalSlug;
  /** True when the published document must be created first. */
  create: boolean;
}

/** Validates one existing document and returns its plan, or null to stop. */
function planFor(id: string, slug: LegalSlug, doc: Raw): Plan | null {
  const body = doc.body;
  if (Array.isArray(body) && body.length > 0) {
    console.error(
      `STOP: ${id} already has document text (${body.length} block(s)). This ` +
        "script never overwrites legal text that already exists — the owner " +
        "may have edited it. Nothing was changed.",
    );
    return null;
  }

  const unexpected = Object.keys(doc)
    .filter((key) => !key.startsWith("_"))
    .filter((field) => !KNOWN_FIELDS.includes(field));
  if (unexpected.length > 0) {
    console.error(
      `STOP: ${id} carries unexpected field(s): ${unexpected.join(", ")}. ` +
        "The document is not in the assumed shape — inspect it in /studio " +
        "first. Nothing was changed.",
    );
    return null;
  }

  console.log(
    `${id}: body is ${Array.isArray(body) ? "empty" : "absent"} — will be seeded.`,
  );
  return { id, slug, create: false };
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
    "⚠️  Close or hard-reload any open Studio tab showing Privacy Policy or " +
      "Terms of Service before --confirm — a stale tab pressing Publish " +
      "afterwards overwrites the seeded document (this happened with the " +
      "About page).\n",
  );

  const plans: Plan[] = [];
  for (const slug of LEGAL_SLUGS) {
    const id = documentId(slug);
    const [doc, draft] = await Promise.all([
      client.fetch<Raw | null>(`*[_id == $id][0]`, { id }),
      client.fetch<Raw | null>(`*[_id == $id][0]`, { id: `drafts.${id}` }),
    ]);

    if (!doc && !draft) {
      console.log(
        `No ${id} document exists (published or draft) — the published ` +
          "document will be CREATED and seeded.",
      );
      plans.push({ id, slug, create: true });
      continue;
    }
    for (const [targetId, source] of [
      [id, doc],
      [`drafts.${id}`, draft],
    ] as const) {
      if (!source) continue;
      const plan = planFor(targetId, slug, source);
      if (!plan) process.exit(1);
      plans.push(plan);
    }
  }

  console.log("\nWhat will be written:");
  for (const plan of plans) {
    const fields = seedFields(plan.slug);
    const body = fields.body as unknown[];
    const intro = fields.intro as unknown[];
    console.log(
      `  ${plan.id}${plan.create ? " (will be created)" : ""} — ` +
        `slug=/${plan.slug}, ${intro.length} intro paragraph(s), ` +
        `${body.length} body block(s), contact box, SEO title + description. ` +
        "Banner photo and Last updated: not written.",
    );
  }

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/seed-legal-pages.ts -- --confirm",
    );
    return;
  }

  // One transaction: create each published document only if missing, then set
  // the seeded fields on every target. These are the only writes in the
  // script, and they target only the two legal-page ids.
  let transaction = client.transaction();
  for (const plan of plans) {
    if (plan.create) {
      transaction = transaction.createIfNotExists({
        _id: plan.id,
        _type: "legalPage",
      });
    }
    transaction = transaction.patch(plan.id, (patch) =>
      patch.set(seedFields(plan.slug)),
    );
  }
  await transaction.commit();

  console.log(
    `\nDone. ${plans.map((plan) => plan.id).join(" and ")} now carry the ` +
      "client's verbatim legal copy. Hard-reload /studio (Legal Pages → " +
      "Privacy Policy / Terms of Service, no 'Unknown fields found') and " +
      "reload /privacy-policy and /terms-of-service — the text must read " +
      "exactly as it did on the fallback path.",
  );
}

main().catch((error) => {
  console.error("seed-legal-pages failed:", error);
  process.exit(1);
});
