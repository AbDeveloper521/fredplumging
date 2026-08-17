/**
 * Seeds the `contactPage` document's `sections[]` with the default /contact
 * stack from data/contactPage.ts, VERBATIM — the same six bands the page
 * renders on the fallback path today. Dry run:
 *   npx sanity exec scripts/seed-contact-sections.ts
 * write pass (owner runs this after reading the plan):
 *   npx sanity exec scripts/seed-contact-sections.ts -- --confirm
 *
 * ⚠️  BEFORE RUNNING --confirm: close (or hard-reload) every open Studio tab
 * showing Contact Page. A stale tab holding an old draft that presses Publish
 * afterwards will overwrite the seeded document — this exact accident
 * happened with the About page.
 *
 * What it does, and ALL it can do:
 *  - Patches `contactPage`, and `drafts.contactPage` when a draft exists —
 *    same treatment, one transaction. When NO document exists at all it uses
 *    createIfNotExists({_id: "contactPage", _type: "contactPage"}) and then
 *    seeds it — creation, never replacement.
 *  - Unsets the FLAT FIELDS of the old hand-built Contact page (heroEyebrow,
 *    heroHeading, …) — but only after checking each one still holds exactly
 *    the copy that has been carried into the new stack. If ANY of them has
 *    been edited since, the script STOPS and prints the difference: those are
 *    the owner's words, and they must be moved into the matching section by
 *    hand rather than silently dropped.
 *  - `hours` moved to Site Settings → Opening hours, not into a section. It
 *    is checked and unset on the same terms as the rest.
 *
 * Refuses to run when a target document already has a non-empty `sections`
 * array (e.g. the Studio's initialValue prefill — in that case just press
 * Publish). Testimonials, services and city links stay COLLECTION-driven;
 * this script does not touch those document types.
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no other document types, under any flag.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import {
  contactPageDefaults,
  contactSectionsForSanity,
  defaultContactSections,
} from "../data/contactPage";
import { site } from "../data/site";
import type {
  ServiceFaqSection,
  ServiceHeroSection,
} from "../data/serviceSections";

type Raw = Record<string, unknown>;

const PUBLISHED_ID = "contactPage";
const DRAFT_ID = "drafts.contactPage";

/**
 * The old flat fields, each paired with the value the hand-built page shipped
 * — which is now carried by the section (or by Site Settings) named in the
 * note. Equal value ⇒ nothing is lost by unsetting it. Different value ⇒ the
 * owner edited it, and the script stops.
 */
function legacyExpectations(): Array<{
  field: string;
  expected: unknown;
  movedTo: string;
}> {
  const hero = defaultContactSections.find(
    (section): section is ServiceHeroSection & { hidden?: boolean } =>
      section._type === "serviceHero",
  );
  const faq = defaultContactSections.find(
    (section): section is ServiceFaqSection & { hidden?: boolean } =>
      section._type === "serviceFaq",
  );
  const channels = contactPageDefaults.channels;

  return [
    { field: "heroEyebrow", expected: hero?.eyebrow, movedTo: "the banner section's small label" },
    { field: "heroHeading", expected: hero?.heading, movedTo: "the banner section's big heading" },
    { field: "heroIntro", expected: hero?.subheading, movedTo: "the banner section's intro" },
    {
      field: "responsePromise",
      expected: contactPageDefaults.form.submitNote,
      movedTo: "the form section's “Line under the button” (and the quote card's text)",
    },
    {
      field: "hours",
      expected: site.hours.map((row) => ({ days: row.days, hours: row.hours })),
      movedTo: "Site Settings → Opening hours",
    },
    {
      field: "emergencyHeading",
      expected: channels.emergencyHeading,
      movedTo: "the call-us card's heading",
    },
    {
      field: "emergencyBody",
      expected: channels.emergencyBody,
      movedTo: "the call-us card's text",
    },
    {
      field: "faqs",
      expected: faq?.faqs.map((entry) => ({
        question: entry.question,
        answer: entry.answer,
      })),
      movedTo: "the Q&A section's questions",
    },
  ];
}

