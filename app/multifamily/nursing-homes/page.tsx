import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Nursing Home Plumbing | Fred's Plumbing",
  description: "Compliance-aware plumbing services for skilled nursing facilities across the Dallas–Fort Worth Metroplex.",
  alternates: { canonical: "/multifamily/nursing-homes" },
};

export default function NursingHomesPage() {
  return (
    <PagePlaceholder
      eyebrow="Multifamily"
      title="Nursing Homes"
      description="Compliance-aware plumbing service for skilled nursing environments."
    />
  );
}
