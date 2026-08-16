/**
 * Corrects the web address of the "Student Housing" property type.
 * Dry run:
 *   sanity exec scripts/fix-student-housing-slug.ts
 * write pass (owner runs this after reading the plan):
 *   sanity exec scripts/fix-student-housing-slug.ts -- --confirm
 *
 * ⚠️  BEFORE RUNNING --confirm: close (or hard-reload) every open Studio tab
 * showing Student Housing or Multifamily Index Page. A stale tab holding an
 * old draft that presses Publish afterwards puts the wrong slug straight
 * back — this exact accident happened with the About page.
 *
 * WHY A SCRIPT: the slug field is `readOnly` once set (sanity/schemas/
 * fields.ts → lockedSlug), so Studio will not let anyone edit it. That guard
 * is deliberate and stays. `readOnly` is a Studio-UI constraint only — the
 * Content Lake does not enforce it — so this patches the document directly
 * WITHOUT weakening the schema. Do not "fix" a slug by loosening the rule.
 *
 * What it does, and ALL it can do:
 *  - Finds the single `industry` document titled "Student Housing" and sets
 *    `slug.current` to "student-housing". Published document and its draft
 *    both get the same patch, in one transaction, when both exist.
 *  - Refuses if another document already occupies that slug, if the title
 *    matches more or less than one document, or if the slug is already
 *    correct — reporting instead of guessing.
 *  - Leaves `_id` alone on purpose. Only the slug drives the URL; changing an
 *    `_id` means deleting and recreating the document, which breaks every
 *    reference to it and loses its history.
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no other fields, no other document types, under any flag.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";

const TITLE = "Student Housing";
const NEW_SLUG = "student-housing";

interface Doc {
  _id: string;
  title?: string;
  slug?: { current?: string };
  _updatedAt?: string;
}

function slugOf(doc: Doc): string {
  return doc.slug?.current ?? "(none)";
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
    "⚠️  Close or hard-reload any open Studio tab showing Student Housing or " +
      "Multifamily Index Page before --confirm — a stale tab pressing Publish " +
      "afterwards puts the old address straight back.\n",
  );

  // Published documents only here; the draft is fetched by id below, so a
  // draft can never be mistaken for a second published match.
  const published = await client.fetch<Doc[]>(
    `*[_type == "industry" && title == $title && !(_id in path("drafts.**"))]{_id, title, slug, _updatedAt}`,
    { title: TITLE },
  );

  if (published.length !== 1) {
    console.error(
      `STOP: expected exactly one published “${TITLE}” property type, found ` +
        `${published.length}${published.length ? `: ${published.map((d) => d._id).join(", ")}` : ""}. ` +
        "Inspect the Property Types list in /studio first. Nothing was changed.",
    );
    process.exit(1);
  }

  const doc = published[0];
  const draft = await client.fetch<Doc | null>(`*[_id == $id][0]{_id, title, slug, _updatedAt}`, {
    id: `drafts.${doc._id}`,
  });

  if (slugOf(doc) === NEW_SLUG && (!draft || slugOf(draft) === NEW_SLUG)) {
    console.log(
      `Nothing to do: the address is already “${NEW_SLUG}”. Nothing was changed.`,
    );
    return;
  }

  // A second document already at the target address would mean two pages
  // fighting over one URL — report it rather than creating the collision.
  const collision = await client.fetch<Doc[]>(
    `*[_type == "industry" && slug.current == $slug && !(_id in path("drafts.**")) && _id != $id]{_id, title}`,
    { slug: NEW_SLUG, id: doc._id },
  );
  if (collision.length > 0) {
    console.error(
      `STOP: another property type already uses /multifamily/${NEW_SLUG} — ` +
        collision.map((d) => `${d._id} (“${d.title}”)`).join(", ") +
        ". Two documents cannot share one address. Nothing was changed.",
    );
    process.exit(1);
  }

  const targets = [doc, ...(draft ? [draft] : [])];
  console.log(`Document: ${doc._id}  (title: “${doc.title}”)`);
  console.log(
    `  _id is left EXACTLY as it is — only the slug drives the URL.\n`,
  );
  for (const target of targets) {
    const label = target._id.startsWith("drafts.") ? "draft    " : "published";
    console.log(
      `  ${label}  slug: “${slugOf(target)}”  →  “${NEW_SLUG}”` +
        `   (URL: /multifamily/${slugOf(target)}  →  /multifamily/${NEW_SLUG})`,
    );
  }
  if (!draft) console.log("  draft     none exists — nothing to patch there.");

  console.log(
    "\nAfter this runs, give Student Housing the same Q&A band its five " +
      "siblings have:\n" +
      "  npx sanity exec scripts/append-multifamily-faq.ts -- --confirm\n" +
      "(that script is idempotent — it skips the five that already have one).",
  );

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/fix-student-housing-slug.ts -- --confirm",
    );
    return;
  }

  // One transaction, one field. `set` on slug.current only — no other field
  // on these documents is read, written, or removed.
  let transaction = client.transaction();
  for (const target of targets) {
    transaction = transaction.patch(target._id, (patch) =>
      patch.set({ "slug.current": NEW_SLUG }),
    );
  }
  await transaction.commit();

  console.log(
    `\nDone. ${targets.map((t) => t._id).join(" and ")} now point at ` +
      `/multifamily/${NEW_SLUG}. Hard-reload /studio, then check ` +
      "/multifamily — the Student Housing card should link to the new " +
      "address, and the page should load. Then run the FAQ append command above.",
  );
}

main().catch((error) => {
  console.error("fix-student-housing-slug failed:", error);
  process.exit(1);
});
