import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Specialty Plumbing Services | Fred's Plumbing",
  description: "Backflow testing, gas line work, hydro jetting, and other specialty plumbing services for Dallas–Fort Worth properties.",
  alternates: { canonical: "/services/specialty-services" },
};

export default function SpecialtyServicesPage() {
  return (
    <PagePlaceholder
      eyebrow="Services"
      title="Specialty Services"
      description="Backflow testing, gas lines, hydro jetting, and the work that needs a specialist on site."
    />
  );
}
