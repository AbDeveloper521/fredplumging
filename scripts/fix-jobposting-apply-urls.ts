/**
 * Repoints `jobPosting.applyUrl` values that still name the old Vercel
 * deployment alias at the canonical domain. Dry run:
 *   sanity exec scripts/fix-jobposting-apply-urls.ts
 * write pass (owner runs this after reading the plan):
 *   sanity exec scripts/fix-jobposting-apply-urls.ts -- --confirm
 *
 * ⚠️  BEFORE RUNNING --confirm: close (or hard-reload) every open Studio tab
 * showing a Job Posting. A stale tab that presses Publish afterwards writes
 * the old URL straight back.
 *
 * WHY A SCRIPT: this one is NOT in the repo. The domain sweep replaced every
 * hardcoded reference in the codebase, but these three values live in Sanity,
 * so a grep over the working tree cannot see them — they were found by
 * grepping the PRERENDERED BUILD OUTPUT, which is the only place the CMS
 * content and the code meet. All three roles' "Apply Now" button currently
 * sends a real job applicant to
 *   https://fredplumging.vercel.app/contact
 * i.e. off the live domain and onto the deployment alias. `proxy.ts` now
 * 308s that alias back, so the click survives — but a public-facing button
 * should not depend on a redirect to reach its own site.
 *
 * WHAT IT DOES, and all it can do: for every `jobPosting` (and its draft),
 * where `applyUrl` is an absolute URL whose host is NOT the canonical one,
 * it rewrites ONLY the host, preserving path, query and fragment exactly.
 * It touches no other field and no other document type. A posting with no
 * `applyUrl`, or one already on the canonical host, is reported and skipped.
 *
 * ⚠️  A JUDGEMENT CALL LEFT TO THE OWNER: `applyUrl` is described in the
 * schema as "An external application page (e.g. a job board)" and it WINS
 * over the mailto fallback in `applyHref()` (data/jobs.ts). These three
 * values are not external job boards — they are internal links to this
 * site's own /contact page. If applications are meant to arrive by email
 * (the documented design: there is no application form on this site), the
 * right fix is to CLEAR `applyUrl` on all three so each role falls back to
 * its mailto. This script deliberately does NOT do that — clearing a field
 * is a content decision. It only stops the button pointing at the wrong
 * host. To clear them instead: /studio → Careers → each role → empty the
 * "Application link" field → Publish.
 *
 * THIS SCRIPT MUST NEVER DELETE A DOCUMENT OR ASSET, and must never unset a
 * field, under any flag — it only rewrites the host inside an existing URL.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import { SITE_URL } from "../lib/siteUrl";

interface Posting {
  _id: string;
  title?: string;
  applyUrl?: string;
}

interface Plan {
  id: string;
  title: string;
  from: string;
  to: string;
}

const CANONICAL = new URL(SITE_URL);

/**
 * Returns the corrected URL, or null when nothing needs changing. Anything
 * that is not a parseable absolute http(s) URL is left strictly alone — a
 * value this script cannot understand is a value it must not rewrite.
 */
function repoint(value: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (parsed.host === CANONICAL.host && parsed.protocol === CANONICAL.protocol) {
    return null;
  }
  parsed.protocol = CANONICAL.protocol;
  parsed.host = CANONICAL.host;
  return parsed.toString();
}

async function main() {
  const confirm = process.argv.includes("--confirm");

  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (confirm && !writeToken) {
    console.error(
      "SANITY_API_WRITE_TOKEN is not set (Editor scope, .env.local).",
    );
    process.exit(1);
  }
  const client = getCliClient({ apiVersion: "2026-07-01" }).withConfig({
    ...(writeToken ? { token: writeToken } : {}),
    useCdn: false,
  });
  const { projectId, dataset } = client.config();
  console.log(
    `${confirm ? "WRITE PASS" : "DRY RUN"} against ${projectId}/${dataset}`,
  );
  console.log(`Canonical origin: ${CANONICAL.origin}\n`);
  console.log(
    "⚠️  Close or hard-reload any open Studio tab showing a Job Posting " +
      "before --confirm — a stale tab pressing Publish afterwards restores " +
      "the old URL.\n",
  );

  const postings = await client.fetch<Posting[]>(
    `*[_type == "jobPosting"]{_id, title, applyUrl}`,
  );

  if (postings.length === 0) {
    console.log("No jobPosting documents found. Nothing to do.");
    return;
  }

  const plans: Plan[] = [];
  for (const posting of postings) {
    const label = posting.title ?? "(untitled)";
    if (!posting.applyUrl) {
      console.log(`skip  ${posting._id} — no applyUrl (uses the mailto).`);
      continue;
    }
    const corrected = repoint(posting.applyUrl);
    if (!corrected) {
      console.log(
        `ok    ${posting._id} — already canonical or not a rewritable URL: ${posting.applyUrl}`,
      );
      continue;
    }
    plans.push({
      id: posting._id,
      title: label,
      from: posting.applyUrl,
      to: corrected,
    });
  }

  if (plans.length === 0) {
    console.log("\nNothing to do.");
    return;
  }

  console.log("\nWhat will change (applyUrl only):");
  for (const plan of plans) {
    console.log(`  ${plan.id} — ${plan.title}`);
    console.log(`      from: ${plan.from}`);
    console.log(`      to:   ${plan.to}`);
  }

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/fix-jobposting-apply-urls.ts -- --confirm",
    );
    return;
  }

  let transaction = client.transaction();
  for (const plan of plans) {
    transaction = transaction.patch(plan.id, (patch) =>
      patch.set({ applyUrl: plan.to }),
    );
  }
  await transaction.commit();

  console.log(
    `\nDone. ${plans.length} posting(s) updated. Reload /about/careers — every ` +
      `"Apply Now" button must point at ${CANONICAL.origin}/contact, with no ` +
      "cross-host redirect in the network tab.",
  );
}

main().catch((error) => {
  console.error("fix-jobposting-apply-urls failed:", error);
  process.exit(1);
});