/** Compares ignoring `_key`s and undefined-vs-missing, like the drift check. */
function sameContent(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === undefined || a === null || b === undefined || b === null) {
    return false;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    return a.every((entry, i) => sameContent(entry, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const keysOf = (value: object) =>
      Object.keys(value as Raw)
        .filter((key) => !key.startsWith("_"))
        .sort();
    const aKeys = keysOf(a);
    const bKeys = keysOf(b);
    if (aKeys.join("|") !== bKeys.join("|")) return false;
    return aKeys.every((key) => sameContent((a as Raw)[key], (b as Raw)[key]));
  }
  return false;
}

function preview(value: unknown): string {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}

interface Plan {
  id: string;
  /** Legacy fields present and verified safe to unset. */
  unset: string[];
  /** True when the published document must be created first. */
  create: boolean;
}

/** Validates one existing document and returns its plan, or null to stop. */
function planFor(id: string, doc: Raw): Plan | null {
  const sections = doc.sections;
  if (Array.isArray(sections) && sections.length > 0) {
    console.error(
      `STOP: ${id} already has a non-empty sections array ` +
        `(${sections.length} item(s)). If that is the Studio's prefill, just ` +
        "press Publish — this script never merges into or overwrites " +
        "existing sections. Nothing was changed.",
    );
    return null;
  }

  const expectations = legacyExpectations();
  const known = new Set(expectations.map((entry) => entry.field));
  const fields = Object.keys(doc).filter((key) => !key.startsWith("_"));
  const unexpected = fields.filter(
    (field) => field !== "sections" && !known.has(field),
  );
  if (unexpected.length > 0) {
    console.error(
      `STOP: ${id} carries unexpected field(s): ${unexpected.join(", ")}. ` +
        "The document is not in the assumed shape — inspect it in /studio " +
        "first. Nothing was changed.",
    );
    return null;
  }

  const present = expectations.filter(
    (entry) => doc[entry.field] !== undefined && doc[entry.field] !== null,
  );
  const edited = present.filter((entry) => !sameContent(doc[entry.field], entry.expected));
  if (edited.length > 0) {
    console.error(
      `STOP: ${id} has old Contact-page field(s) whose text has been EDITED ` +
        "since this refactor's copy was taken. Removing them would discard " +
        "your wording, so nothing was changed. Copy each one into the place " +
        "listed, then re-run:\n" +
        edited
          .map(
            (entry) =>
              `  - ${entry.field}\n      currently: ${preview(doc[entry.field])}\n` +
              `      expected:  ${preview(entry.expected)}\n` +
              `      move it to: ${entry.movedTo}`,
          )
          .join("\n"),
    );
    return null;
  }

  console.log(
    `${id}: sections is ${Array.isArray(sections) ? "empty" : "absent"}; ` +
      (present.length
        ? `${present.length} old field(s) verified unchanged, will unset: ${present
            .map((entry) => entry.field)
            .join(", ")}`
        : "no old fields present"),
  );
  return { id, unset: present.map((entry) => entry.field), create: false };
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
    "⚠️  Close or hard-reload any open Studio tab showing Contact Page " +
      "before --confirm — a stale tab pressing Publish afterwards overwrites " +
      "the seeded document (this happened with the About page).\n",
  );

  const [doc, draft] = await Promise.all([
    client.fetch<Raw | null>(`*[_id == $id][0]`, { id: PUBLISHED_ID }),
    client.fetch<Raw | null>(`*[_id == $id][0]`, { id: DRAFT_ID }),
  ]);

  const plans: Plan[] = [];
  if (!doc && !draft) {
    console.log(
      "No contactPage document exists (published or draft) — the published " +
        "document will be CREATED and seeded. (Alternative without this " +
        "script: open Contact Page in /studio — it prefills with the same " +
        "stack — and press Publish.)",
    );
    plans.push({ id: PUBLISHED_ID, unset: [], create: true });
  } else {
    for (const [id, source] of [
      [PUBLISHED_ID, doc],
      [DRAFT_ID, draft],
    ] as const) {
      if (!source) continue;
      const plan = planFor(id, source);
      if (!plan) process.exit(1);
      plans.push(plan);
    }
  }

  const sections = contactSectionsForSanity();
  console.log("\nSections to seed, in order (banner photo slot stays empty):");
  sections.forEach((section, i) => {
    const fields = Object.keys(section).filter((key) => !key.startsWith("_"));
    console.log(
      `  ${i + 1}. ${section._type} (_key: ${section._key}) — ${fields.join(", ")}`,
    );
  });
  console.log(
    "\nNOT written here: the phone number, email, service area, licence and " +
      "opening hours — those live in Site Settings and are read at render time.",
  );
  console.log(
    `\nTargets: ${plans
      .map((plan) => `${plan.id}${plan.create ? " (will be created)" : ""}`)
      .join(", ")}`,
  );

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/seed-contact-sections.ts -- --confirm",
    );
    return;
  }

  // One transaction: create the published doc only if missing, then per
  // target set the stack and drop the verified-unchanged legacy fields.
  // These are the only writes in the script, and they target only the
  // contactPage ids.
  let transaction = client.transaction();
  for (const plan of plans) {
    if (plan.create) {
      transaction = transaction.createIfNotExists({
        _id: PUBLISHED_ID,
        _type: "contactPage",
      });
    }
    transaction = transaction.patch(plan.id, (patch) => {
      const withSections = patch.set({ sections });
      return plan.unset.length ? withSections.unset(plan.unset) : withSections;
    });
  }
  await transaction.commit();

  console.log(
    `\nDone. ${plans.map((plan) => plan.id).join(" and ")} now carr${plans.length === 1 ? "ies" : "y"} ` +
      "the default /contact stack. Hard-reload /studio (Contact Page shows the " +
      "six-section list, no 'Unknown fields found') and reload /contact — the " +
      "page must look unchanged, and the form must still submit.",
  );
}

main().catch((error) => {
  console.error("seed-contact-sections failed:", error);
  process.exit(1);
});
