/**
 * Careers-phase sync — run with:  sanity exec scripts/seed-jobs.ts -- --confirm
 *
 * Surgical alternative to a full `npm run seed -- --force`: writes ONLY the
 * jobPosting documents from data/jobs.ts (and removes stale ones), leaving
 * every other document type untouched.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope), same as seed-content.ts.
 */
import { getCliClient } from "sanity/cli";
import { jobPostings } from "../data/jobs";

async function main() {
  if (!process.argv.includes("--confirm")) {
    console.error(
      "This rewrites the jobPosting collection.\n" +
        "Re-run with:  sanity exec scripts/seed-jobs.ts -- --confirm",
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

  jobPostings.forEach((job, i) => {
    tx.createOrReplace({
      _id: `jobPosting-${job.slug}`,
      _type: "jobPosting",
      title: job.title,
      slug: { _type: "slug", current: job.slug },
      employmentType: job.employmentType,
      ...(job.team ? { team: job.team } : {}),
      ...(job.shift ? { shift: job.shift } : {}),
      ...(job.openings ? { openings: job.openings } : {}),
      summary: job.summary,
      ...(job.responsibilities ? { responsibilities: [...job.responsibilities] } : {}),
      ...(job.requirements ? { requirements: [...job.requirements] } : {}),
      ...(job.compensationNote ? { compensationNote: job.compensationNote } : {}),
      ...(job.applyEmail ? { applyEmail: job.applyEmail } : {}),
      ...(job.applyUrl ? { applyUrl: job.applyUrl } : {}),
      ...(job.datePosted ? { datePosted: job.datePosted } : {}),
      ...(job.validThrough ? { validThrough: job.validThrough } : {}),
      open: job.open,
      order: (i + 1) * 10,
    });
  });

  const staleIds = await client.fetch<string[]>(
    `*[_type == "jobPosting" && !(_id in $ids)]._id`,
    { ids: jobPostings.map((job) => `jobPosting-${job.slug}`) },
  );
  staleIds.forEach((id) => tx.delete(id));

  await tx.commit();

  console.log(
    `✓ Synced careers content into project "${projectId}", dataset "${dataset}":\n` +
      `  ${jobPostings.length} job postings written, ${staleIds.length} stale deleted.\n\n` +
      `  Next: npm run check:drift   (jobs should print ✓)`,
  );
}

main().catch((error) => {
  console.error("seed-jobs failed:", error);
  process.exit(1);
});
