/**
 * Sets the Facebook and LinkedIn page addresses on the published
 * `siteSettings` singleton. Dry run:
 *   sanity exec scripts/set-social-links.ts
 * write pass (owner runs this after reading the plan):
 *   sanity exec scripts/set-social-links.ts -- --confirm
 *
 * ⚠️  BEFORE RUNNING --confirm: close (or hard-reload) any open Studio tab
 * showing Site Settings. A stale tab that presses Publish afterwards writes
 * its cached copy back and undoes this.
 *
 * WHY A SCRIPT: the footer icons and the schema.org `sameAs` list both read
 * siteSettings via getSite(). `data/site.ts` is only the FALLBACK — the site
 * already renders the right links from it, but leaving Sanity empty means
 * (a) the owner cannot edit the URLs in Studio, and (b) `npm run check:drift`
 * reports the two fields as divergent forever.
 *
 * What it does, and ALL it can do: sets `facebookUrl` and `linkedinUrl` on
 * `siteSettings` (and `drafts.siteSettings` when a draft exists) to the
 * values below. It touches no other field and no other document. Fields
 * already holding the target value are reported and skipped.
 *
 * Alternative without this script: /studio → Site Settings → Facebook page /
 * LinkedIn page → paste → Publish.
 *
 * THIS SCRIPT MUST NEVER DELETE A DOCUMENT, ASSET, OR UNRELATED FIELD.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";

/** Confirmed by the client. */
const SOCIAL_LINKS = {
  facebookUrl: "https://www.facebook.com/fredsplumbingtx/",
  linkedinUrl: "https://www.linkedin.com/company/fred-s-plumbing1996/",
} as const;

type Raw = Record<string, unknown>;
type Field = keyof typeof SOCIAL_LINKS;

interface Plan {
  id: string;
  set: Partial<Record<Field, string>>;
  unchanged: Field[];
  overwrites: Array<{ field: Field; from: string }>;
}

function planFor(id: string, doc: Raw): Plan | null {
  const plan: Plan = { id, set: {}, unchanged: [], overwrites: [] };
  for (const field of Object.keys(SOCIAL_LINKS) as Field[]) {
    const current = doc[field];
    const target = SOCIAL_LINKS[field];
    if (current === target) {
      plan.unchanged.push(field);
      continue;
    }
    if (typeof current === "string" && current.trim() !== "") {
      plan.overwrites.push({ field, from: current });
    }
    plan.set[field] = target;
  }
  return Object.keys(plan.set).length > 0 || plan.unchanged.length > 0
    ? plan
    : null;
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
    "⚠️  Close or hard-reload any open Studio tab showing Site Settings " +
      "before --confirm — a stale tab pressing Publish afterwards undoes this.\n",
  );

  const [doc, draft] = await Promise.all([
    client.fetch<Raw | null>(
      `*[_id == "siteSettings"][0]{facebookUrl, linkedinUrl}`,
    ),
    client.fetch<Raw | null>(
      `*[_id == "drafts.siteSettings"][0]{facebookUrl, linkedinUrl}`,
    ),
  ]);

  if (!doc) {
    console.error(
      'STOP: no published "siteSettings" document. Publish Site Settings in ' +
        "/studio first — this script only edits an existing singleton.",
    );
    process.exit(1);
  }

  const plans: Plan[] = [];
  for (const [id, source] of [
    ["siteSettings", doc],
    ["drafts.siteSettings", draft],
  ] as const) {
    if (!source) continue;
    const plan = planFor(id, source);
    if (plan) plans.push(plan);
  }

  console.log("Plan:");
  let writes = 0;
  for (const plan of plans) {
    for (const field of plan.unchanged) {
      console.log(`  ${plan.id}: ${field} — already correct, skipping.`);
    }
    for (const [field, value] of Object.entries(plan.set)) {
      const overwrite = plan.overwrites.find((o) => o.field === field);
      console.log(
        overwrite
          ? `  ${plan.id}: ${field} — REPLACING "${overwrite.from}" → ${value}`
          : `  ${plan.id}: ${field} — setting → ${value}`,
      );
      writes++;
    }
  }

  if (writes === 0) {
    console.log("\nNothing to do — both links already match.");
    return;
  }

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/set-social-links.ts -- --confirm",
    );
    return;
  }

  let transaction = client.transaction();
  for (const plan of plans) {
    if (Object.keys(plan.set).length === 0) continue;
    transaction = transaction.patch(plan.id, (patch) => patch.set(plan.set));
  }
  await transaction.commit();

  console.log(
    "\nDone. The footer icons and the LocalBusiness schema.org `sameAs` list " +
      "now read these URLs from Sanity, and they are editable in /studio → " +
      "Site Settings.",
  );
}

main().catch((error) => {
  console.error("set-social-links failed:", error);
  process.exit(1);
});
