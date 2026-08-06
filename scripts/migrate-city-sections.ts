/**
 * One-time migration of the `cityPage` documents (BOTH slugs: dallas,
 * fort-worth) from the old fixed-field shape (heroHeading, serviceCards, …)
 * to the section-stack shape (`sections[]`) — dry run:
 *   npx sanity exec scripts/migrate-city-sections.ts
 * write pass (owner runs this after reading the plan):
 *   npx sanity exec scripts/migrate-city-sections.ts -- --confirm
 *
 * ⚠️  BEFORE RUNNING --confirm: close (or hard-reload) every open Studio tab
 * showing a City Page. A stale tab holding an old draft that presses
 * Publish afterwards will overwrite the migrated document — this exact
 * accident happened with the About page.
 *
 * What it does, and ALL it can do:
 *  - Handles the published AND draft document of BOTH slugs in ONE run and
 *    ONE transaction (up to four patches), so an open draft can never
 *    overwrite the migration on the next Publish.
 *  - A document with old-shape fields keeps its OWN values: text fields are
 *    copied VERBATIM under their new names (heroHeading → the hero's
 *    heading, serviceCards → the card band's cards, and so on), and image
 *    objects travel unchanged — asset refs, hotspot, crop and alt; no asset
 *    is touched. The same patch `unset`s the old top-level fields that were
 *    copied, so the Studio's "Unknown fields found" warnings disappear.
 *  - Structure the old shape never stored (the hero eyebrow, card
 *    photo-slot subjects, the Contact Us buttons on the dark bands) comes
 *    from that slug's fallback stack in data/cities.ts — dressing, not
 *    copy; the plan prints which values came from the document and which
 *    from the fallback.
 *  - `showLogoStrip` is consumed without a new home: the vendor strip is
 *    retired, and the certification-badge strip + map band now close every
 *    city page automatically (template-rendered, not stack items).
 *  - A slug with NO document at all gets its published document CREATED
 *    (createIfNotExists) and seeded whole from the fallback stack — city,
 *    slug, SEO fields and sections. An existing but empty document is
 *    seeded the same way via patch.
 *  - Old fields with no home in the new shape are left alone and reported,
 *    never guessed at. Documents for slugs outside data/cities.ts are
 *    reported and skipped.
 *
 * Refuses to run when a target document already has a non-empty `sections`
 * array (someone started re-entering by hand — nothing may overwrite newer
 * work).
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no other document types, under any flag.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import { serviceSectionTypes } from "../sanity/schemas/serviceSections";
import { citySectionTypes } from "../sanity/schemas/cityPage";
import { cities, type CityPageContent } from "../data/cities";
import type { LibrarySection } from "../data/sectionLibrary";

type Raw = Record<string, unknown>;

/** Every old top-level field the migration consumes (the unset list). */
const OLD_FIELDS = [
  "heroHeading",
  "heroIntro",
  "servicesHeading",
  "serviceCards",
  "whyChooseHeading",
  "whyChooseBody",
  "reviewsHeading",
  "heritageHeading",
  "heritageParagraphs",
  "heritagePhoto",
  "heritagePhotoSubject",
  "communitiesHeading",
  "communitiesBody",
  "communities",
  "showLogoStrip",
] as const;

/** Fields that stay on the document in the new shape. */
const KEPT_FIELDS = ["city", "slug", "seoTitle", "seoDescription", "sections"];

/** Field names each stack section type accepts — from the schemas themselves. */
const SCHEMA_FIELDS: Record<string, string[]> = Object.fromEntries(
  [...serviceSectionTypes, ...citySectionTypes].map((type) => [
    type.name,
    ((type as { fields?: Array<{ name: string }> }).fields ?? []).map(
      (field) => field.name,
    ),
  ]),
);

/** Array fields inside sections whose object members need _type in Sanity. */
const CHILD_TYPE: Record<string, string> = {
  cards: "card",
  credentials: "credential",
};

const filled = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

function stringsOf(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const list = value.filter(filled);
  return list.length > 0 ? list : undefined;
}

/** Collects every image asset _ref inside a value, for the dry-run print. */
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

/** Sanity-shapes a fallback section: strip undefineds, add child _types. */
function toSanitySection(section: LibrarySection): Raw {
  const out = JSON.parse(JSON.stringify(section)) as Raw;
  delete out.hidden;
  for (const [field, childType] of Object.entries(CHILD_TYPE)) {
    const value = out[field];
    if (!Array.isArray(value)) continue;
    out[field] = value.map((entry, i) =>
      entry && typeof entry === "object" && !Array.isArray(entry)
        ? { _type: childType, _key: (entry as Raw)._key ?? `${out._key}-${field}-${i}`, ...(entry as Raw) }
        : entry,
    );
  }
  return out;
}

