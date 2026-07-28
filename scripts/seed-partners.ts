/**
 * Partners-phase sync — run with:  sanity exec scripts/seed-partners.ts -- --confirm
 *
 * Surgical alternative to a full `npm run seed -- --force`: it touches ONLY
 * what the /about/partners build added, leaving services, industries,
 * navigation, testimonials, and reviewSettings untouched.
 *
 *  1. createOrReplace every trustLogo from STATIC_TRUST_LOGOS (now carrying
 *     headline/blurb/category/verified) and DELETE stale ones — the old bare
 *     "Nexus" entry is superseded by "Vendor Nexus".
 *  2. Patch `licenseNumber` onto the siteSettings singleton.
 *  3. createOrReplace the FAQ list (three vendor-onboarding questions were
 *     appended) and delete stale FAQ documents.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope), same as seed-content.ts.
 */
import { getCliClient } from "sanity/cli";
import { site } from "../data/site";
import { STATIC_TRUST_LOGOS } from "../data/navigation";
import { faqs } from "../data/faqs";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  if (!process.argv.includes("--confirm")) {
    console.error(
      "This rewrites trust logos and FAQs and patches siteSettings.\n" +
        "Re-run with:  sanity exec scripts/seed-partners.ts -- --confirm",
    );
    process.exit(1);
  }
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!writeToken) {
    console.error("SANITY_API_WRITE_TOKEN is not set (Editor scope, .env.local).");
    process.exit(1);
  }

  const client = getCliClient({ apiVersion: "2026-07-01" }).withConfig({
    token: writeToken,
    useCdn: false,
  });
  const { projectId, dataset } = client.config();

  const tx = client.transaction();

  STATIC_TRUST_LOGOS.forEach((logo, i) => {
    tx.createOrReplace({
      _id: `trustLogo-${slugify(logo.name)}`,
      _type: "trustLogo",
      name: logo.name,
      ...(logo.headline ? { headline: logo.headline } : {}),
      ...(logo.blurb ? { blurb: logo.blurb } : {}),
      ...(logo.category ? { category: logo.category } : {}),
      ...(logo.url ? { url: logo.url } : {}),
      ...(logo.verified !== undefined ? { verified: logo.verified } : {}),
      order: (i + 1) * 10,
    });
  });
  const staleLogoIds = await client.fetch<string[]>(
    `*[_type == "trustLogo" && !(_id in $ids)]._id`,
    { ids: STATIC_TRUST_LOGOS.map((l) => `trustLogo-${slugify(l.name)}`) },
  );
  staleLogoIds.forEach((id) => tx.delete(id));

  tx.patch("siteSettings", { set: { licenseNumber: site.licenseNumber } });

  faqs.forEach((faq, i) => {
    tx.createOrReplace({
      _id: `faq-${(i + 1) * 10}`,
      _type: "faq",
      question: faq.question,
      answer: faq.answer,
      order: (i + 1) * 10,
    });
  });
  const staleFaqIds = await client.fetch<string[]>(
    `*[_type == "faq" && !(_id in $ids)]._id`,
    { ids: faqs.map((_, i) => `faq-${(i + 1) * 10}`) },
  );
  staleFaqIds.forEach((id) => tx.delete(id));

  await tx.commit();

  console.log(
    `✓ Synced partners content into project "${projectId}", dataset "${dataset}":\n` +
      `  ${STATIC_TRUST_LOGOS.length} trust logos written, ${staleLogoIds.length} stale deleted,\n` +
      `  siteSettings.licenseNumber set, ${faqs.length} FAQs written, ${staleFaqIds.length} stale deleted.\n\n` +
      `  Next: npm run check:drift   (all rows should print ✓)`,
  );
}

main().catch((error) => {
  console.error("seed-partners failed:", error);
  process.exit(1);
});
