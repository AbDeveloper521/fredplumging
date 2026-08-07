/**
 * Removes the "Accessibility" link from the footer's legal row on the
 * published `navigation` document. Dry run:
 *   sanity exec scripts/remove-accessibility-link.ts
 * write pass (owner runs this after reading the plan):
 *   sanity exec scripts/remove-accessibility-link.ts -- --confirm
 *
 * ⚠️  BEFORE RUNNING --confirm: close (or hard-reload) every open Studio tab
 * showing the Navigation Menu. A stale tab that presses Publish afterwards
 * puts the link straight back.
 *
 * WHY A SCRIPT: the footer is CMS-driven. `data/navigation.ts` is only the
 * fallback, so deleting the link there does not remove it from the live site —
 * `navigation.legalLinks` in Sanity is what renders. The link pointed at
 * /accessibility, a route that never existed, so it was a 404 for every
 * visitor who clicked it.
 *
 * What it does, and ALL it can do: removes array members of
 * `navigation.legalLinks` whose href is exactly "/accessibility", on
 * `navigation` and `drafts.navigation` when a draft exists. It touches no
 * other field, no other document, and no other link. If a target document has
 * no such member, it reports and changes nothing.
 *
 * Alternative without this script: /studio → Navigation Menu → Footer legal
 * links → delete the "Accessibility" row → Publish.
 *
 * THIS SCRIPT MUST NEVER DELETE A DOCUMENT OR ASSET — it only unsets one
 * array member, under any flag.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";

type Raw = Record<string, unknown>;

const DEAD_HREF = "/accessibility";

interface Plan {
  id: string;
  /** The _keys being removed, for the printed plan. */
  keys: string[];
  labels: string[];
}

function planFor(id: string, doc: Raw): Plan | null {
  const links = doc.legalLinks;
  if (!Array.isArray(links)) {
    console.log(`${id}: no legalLinks array — nothing to remove.`);
    return null;
  }
  const matches = links.filter(
    (entry): entry is Raw =>
      Boolean(entry) &&
      typeof entry === "object" &&
      (entry as Raw).href === DEAD_HREF,
  );
  if (matches.length === 0) {
    console.log(`${id}: no "${DEAD_HREF}" link present — nothing to remove.`);
    return null;
  }
  const keys = matches.map((entry) =>
    typeof entry._key === "string" ? entry._key : "",
  );
  if (keys.some((key) => key === "")) {
    console.error(
      `STOP: a matching link on ${id} has no _key, so it cannot be targeted ` +
        "precisely. Remove it in /studio instead. Nothing was changed.",
    );
    process.exit(1);
  }
  return {
    id,
    keys,
    labels: matches.map((entry) =>
      typeof entry.label === "string" ? entry.label : "(no label)",
    ),
  };
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
    "⚠️  Close or hard-reload any open Studio tab showing the Navigation Menu " +
      "before --confirm — a stale tab pressing Publish afterwards restores the " +
      "link.\n",
  );

  const [doc, draft] = await Promise.all([
    client.fetch<Raw | null>(`*[_id == "navigation"][0]{legalLinks}`),
    client.fetch<Raw | null>(`*[_id == "drafts.navigation"][0]{legalLinks}`),
  ]);

  const plans: Plan[] = [];
  for (const [id, source] of [
    ["navigation", doc],
    ["drafts.navigation", draft],
  ] as const) {
    if (!source) continue;
    const plan = planFor(id, source);
    if (plan) plans.push(plan);
  }

  if (plans.length === 0) {
    console.log("\nNothing to do.");
    return;
  }

  console.log("\nWhat will be removed:");
  for (const plan of plans) {
    plan.keys.forEach((key, i) => {
      console.log(
        `  ${plan.id}: legalLinks[_key=="${key}"] — "${plan.labels[i]}" → ${DEAD_HREF}`,
      );
    });
  }

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/remove-accessibility-link.ts -- --confirm",
    );
    return;
  }

  let transaction = client.transaction();
  for (const plan of plans) {
    transaction = transaction.patch(plan.id, (patch) =>
      patch.unset(plan.keys.map((key) => `legalLinks[_key=="${key}"]`)),
    );
  }
  await transaction.commit();

  console.log(
    `\nDone. ${plans.map((plan) => plan.id).join(" and ")} updated. Reload any ` +
      "page — the footer's bottom row must show Privacy Policy and Terms of " +
      "Service only, with no stray separator.",
  );
}

main().catch((error) => {
  console.error("remove-accessibility-link failed:", error);
  process.exit(1);
});
