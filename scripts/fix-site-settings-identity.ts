/**
 * Corrects the business-identity fields on the `siteSettings` document that
 * have drifted from the values the owner confirmed. Dry run:
 *   sanity exec scripts/fix-site-settings-identity.ts
 * write pass (owner runs this after reading the plan):
 *   sanity exec scripts/fix-site-settings-identity.ts -- --confirm
 *
 * ⚠️  BEFORE RUNNING --confirm: close (or hard-reload) every open Studio tab
 * showing Site Settings. A stale tab that presses Publish afterwards puts the
 * old values straight back — this exact accident happened with the About page.
 *
 * WHY THIS MATTERS: Sanity wins over `data/site.ts` at runtime. Correcting the
 * file alone changes nothing a visitor sees — every page reads Site Settings
 * through getSite(), so a wrong value here is the live value.
 *
 * What it changes, and ALL it can change — the three drifted fields plus one
 * unset, on `siteSettings` and `drafts.siteSettings` when a draft exists:
 *   email      service@fredsplumbing.com  →  contact@fredsplumbing.com
 *   emailHref  mailto:service@…           →  mailto:contact@fredsplumbing.com
 *   foundedYear             1993          →  1996
 *   yearsInBusiness         "30+"         →  UNSET, so it derives from
 *                                            foundedYear and can never go
 *                                            stale (getSite → derivedYears)
 *
 * It writes a field ONLY when that field currently holds the exact wrong value
 * listed above. Anything else — a third value someone has since typed, a
 * missing document — stops the script and reports, rather than guessing.
 *
 * ⚠️  1996 vs 1993 IS AN UNRESOLVED CONFLICT. `data/site.ts`, the About page
 * copy and the client's own heritage text all say 1996; only this Sanity field
 * says 1993. Confirm with the client before running the write pass. If they say
 * 1993, do not run this — it becomes a one-value change in data/site.ts and the
 * About copy instead.
 *
 * The production URL is deliberately NOT touched: the site no longer reads it
 * from Sanity at all (see lib/siteUrl.ts). The field is now read-only in
 * Studio and can be left as-is.
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no other document types, under any flag.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";

type Raw = Record<string, unknown>;

/** field → [the exact wrong value we will replace, the correct value]. */
const CORRECTIONS: Record<string, [string | number, string | number]> = {
  email: ["service@fredsplumbing.com", "contact@fredsplumbing.com"],
  emailHref: [
    "mailto:service@fredsplumbing.com",
    "mailto:contact@fredsplumbing.com",
  ],
  foundedYear: [1993, 1996],
};

/** Cleared so the figure derives from foundedYear instead of ageing. */
const UNSET_IF_EQUALS: Record<string, string> = {
  yearsInBusiness: "30+",
};

interface Plan {
  id: string;
  set: Record<string, string | number>;
  unset: string[];
  alreadyCorrect: string[];
}

function planFor(id: string, doc: Raw): Plan | null {
  const set: Record<string, string | number> = {};
  const unset: string[] = [];
  const alreadyCorrect: string[] = [];

  for (const [field, [wrong, right]] of Object.entries(CORRECTIONS)) {
    const current = doc[field];
    if (current === right) {
      alreadyCorrect.push(field);
      continue;
    }
    if (current === wrong) {
      set[field] = right;
      continue;
    }
    console.error(
      `STOP: ${id}.${field} holds ${JSON.stringify(current)}, which is ` +
        `neither the known-wrong value ${JSON.stringify(wrong)} nor the ` +
        `correct ${JSON.stringify(right)}. Someone has changed it since this ` +
        "script was written — inspect it in /studio. Nothing was changed.",
    );
    return null;
  }

  for (const [field, wrong] of Object.entries(UNSET_IF_EQUALS)) {
    const current = doc[field];
    if (current === undefined || current === null) {
      alreadyCorrect.push(`${field} (already empty — derives)`);
      continue;
    }
    if (current === wrong) {
      unset.push(field);
      continue;
    }
    console.error(
      `STOP: ${id}.${field} holds ${JSON.stringify(current)}, not the ` +
        `expected ${JSON.stringify(wrong)}. It may be a deliberate override — ` +
        "clear it in /studio if you want the derived figure. Nothing was changed.",
    );
    return null;
  }

  return { id, set, unset, alreadyCorrect };
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
    "⚠️  Close or hard-reload any open Studio tab showing Site Settings before " +
      "--confirm — a stale tab pressing Publish afterwards restores the old " +
      "values.\n",
  );
  console.log(
    "⚠️  foundedYear 1996 vs 1993 is an unresolved conflict. Confirm the real " +
      "founding year with the client before the write pass.\n",
  );

  const [doc, draft] = await Promise.all([
    client.fetch<Raw | null>(`*[_id == "siteSettings"][0]`),
    client.fetch<Raw | null>(`*[_id == "drafts.siteSettings"][0]`),
  ]);

  if (!doc && !draft) {
    console.error(
      "STOP: no siteSettings document exists. This script only corrects an " +
        "existing document — it never creates one. Nothing was changed.",
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
    if (!plan) process.exit(1);
    plans.push(plan);
  }

  let changes = 0;
  for (const plan of plans) {
    console.log(`${plan.id}:`);
    for (const [field, value] of Object.entries(plan.set)) {
      console.log(`  set   ${field} = ${JSON.stringify(value)}`);
      changes++;
    }
    for (const field of plan.unset) {
      console.log(`  unset ${field} (will derive from foundedYear)`);
      changes++;
    }
    for (const field of plan.alreadyCorrect) {
      console.log(`  ok    ${field} — already correct, untouched`);
    }
  }

  if (changes === 0) {
    console.log("\nNothing to do — every field is already correct.");
    return;
  }

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/fix-site-settings-identity.ts -- --confirm",
    );
    return;
  }

  // One transaction, only the fields listed above, only on the siteSettings
  // ids. These are the script's only writes.
  let transaction = client.transaction();
  for (const plan of plans) {
    transaction = transaction.patch(plan.id, (patch) => {
      let next = patch;
      if (Object.keys(plan.set).length) next = next.set(plan.set);
      if (plan.unset.length) next = next.unset(plan.unset);
      return next;
    });
  }
  await transaction.commit();

  console.log(
    `\nDone. ${plans.map((plan) => plan.id).join(" and ")} corrected. Reload the ` +
      "site: the footer and contact page must show contact@fredsplumbing.com, " +
      "and every “Since …” badge must read 1996.",
  );
}

main().catch((error) => {
  console.error("fix-site-settings-identity failed:", error);
  process.exit(1);
});
