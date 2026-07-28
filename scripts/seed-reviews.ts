/**
 * Reviews-phase sync — run with:  sanity exec scripts/seed-reviews.ts -- --confirm
 *
 * The surgical alternative to a full `npm run seed -- --force` for a dataset
 * that already has real content: it touches ONLY the review layer.
 *
 *  1. createOrReplace the 20 verbatim Google reviews from data/testimonials.ts
 *  2. DELETE testimonial documents that aren't in that set (the invented
 *     pre-launch placeholder quotes must not stay published — they are a
 *     legal problem, not a copy problem)
 *  3. createOrReplace the `reviewSettings` singleton from data/googleReviews.ts
 *  4. Patch each PUBLISHED service/industry section stack in place so every
 *     one carries a tagged client-reviews section — client edits to the other
 *     sections are preserved, not re-seeded.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope), same as seed-content.ts.
 */
import { getCliClient } from "sanity/cli";
import { testimonials } from "../data/testimonials";
import { googleReviews, DEFAULT_PAGE_REVIEW_TAGS } from "../data/googleReviews";

/** Same policy as seed-content.ts: tag an existing reviews section, or insert one before the closing relatedServices/finalCta run. */
function withReviews(sections: unknown[], slug: string): unknown[] {
  const filterTags = DEFAULT_PAGE_REVIEW_TAGS[slug] ?? [slug];
  const typeOf = (s: unknown) => (s as { _type?: string })._type;

  if (sections.some((s) => typeOf(s) === "serviceTestimonials")) {
    return sections.map((s) =>
      typeOf(s) === "serviceTestimonials"
        ? { filterTags, limit: 4, ...(s as Record<string, unknown>) }
        : s,
    );
  }

  const reviews = {
    _type: "serviceTestimonials",
    _key: "seed-reviews",
    heading: "What Our Clients Say",
    filterTags,
    limit: 4,
  };
  const tail = sections.findIndex((s) =>
    ["relatedServices", "finalCta"].includes(typeOf(s) ?? ""),
  );
  if (tail === -1) return [...sections, reviews];
  return [...sections.slice(0, tail), reviews, ...sections.slice(tail)];
}

async function main() {
  if (!process.argv.includes("--confirm")) {
    console.error(
      "This rewrites the testimonial collection and patches section stacks.\n" +
        "Re-run with:  sanity exec scripts/seed-reviews.ts -- --confirm",
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

  testimonials.forEach((testimonial, i) => {
    tx.createOrReplace({
      _id: `testimonial-${testimonial.id}`,
      _type: "testimonial",
      name: testimonial.name,
      ...(testimonial.role ? { role: testimonial.role } : {}),
      rating: testimonial.rating,
      quote: testimonial.quote,
      date: testimonial.date,
      featured: testimonial.featured ?? false,
      source: testimonial.source,
      ...(testimonial.reviewerMeta
        ? { reviewerMeta: testimonial.reviewerMeta }
        : {}),
      ...(testimonial.sourceUrl ? { sourceUrl: testimonial.sourceUrl } : {}),
      ...(testimonial.serviceTags
        ? { serviceTags: [...testimonial.serviceTags] }
        : {}),
      verified: true,
      order: (i + 1) * 10,
    });
  });

  const staleIds = await client.fetch<string[]>(
    `*[_type == "testimonial" && !(_id in $ids)]._id`,
    { ids: testimonials.map((t) => `testimonial-${t.id}`) },
  );
  staleIds.forEach((id) => tx.delete(id));

  tx.createOrReplace({
    _id: "reviewSettings",
    _type: "reviewSettings",
    rating: googleReviews.rating,
    reviewCount: googleReviews.reviewCount,
    verifiedOn: googleReviews.verifiedOn,
    reviewsUrl: googleReviews.reviewsUrl,
  });

  const sectioned = await client.fetch<
    Array<{ _id: string; slug: string; sections: unknown[] }>
  >(
    `*[_type in ["service", "industry"] && defined(sections)]{_id, "slug": slug.current, sections}`,
  );
  sectioned.forEach((doc) => {
    tx.patch(doc._id, { set: { sections: withReviews(doc.sections, doc.slug) } });
  });

  await tx.commit();

  console.log(
    `✓ Synced reviews into project "${projectId}", dataset "${dataset}":\n` +
      `  ${testimonials.length} testimonials written, ${staleIds.length} stale deleted,\n` +
      `  1 reviewSettings, ${sectioned.length} section stacks now carry a reviews section.\n\n` +
      `  Next: npm run check:drift   (testimonials should print ✓ again)`,
  );
}

main().catch((error) => {
  console.error("seed-reviews failed:", error);
  process.exit(1);
});
