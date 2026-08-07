import type { Metadata } from "next";
import { getLegalPage } from "@/sanity/lib/getLegalPage";
import { getSite } from "@/sanity/lib/getSite";
import { legalHref } from "@/data/legalPages";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const SLUG = "terms-of-service" as const;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getLegalPage(SLUG);
  return {
    title: content.seoTitle ?? content.title,
    description: content.seoDescription,
    // Relative — resolved against metadataBase (root layout).
    alternates: { canonical: legalHref(SLUG) },
    // A normal legal page: indexable, like the rest of the site.
    robots: { index: true, follow: true },
  };
}

/** No structured data on the legal pages, by instruction. */
export default async function TermsOfServicePage() {
  const [content, site] = await Promise.all([getLegalPage(SLUG), getSite()]);
  return <LegalPageLayout content={content} site={site} />;
}
