import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Student Housing Plumbing | Fred's Plumbing",
  description: "Student housing plumbing services and turn-season support for Dallas–Fort Worth university communities.",
  alternates: { canonical: "/services/student-housing" },
};

export default function StudentHousingServicePage() {
  return (
    <PagePlaceholder
      eyebrow="Services"
      title="Student Housing"
      description="Turn-season capacity, fast unit turnarounds, and predictable scheduling."
    />
  );
}
