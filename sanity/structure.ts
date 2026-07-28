import type { StructureResolver } from "sanity/structure";

/**
 * Studio structure. Singletons (`siteSettings`, `navigation`) are pinned as
 * single documents with fixed IDs — there is no document list to "create new"
 * from. FAQ and testimonial lists default to the client-controlled `order`.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      S.listItem()
        .title("Navigation Menu")
        .id("navigation")
        .child(S.document().schemaType("navigation").documentId("navigation")),
      S.listItem()
        .title("Google Reviews")
        .id("reviewSettings")
        .child(
          S.document().schemaType("reviewSettings").documentId("reviewSettings"),
        ),
      S.divider(),
      S.listItem()
        .title("Services")
        .id("services")
        .child(
          S.documentTypeList("service")
            .title("Services")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.listItem()
        .title("Property Types")
        .id("industries")
        .child(
          S.documentTypeList("industry")
            .title("Property Types")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.listItem()
        .title("Trust Logos")
        .id("trustLogos")
        .child(
          S.documentTypeList("trustLogo")
            .title("Trust Logos")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.divider(),
      S.listItem()
        .title("FAQs")
        .id("faqs")
        .child(
          S.documentTypeList("faq")
            .title("FAQs")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.listItem()
        .title("Testimonials")
        .id("testimonials")
        .child(
          S.documentTypeList("testimonial")
            .title("Testimonials")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
    ]);
