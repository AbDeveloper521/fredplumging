/** READ-ONLY diagnosis: full print of aboutPage + drafts.aboutPage, plus a
 * check that published section _type values match the schema type names. */
import { getCliClient } from "sanity/cli";

const EXPECTED_TYPES = [
  "aboutHero",
  "aboutStory",
  "aboutEvolution",
  "valuesGrid",
  "pageLinks",
  "homeFinalCta",
];

const client = process.env.SANITY_API_READ_TOKEN
  ? getCliClient({ apiVersion: "2026-07-01" }).withConfig({
      token: process.env.SANITY_API_READ_TOKEN,
      useCdn: false,
    })
  : getCliClient({ apiVersion: "2026-07-01" }).withConfig({ useCdn: false });

async function main() {
  const [doc, draft] = await Promise.all([
    client.fetch<Record<string, unknown> | null>(`*[_id == "aboutPage"][0]`),
    client.fetch<Record<string, unknown> | null>(`*[_id == "drafts.aboutPage"][0]`),
  ]);

  console.log("=== aboutPage (published) ===");
  console.log(doc ? JSON.stringify(doc, null, 2) : "(does not exist)");
  console.log("\n=== drafts.aboutPage ===");
  console.log(draft ? JSON.stringify(draft, null, 2) : "(does not exist)");

  if (doc && Array.isArray(doc.sections)) {
    const types = (doc.sections as Array<{ _type?: string }>).map(
      (section) => section._type ?? "(missing)",
    );
    console.log("\n=== published sections _type check ===");
    console.log(`found:    ${types.join(", ")}`);
    console.log(`expected: ${EXPECTED_TYPES.join(", ")}`);
    const unexpected = types.filter((type) => !EXPECTED_TYPES.includes(type));
    console.log(
      unexpected.length === 0
        ? "verdict: every _type matches a schema section type name."
        : `verdict: MISMATCH — not in schema: ${unexpected.join(", ")}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
