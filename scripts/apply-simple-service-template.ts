/**
 * Applies the owner's simple reference layout to service pages — dry run:
 *   npx sanity exec scripts/apply-simple-service-template.ts
 * write pass (owner runs this after reading the plan):
 *   npx sanity exec scripts/apply-simple-service-template.ts -- --confirm
 *
 * What it does, and ALL it can do — it patches ONLY the `sections` array of
 * published `service` documents:
 *
 *  - The `plumbing` service gets the reference stack exactly as encoded in
 *    the data/services.ts fallback (hero → about → sub-service cards → trust
 *    → reviews → heritage → service area → badge strip). Image objects
 *    already uploaded on matching old sections travel VERBATIM into the
 *    corresponding new sections — asset refs, hotspot, crop and alt
 *    unchanged; no asset is touched. The existing client-reviews section is
 *    carried over whole (verbatim), not rewritten.
 *  - Every other service that has a `sections` array keeps the sections
 *    whose types are in the template's set, reordered into template order,
 *    text untouched. Sections outside the template (FAQ, process,
 *    comparison, …) are REMOVED from the array — the dry run lists exactly
 *    what content that is, per service, so the owner decides.
 *  - Services with no `sections` array (legacy body layout) are reported
 *    and left untouched.
 *  - A service with an open DRAFT is skipped (patching only the published
 *    version would let the draft overwrite the change on the next Publish —
 *    discard or publish the draft in /studio first, then re-run).
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING ELSE — no document deletes, no
 * asset operations, no other document types, no other fields, under any
 * flag. (Removed sections stay recoverable via the document history in
 * /studio until then.)
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import { services as fallbackServices } from "../data/services";

type Raw = Record<string, unknown>;

/**
 * The template's section types and their slot order. `serviceAbout` fills
 * two slots: the first occurrence is the About band (slot 1), any later one
 * is the heritage band (slot 5).
 */
const SLOT_OF: Record<string, number | ((occurrence: number) => number)> = {
  serviceHero: 0,
  serviceAbout: (occurrence) => (occurrence === 0 ? 1 : 5),
  propertyTypes: 2,
  serviceTrust: 3,
  serviceTestimonials: 4,
  serviceArea: 6,
  trustLogoStrip: 7,
};

/** Child array members need `_type` in Sanity; the fallback data omits it. */
const CHILD_TYPE: Record<string, string> = {
  credentials: "credential",
  items: "item",
  cards: "card",
  steps: "step",
  rows: "row",
  faqs: "faq",
};

function slotIndex(type: string, occurrence: number): number | undefined {
  const slot = SLOT_OF[type];
  if (slot === undefined) return undefined;
  return typeof slot === "function" ? slot(occurrence) : slot;
}

/** Converts a fallback section (data/services.ts) into a Sanity-shaped one. */
function toSanitySection(section: Raw): Raw {
  const out: Raw = {};
  for (const [field, value] of Object.entries(section)) {
    if (value === undefined) continue;
    const childType = CHILD_TYPE[field];
    out[field] =
      childType && Array.isArray(value)
        ? value.map((child) =>
            child && typeof child === "object"
              ? { _type: childType, ...(child as Raw) }
              : child,
          )
        : value;
  }
  return out;
}

/** First occurrence of a section type in a raw stack. */
function findByType(sections: Raw[], type: string, skip = 0): Raw | undefined {
  let seen = 0;
  for (const section of sections) {
    if (section._type === type) {
      if (seen === skip) return section;
      seen += 1;
    }
  }
  return undefined;
}

/** Image asset _refs anywhere inside a value, for the dry-run print. */
function assetRefs(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((entry) => assetRefs(entry, out));
  } else if (value && typeof value === "object") {
    const obj = value as Raw;
    const asset = obj.asset as Raw | undefined;
    if (asset && typeof asset === "object" && typeof asset._ref === "string") {
      out.push(asset._ref);
    }
    for (const inner of Object.values(obj)) assetRefs(inner, out);
  }
  return out;
}

/**
 * Prints every user-facing string in a section, so the dry run shows
 * EXACTLY what content a removal would take with it. Technical fields
 * (keys, icons, links, toggles) are skipped; images print as their refs.
 */
const SILENT_FIELDS = new Set([
  "icon",
  "slug",
  "href",
  "linkLabel",
  "ctaHref",
  "secondaryCtaHref",
  "background",
  "showLogos",
  "showAvailabilityDot",
  "filterTags",
  "limit",
  "serviceSlugs",
  "frameRatio",
]);

