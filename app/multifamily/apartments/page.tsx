import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Apartment Plumbing Services | Fred's Plumbing",
  description: "Apartment community plumbing services in Dallas–Fort Worth — unit repairs, turns, risers, and emergency response.",
  alternates: { canonical: "/multifamily/apartments" },
};

export default function ApartmentsPage() {
  return (
    <PagePlaceholder
      eyebrow="Multifamily"
      title="Apartments"
      description="Unit-level repairs and property-wide work coordinated with your on-site team."
    />
  );
}
