import type { StructureResolver } from "sanity/structure";
import {
  ASSOCIATION_BADGE_CATEGORIES,
  VENDOR_PLATFORM_CATEGORIES,
} from "@/data/navigation";

/**
 * Studio structure. Singletons (`siteSettings`, `navigation`) are pinned as
 * single documents with fixed IDs — there is no document list to "create new"
 * from. FAQ and testimonial lists default to the client-controlled `order`.
 *
 * `trustLogo` is ONE document type shown as TWO filtered lists — vendor
 * platforms vs certification/association badges — mirroring where each
 * group renders on the site. Creating from either list pre-sets the
 * matching category via the templates in sanity.config.ts, so a document
 * lands in the list it was created from.
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
        .title("Home Page")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),
      S.listItem()
        .title("Navigation Menu")
        .id("navigation")
        .child(S.document().schemaType("navigation").documentId("navigation")),
      S.listItem()
        .title("About Page")
        .id("aboutPage")
        .child(S.document().schemaType("aboutPage").documentId("aboutPage")),
      S.listItem()
        .title("Partners Page")
        .id("partnersPage")
        .child(
          S.document().schemaType("partnersPage").documentId("partnersPage"),
        ),
      S.listItem()
        .title("Careers Page")
        .id("careersPage")
        .child(
          S.document().schemaType("careersPage").documentId("careersPage"),
        ),
      // "Services Index Page" (the /services landing page) vs "Service
      // Pages" (the individual services) — deliberately distinct wording so
      // the Careers Page / Careers mix-up can't repeat here.
      S.listItem()
        .title("Services Index Page")
        .id("servicesIndexPage")
        .child(
          S.document()
            .schemaType("servicesIndexPage")
            .documentId("servicesIndexPage"),
        ),
      // "Areas We Serve Index Page" (the /areas-we-serve landing page) vs
      // "City Pages" (Dallas, Fort Worth) — same deliberate split as the
      // services pair above.
      S.listItem()
        .title("Areas We Serve Index Page")
        .id("areasIndexPage")
        .child(
          S.document()
            .schemaType("areasIndexPage")
            .documentId("areasIndexPage"),
        ),
      // "Multifamily Index Page" (the /multifamily landing page) vs "Property
      // Types" (the documents whose cards it lists) — same deliberate split.
      S.listItem()
        .title("Multifamily Index Page")
        .id("multifamilyIndexPage")
        .child(
          S.document()
            .schemaType("multifamilyIndexPage")
            .documentId("multifamilyIndexPage"),
        ),
      // "Commercial Page" is the standalone /commercial page. The
      // "Commercial Plumbing" document under Service Pages is the
      // /services/commercial-plumbing service — same word, different page,
      // so the two titles are kept deliberately distinct.
      S.listItem()
        .title("Commercial Page")
        .id("commercialPage")
        .child(
          S.document()
            .schemaType("commercialPage")
            .documentId("commercialPage"),
        ),
      // Hydro Jetting is deliberately NOT a page singleton here: it is a
      // service, so it is edited under Service Pages with every other
      // service, at /services/hydro-jetting. It is the site's ONLY hydro
      // jetting page — the Drain & Sewer and Specialty Services documents
      // mention jetting but must not become second pages about it.
      S.listItem()
        .title("Contact Page")
        .id("contactPage")
        .child(
          S.document().schemaType("contactPage").documentId("contactPage"),
        ),
      S.listItem()
        .title("Google Reviews")
        .id("reviewSettings")
        .child(
          S.document().schemaType("reviewSettings").documentId("reviewSettings"),
        ),
      S.divider(),
      S.listItem()
        .title("Service Pages")
        .id("services")
        .child(
          S.documentTypeList("service")
            .title("Service Pages")
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
        .title("City Pages")
        .id("cityPages")
        .child(
          S.documentTypeList("cityPage")
            .title("City Pages")
            .defaultOrdering([{ field: "city", direction: "asc" }]),
        ),
      S.listItem()
        .title("Careers")
        .id("jobPostings")
        .child(
          S.documentTypeList("jobPosting")
            .title("Careers")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.listItem()
        .title("Partners & Vendor Systems")
        .id("trustLogos")
        .child(
          S.documentTypeList("trustLogo")
            .title("Partners & Vendor Systems")
            .apiVersion("2026-07-01")
            // Uncategorised legacy documents stay here — the vendor strips
            // are where they render today.
            .filter(
              '_type == "trustLogo" && (!defined(category) || category in $categories)',
            )
            .params({ categories: [...VENDOR_PLATFORM_CATEGORIES] })
            .defaultOrdering([{ field: "order", direction: "asc" }])
            .initialValueTemplates([
              S.initialValueTemplateItem("trustLogo-vendor"),
            ]),
        ),
      S.listItem()
        .title("Certification & Association Badges")
        .id("certificationBadges")
        .child(
          S.documentTypeList("trustLogo")
            .title("Certification & Association Badges")
            .apiVersion("2026-07-01")
            .filter('_type == "trustLogo" && category in $categories')
            .params({ categories: [...ASSOCIATION_BADGE_CATEGORIES] })
            .defaultOrdering([{ field: "order", direction: "asc" }])
            .initialValueTemplates([
              S.initialValueTemplateItem("trustLogo-badge"),
            ]),
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
      // "FAQ Sets" (reusable groups of questions a page's Q&A band points
      // at) vs "FAQs" above (the individual questions the homepage list is
      // built from) — two different things, deliberately distinct titles.
      S.listItem()
        .title("FAQ Sets")
        .id("faqSets")
        .child(
          S.documentTypeList("faqSet")
            .title("FAQ Sets")
            .defaultOrdering([{ field: "title", direction: "asc" }]),
        ),
      S.listItem()
        .title("Testimonials")
        .id("testimonials")
        .child(
          S.documentTypeList("testimonial")
            .title("Testimonials")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.divider(),
      // Exactly two documents, pinned by id — not a list, so there is no "+"
      // to create a third legal page from.
      S.listItem()
        .title("Legal Pages")
        .id("legalPages")
        .child(
          S.list()
            .title("Legal Pages")
            .items([
              S.listItem()
                .title("Privacy Policy")
                .id("privacyPolicy")
                .child(
                  S.document()
                    .schemaType("legalPage")
                    .documentId("legal-privacy-policy")
                    .title("Privacy Policy"),
                ),
              S.listItem()
                .title("Terms of Service")
                .id("termsOfService")
                .child(
                  S.document()
                    .schemaType("legalPage")
                    .documentId("legal-terms-of-service")
                    .title("Terms of Service"),
                ),
            ]),
        ),
    ]);