/** The fallback stack's section of a type by occurrence (0-based). */
function fallbackSection<T extends LibrarySection["_type"]>(
  fb: CityPageContent,
  type: T,
  occurrence = 0,
): Extract<LibrarySection, { _type: T }> {
  const matches = fb.sections.filter((section) => section._type === type);
  const section = matches[occurrence] ?? matches[0];
  if (!section) throw new Error(`fallback stack for "${fb.slug}" has no ${type} #${occurrence}`);
  return section as Extract<LibrarySection, { _type: T }>;
}

interface BuiltSection {
  section: Raw;
  /** Which old document fields fed this section (for the plan print). */
  fromDoc: string[];
}

/**
 * Builds the six-band reference stack for one document: the document's own
 * old-shape values verbatim wherever they exist, that slug's fallback copy
 * for whatever is missing, fallback-only dressing (eyebrow, photo-slot
 * subjects, CTA buttons) throughout.
 */
function buildStack(doc: Raw, fb: CityPageContent): BuiltSection[] {
  const built: BuiltSection[] = [];
  const push = (section: Raw, fromDoc: string[]) => built.push({ section, fromDoc });

  // 1. Hero — old heroHeading/heroIntro; eyebrow + photo subject are new dressing.
  {
    const fbHero = toSanitySection(fallbackSection(fb, "serviceHero"));
    const fromDoc: string[] = [];
    if (filled(doc.heroHeading)) {
      fbHero.heading = doc.heroHeading;
      fromDoc.push("heroHeading → heading");
    }
    if (filled(doc.heroIntro)) {
      fbHero.subheading = doc.heroIntro;
      fromDoc.push("heroIntro → subheading");
    }
    push(fbHero, fromDoc);
  }

  // 2. Service cards — old serviceCards become the card band's cards; the
  //    photo-slot subject comes from the fallback card with the same link.
  {
    const fbCards = toSanitySection(fallbackSection(fb, "propertyTypes"));
    const fromDoc: string[] = [];
    if (filled(doc.servicesHeading)) {
      fbCards.heading = doc.servicesHeading;
      fromDoc.push("servicesHeading → heading");
    }
    if (Array.isArray(doc.serviceCards) && doc.serviceCards.length > 0) {
      const fbByHref = new Map(
        (fbCards.cards as Raw[]).map((card) => [card.href, card]),
      );
      fbCards.cards = (doc.serviceCards as Raw[]).flatMap((card, i) => {
        if (!card || typeof card !== "object") return [];
        const twin = fbByHref.get(card.href) as Raw | undefined;
        return [
          {
            _type: "card",
            _key: card._key ?? `card-${i}`,
            title: card.title,
            blurb: card.description,
            href: card.href,
            ...(filled(card.icon) ? { icon: card.icon } : {}),
            linkLabel: "Get Started",
            ...(twin?.photoSubject ? { photoSubject: twin.photoSubject } : {}),
          },
        ];
      });
      fromDoc.push("serviceCards → cards (description → blurb, verbatim)");
    }
    push(fbCards, fromDoc);
  }

  // 3. Why choose us — dark About band; CTA + photo subject from fallback.
  {
    const fbWhy = toSanitySection(fallbackSection(fb, "serviceAbout", 0));
    const fromDoc: string[] = [];
    if (filled(doc.whyChooseHeading)) {
      fbWhy.heading = doc.whyChooseHeading;
      fromDoc.push("whyChooseHeading → heading");
    }
    if (filled(doc.whyChooseBody)) {
      fbWhy.paragraphs = [doc.whyChooseBody];
      fromDoc.push("whyChooseBody → paragraphs");
    }
    push(fbWhy, fromDoc);
  }

  // 4. Reviews — collection-driven; only the heading migrates.
  {
    const fbReviews = toSanitySection(fallbackSection(fb, "serviceTestimonials"));
    const fromDoc: string[] = [];
    if (filled(doc.reviewsHeading)) {
      fbReviews.heading = doc.reviewsHeading;
      fromDoc.push("reviewsHeading → heading");
    }
    push(fbReviews, fromDoc);
  }

  // 5. Heritage — dark collage band; the uploaded photo travels VERBATIM.
  {
    const fbHeritage = toSanitySection(fallbackSection(fb, "serviceAbout", 1));
    const fromDoc: string[] = [];
    if (filled(doc.heritageHeading)) {
      fbHeritage.heading = doc.heritageHeading;
      fromDoc.push("heritageHeading → heading");
    }
    const paragraphs = stringsOf(doc.heritageParagraphs);
    if (paragraphs) {
      fbHeritage.paragraphs = paragraphs;
      fromDoc.push("heritageParagraphs → paragraphs");
    }
    if (doc.heritagePhoto && typeof doc.heritagePhoto === "object") {
      fbHeritage.photoPrimary = doc.heritagePhoto;
      fromDoc.push("heritagePhoto → photoPrimary (image object verbatim)");
    }
    if (filled(doc.heritagePhotoSubject)) {
      fbHeritage.photoSubjectPrimary = doc.heritagePhotoSubject;
      fromDoc.push("heritagePhotoSubject → photoSubjectPrimary");
    }
    push(fbHeritage, fromDoc);
  }

  // 6. Communities — city-specific band; photo-slot subjects + CTA from fallback.
  {
    const fbCommunities = toSanitySection(fallbackSection(fb, "cityCommunities"));
    const fromDoc: string[] = [];
    if (filled(doc.communitiesHeading)) {
      fbCommunities.heading = doc.communitiesHeading;
      fromDoc.push("communitiesHeading → heading");
    }
    if (filled(doc.communitiesBody)) {
      fbCommunities.body = doc.communitiesBody;
      fromDoc.push("communitiesBody → body");
    }
    const communities = stringsOf(doc.communities);
    if (communities) {
      fbCommunities.communities = communities;
      fromDoc.push("communities → communities");
    }
    push(fbCommunities, fromDoc);
  }

  return built;
}

