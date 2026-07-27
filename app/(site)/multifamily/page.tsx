import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Multifamily Plumbing | Fred's Plumbing",
  description: "Multifamily plumbing services for apartments, condos, assisted living, and nursing homes across Dallas–Fort Worth.",
  alternates: { canonical: "/multifamily" },
};

export default function MultifamilyPage() {
  return (
    <PagePlaceholder
      eyebrow="Multifamily"
      title="Plumbing Built for Multifamily Portfolios"
      description="Apartments, condos, and care communities — one plumbing partner across the whole portfolio."
    />
  );
}