function printContent(value: unknown, indent: string): void {
  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry === "string") console.log(`${indent}- ${JSON.stringify(entry)}`);
      else if (entry && typeof entry === "object") {
        console.log(`${indent}-`);
        printContent(entry, `${indent}  `);
      }
    }
    return;
  }
  if (!value || typeof value !== "object") return;
  const obj = value as Raw;
  if (obj.asset) {
    const refs = assetRefs(obj);
    console.log(`${indent}(image: ${refs.join(", ") || "?"}, alt: ${JSON.stringify(obj.alt ?? null)})`);
    return;
  }
  for (const [field, inner] of Object.entries(obj)) {
    if (field.startsWith("_") || SILENT_FIELDS.has(field)) continue;
    if (typeof inner === "string") {
      console.log(`${indent}${field}: ${JSON.stringify(inner)}`);
    } else if (inner && typeof inner === "object") {
      console.log(`${indent}${field}:`);
      printContent(inner, `${indent}  `);
    }
  }
}

function heading(section: Raw): string {
  return typeof section.heading === "string" ? JSON.stringify(section.heading) : "(no heading)";
}

function label(section: Raw): string {
  return `${String(section._type)} (${String(section._key ?? "?")}) ${heading(section)}`;
}

/** Builds plumbing's new stack from the fallback, carrying uploaded images. */
function buildPlumbingStack(oldSections: Raw[]): { stack: Raw[]; carried: string[] } {
  const fallback = fallbackServices.find((s) => s.slug === "plumbing")?.sections;
  if (!fallback) throw new Error("data/services.ts no longer carries the plumbing template stack.");

  const carried: string[] = [];
  const stack = fallback.map((section) => toSanitySection(section as unknown as Raw));

  // The reviews section is an untouched system: carry the live one whole.
  const oldReviews = findByType(oldSections, "serviceTestimonials");
  const reviewsIndex = stack.findIndex((s) => s._type === "serviceTestimonials");
  if (oldReviews && reviewsIndex !== -1) {
    stack[reviewsIndex] = oldReviews;
    carried.push(`serviceTestimonials carried verbatim (heading ${heading(oldReviews)})`);
  }

  // Uploaded photos travel verbatim into the same slot of the new stack:
  // old hero → new hero, first old About → new About band, second old About
  // → heritage band, old service-area → new service-area.
  const carryPhoto = (
    from: Raw | undefined,
    field: "photo" | "photoPrimary",
    toKey: string,
  ) => {
    const image = from?.[field];
    if (!image || typeof image !== "object") return;
    const target = stack.find((s) => s._key === toKey);
    if (!target) return;
    target[field] = image;
    carried.push(
      `${field} → ${toKey}: ${assetRefs(image).join(", ") || "(no asset)"} (alt ${JSON.stringify((image as Raw).alt ?? null)})`,
    );
  };
  carryPhoto(findByType(oldSections, "serviceHero"), "photo", "tpl-hero");
  carryPhoto(findByType(oldSections, "serviceAbout"), "photoPrimary", "tpl-about");
  carryPhoto(findByType(oldSections, "serviceAbout", 1), "photoPrimary", "tpl-heritage");
  carryPhoto(findByType(oldSections, "serviceArea"), "photo", "tpl-area");

  return { stack, carried };
}