/** STOPs (returns false) when a built section carries a field its schema lacks. */
function validateAgainstSchema(id: string, sections: Raw[]): boolean {
  for (const section of sections) {
    const allowed = SCHEMA_FIELDS[String(section._type)];
    if (!allowed) {
      console.error(`STOP: built a section of unknown type "${String(section._type)}" for ${id}.`);
      return false;
    }
    const unknown = Object.keys(section).filter(
      (key) => !key.startsWith("_") && !allowed.includes(key),
    );
    if (unknown.length > 0) {
      console.error(
        `STOP: built "${String(section._type)}" for ${id} with field(s) the schema ` +
          `does not define: ${unknown.join(", ")}. Nothing was changed.`,
      );
      return false;
    }
  }
  return true;
}

interface Plan {
  id: string;
  /** True when the published document must be created first. */
  create: boolean;
  /** Document values set on creation (city, slug, SEO). */
  createValues?: Raw;
  sections: Raw[];
  unset: string[];
  seo?: { seoTitle?: string; seoDescription?: string };
}

/** Plans one existing document; null stops the whole run. */
function planFor(id: string, doc: Raw, fb: CityPageContent): Plan | null {
  const existing = doc.sections;
  if (Array.isArray(existing) && existing.length > 0) {
    console.error(
      `STOP: ${id} already has a non-empty sections array ` +
        `(${existing.length} item(s)) — someone has started building the new ` +
        "structure. This script never merges into or overwrites that work. " +
        "Nothing was changed.",
    );
    return null;
  }

  const oldFieldsPresent = OLD_FIELDS.filter(
    (field) => doc[field] !== undefined && doc[field] !== null,
  );
  const unexpected = Object.keys(doc).filter(
    (key) =>
      !key.startsWith("_") &&
      !KEPT_FIELDS.includes(key) &&
      !(OLD_FIELDS as readonly string[]).includes(key),
  );

  const built = buildStack(doc, fb);
  const sections = built.map((entry) => entry.section);
  if (!validateAgainstSchema(id, sections)) return null;

  console.log(`Planned sections[] for ${id} (reference band order):\n`);
  built.forEach((entry, i) => {
    const refs = assetRefs(entry.section);
    console.log(
      `  ${i + 1}. ${entry.section._type} (_key: ${entry.section._key})` +
        (entry.fromDoc.length
          ? `\n     from the document: ${entry.fromDoc.join(", ")}`
          : "\n     (no old field present — seeded from data/cities.ts)") +
        (refs.length ? `\n     images preserved: ${refs.join(", ")}` : ""),
    );
  });
  console.log(
    `\n  Old fields to unset on ${id} after copying: ` +
      (oldFieldsPresent.join(", ") || "(none present)"),
  );
  if (oldFieldsPresent.includes("showLogoStrip")) {
    console.log(
      "  (showLogoStrip has no new home by design — the vendor strip is " +
        "retired; the badge strip + map band now render automatically.)",
    );
  }
  if (unexpected.length > 0) {
    console.log(
      "  Fields with NO home in the new shape (left alone, not guessed at): " +
        unexpected.join(", "),
    );
  }
  console.log("");

  return { id, create: false, sections, unset: [...oldFieldsPresent] };
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
    // Drafts must be visible: an open draft left unmigrated would overwrite
    // the migration on its next Publish.
    perspective: "raw",
  });
  const { projectId, dataset } = client.config();
  console.log(
    `${confirm ? "WRITE PASS" : "DRY RUN"} against ${projectId}/${dataset}\n`,
  );
  console.log(
    "⚠️  Close or hard-reload any open Studio tab showing a City Page " +
      "before --confirm — a stale tab pressing Publish afterwards overwrites " +
      "the migrated document (this happened with the About page).\n",
  );

  const docs = await client.fetch<Raw[]>(`*[_type == "cityPage"]`);
  const bySlug = (slug: string) =>
    docs.filter(
      (doc) =>
        ((doc.slug as Raw | undefined)?.current ?? undefined) === slug,
    );
  const knownSlugs = cities.map((city) => city.slug);
  const strays = docs.filter(
    (doc) =>
      !knownSlugs.includes(
        String((doc.slug as Raw | undefined)?.current ?? ""),
      ),
  );
  for (const stray of strays) {
    console.warn(
      `⚠️  ${String(stray._id)} has slug "${String((stray.slug as Raw | undefined)?.current)}" ` +
        "with no entry in data/cities.ts — skipped, nothing changed on it.",
    );
  }

  const plans: Plan[] = [];
  for (const fb of cities) {
    const matches = bySlug(fb.slug);
    const published = matches.find((doc) => !String(doc._id).startsWith("drafts."));
    const draft = matches.find((doc) => String(doc._id).startsWith("drafts."));

    if (!published && !draft) {
      const sections = fb.sections.map(toSanitySection);
      if (!validateAgainstSchema(`cityPage-${fb.slug}`, sections)) process.exit(1);
      console.log(
        `No cityPage document exists for "${fb.slug}" (published or draft) — ` +
          `the published document will be CREATED (_id: cityPage-${fb.slug}) ` +
          "and seeded whole from data/cities.ts:\n",
      );
      sections.forEach((section, i) => {
        const fields = Object.keys(section).filter((key) => !key.startsWith("_"));
        console.log(
          `  ${i + 1}. ${String(section._type)} (_key: ${String(section._key)}) — ${fields.join(", ")}`,
        );
      });
      console.log("");
      plans.push({
        id: `cityPage-${fb.slug}`,
        create: true,
        createValues: {
          city: fb.city,
          slug: { _type: "slug", current: fb.slug },
        },
        sections,
        unset: [],
        seo: { seoTitle: fb.seoTitle, seoDescription: fb.seoDescription },
      });
      continue;
    }

    for (const doc of [published, draft]) {
      if (!doc) continue;
      const plan = planFor(String(doc._id), doc, fb);
      if (!plan) process.exit(1);
      plans.push(plan);
    }
  }

  console.log(
    `Targets: ${plans
      .map((plan) => `${plan.id}${plan.create ? " (will be created)" : ""}`)
      .join(", ")}`,
  );

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/migrate-city-sections.ts -- --confirm",
    );
    return;
  }

  // One transaction across every target: create the published doc only when
  // missing, then per document set the stack (and seeded SEO fields) and
  // drop the old fields that were copied. These patches are the only writes
  // in the script, and they target only cityPage ids.
  let transaction = client.transaction();
  for (const plan of plans) {
    if (plan.create) {
      transaction = transaction.createIfNotExists({
        _id: plan.id,
        _type: "cityPage",
        ...plan.createValues,
      });
    }
    transaction = transaction.patch(plan.id, (patch) => {
      const values: Raw = { sections: plan.sections };
      if (plan.seo?.seoTitle) values.seoTitle = plan.seo.seoTitle;
      if (plan.seo?.seoDescription) values.seoDescription = plan.seo.seoDescription;
      const withSections = patch.set(values);
      return plan.unset.length ? withSections.unset(plan.unset) : withSections;
    });
  }
  await transaction.commit();

  console.log(
    `\nDone. ${plans.map((plan) => plan.id).join(", ")} now carr${plans.length === 1 ? "ies" : "y"} ` +
      "the section stack; old fields removed. Hard-reload /studio (each City " +
      "Page shows the six-section list, no 'Unknown fields found') and reload " +
      "/areas-we-serve/dallas and /areas-we-serve/fort-worth.",
  );
}

main().catch((error) => {
  console.error("migrate-city-sections failed:", error);
  process.exit(1);
});
