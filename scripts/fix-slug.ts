/**
 * Slug correction script — run with:
 *   npm run fix:slug -- <document-id> <new-slug>
 * e.g.
 *   npm run fix:slug -- service-commercial-plumbing commercial-plumbing-dfw
 *
 * The Studio locks slug fields once set (see sanity/schemas/fields.ts). This
 * script bypasses that lock at the API level and updates the slug on both
 * the published document and its draft (if one exists).
 *
 * ⚠ CONSEQUENCES OF CHANGING A PUBLISHED SLUG:
 *  - The page moves to the new URL on the next revalidation; the OLD URL
 *    returns 404. Inbound links, bookmarks, and search rankings pointing at
 *    the old URL break immediately.
 *  - To preserve them, add a permanent redirect in next.config.ts and
 *    deploy, e.g.:
 *      async redirects() {
 *        return [{ source: "/services/old-slug",
 *                  destination: "/services/new-slug", permanent: true }];
 *      }
 *  - Seed-created documents have IDs derived from the ORIGINAL slug
 *    (service-<slug>); the ID is not changed by this script and does not
 *    need to be — it is internal and invisible to visitors.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor), same as the seed script.
 */
import { getCliClient } from "sanity/cli";

async function main() {
  const [docId, newSlug] = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  if (!docId || !newSlug) {
    console.error("Usage: npm run fix:slug -- <document-id> <new-slug>");
    process.exit(1);
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(newSlug)) {
    console.error(
      `✗ "${newSlug}" is not a valid slug — lowercase letters, numbers, and single hyphens only.`,
    );
    process.exit(1);
  }

  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!writeToken) {
    console.error("✗ SANITY_API_WRITE_TOKEN is not set (Editor token — see .env.example).");
    process.exit(1);
  }

  const client = getCliClient({ apiVersion: "2026-07-01" }).withConfig({
    token: writeToken,
    useCdn: false,
  });

  const ids = [docId, `drafts.${docId}`];
  const docs = await client.fetch<Array<{ _id: string; slug?: { current?: string } }>>(
    `*[_id in $ids]{_id, slug}`,
    { ids },
  );
  if (docs.length === 0) {
    console.error(`✗ No document found with ID "${docId}" (or a draft of it).`);
    process.exit(1);
  }

  for (const doc of docs) {
    const old = doc.slug?.current ?? "(none)";
    await client
      .patch(doc._id)
      .set({ slug: { _type: "slug", current: newSlug } })
      .commit();
    console.log(`✓ ${doc._id}: slug "${old}" → "${newSlug}"`);
  }

  console.log(
    `\nDone. Remember:\n` +
      `  1. The page's OLD URL now 404s once the site revalidates (the webhook\n` +
      `     fires on this update). Add a permanent redirect in next.config.ts\n` +
      `     if the old URL was ever shared or indexed — see the header of this\n` +
      `     script for the exact snippet.\n` +
      `  2. Run "npm run check:drift" — if this document mirrors a fallback\n` +
      `     constant in data/*.ts, update the constant to match.`,
  );
}

main().catch((error) => {
  console.error("fix-slug failed:", error);
  process.exit(1);
});