/** Reorders another service's stack into template order; returns the plan. */
function buildTemplateOrder(oldSections: Raw[]): {
  kept: Raw[];
  removed: Raw[];
  reordered: boolean;
} {
  const occurrences = new Map<string, number>();
  const kept: Array<{ section: Raw; slot: number; index: number }> = [];
  const removed: Raw[] = [];

  oldSections.forEach((section, index) => {
    const type = String(section._type ?? "unknown");
    const occurrence = occurrences.get(type) ?? 0;
    occurrences.set(type, occurrence + 1);
    const slot = slotIndex(type, occurrence);
    if (slot === undefined) removed.push(section);
    else kept.push({ section, slot, index });
  });

  const sorted = [...kept].sort((a, b) => a.slot - b.slot || a.index - b.index);
  const reordered = sorted.some((entry, i) => entry.section !== kept[i]?.section);
  return { kept: sorted.map((entry) => entry.section), removed, reordered };
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
  console.log(`${confirm ? "WRITE PASS" : "DRY RUN"} against ${projectId}/${dataset}\n`);

  const [docs, draftIds] = await Promise.all([
    client.fetch<Raw[]>(
      `*[_type == "service" && !(_id in path("drafts.**"))] | order(order asc){ _id, title, "slug": slug.current, sections }`,
    ),
    client.fetch<string[]>(`*[_type == "service" && _id in path("drafts.**")]._id`),
  ]);
  const drafted = new Set(draftIds.map((id) => id.replace(/^drafts\./, "")));

  const patches: Array<{ id: string; slug: string; sections: Raw[] }> = [];

  for (const doc of docs) {
    const id = String(doc._id);
    const slug = String(doc.slug ?? "?");
    console.log(`━━ service "${slug}" (${id})`);

    if (drafted.has(id)) {
      console.log(
        "   SKIPPED: an open DRAFT of this service exists. Patching only the\n" +
          "   published version would let the draft overwrite this change on the\n" +
          "   next Publish. Discard or publish the draft in /studio, then re-run.\n",
      );
      continue;
    }

    const oldSections = Array.isArray(doc.sections) ? (doc.sections as Raw[]) : null;
    if (!oldSections || oldSections.length === 0) {
      console.log("   no section stack — legacy body layout. Left untouched.\n");
      continue;
    }

    if (slug === "plumbing") {
      const { stack, carried } = buildPlumbingStack(oldSections);
      if (JSON.stringify(stack) === JSON.stringify(oldSections)) {
        console.log("   already matches the reference template stack — no write needed.\n");
        continue;
      }
      console.log("   REPLACED with the reference template stack:");
      stack.forEach((section, i) => console.log(`     ${i + 1}. ${label(section)}`));
      console.log("   images / sections carried over from the current document:");
      for (const line of carried) console.log(`     • ${line}`);
      if (carried.length === 0) console.log("     (none found to carry)");
      console.log(
        "   card links: “Slab Leak Repair” and “Piping Services” have no matching\n" +
          "   page on the site, so those cards point at /contact;\n" +
          "   “Commercial Installs & Replacements” points at /services/commercial-plumbing.",
      );
      console.log("   current sections being replaced or removed — their content, exactly:");
      for (const section of oldSections) {
        const survives =
          section === findByType(oldSections, "serviceTestimonials")
            ? " (carried verbatim)"
            : "";
        console.log(`     ✗ ${label(section)}${survives}`);
        if (!survives) printContent(section, "        ");
      }
      patches.push({ id, slug, sections: stack });
      console.log("");
      continue;
    }

    const { kept, removed, reordered } = buildTemplateOrder(oldSections);
    console.log(`   keeps (${kept.length}) in template order:`);
    kept.forEach((section, i) => console.log(`     ${i + 1}. ${label(section)}`));
    console.log(
      reordered
        ? "   reorders: yes — kept sections move into the template order above."
        : "   reorders: none — kept sections already follow the template order.",
    );
    if (removed.length > 0) {
      console.log(`   would REMOVE (${removed.length}) — their content, exactly:`);
      for (const section of removed) {
        console.log(`     ✗ ${label(section)}`);
        printContent(section, "        ");
      }
    } else {
      console.log("   would remove: nothing — every section fits the template.");
    }

    if (removed.length === 0 && !reordered) {
      console.log("   already matches the template — no write needed.\n");
      continue;
    }
    patches.push({ id, slug, sections: kept });
    console.log("");
  }

  if (patches.length === 0) {
    console.log("Nothing to change — every service already matches the template.");
    return;
  }

  console.log(`${"═".repeat(72)}`);
  console.log(`${patches.length} service document(s) would be patched: ${patches.map((p) => p.slug).join(", ")}`);

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/apply-simple-service-template.ts -- --confirm",
    );
    return;
  }

  // One transaction; each patch sets only that document's `sections` array.
  let transaction = client.transaction();
  for (const patch of patches) {
    transaction = transaction.patch(patch.id, (p) => p.set({ sections: patch.sections }));
  }
  await transaction.commit();

  console.log(
    "\nDone. Check /services/plumbing and the other service pages, and open\n" +
      "each service in /studio — removed content stays recoverable via the\n" +
      "document history there.",
  );
}

main().catch((error) => {
  console.error("apply-simple-service-template failed:", error);
  process.exit(1);
});
