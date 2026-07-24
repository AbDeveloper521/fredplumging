import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Senior Care Facility Plumbing | Fred's Plumbing",
  description: "Plumbing services for senior care and assisted living facilities in Dallas–Fort Worth, scheduled around resident routines.",
  alternates: { canonical: "/services/senior-care-facilities" },
};

export default function SeniorCareFacilitiesPage() {
  return (
    <PagePlaceholder
      eyebrow="Services"
      title="Senior Care Facilities"
      description="Low-disruption plumbing work in occupied care settings, with the compliance paperwork to match."
    />
  );
}
