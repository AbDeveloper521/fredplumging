import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Plumbing Services | Fred's Plumbing",
  description: "Commercial, multi-family, emergency, drain and sewer, and preventive maintenance plumbing services across Dallas–Fort Worth.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <PagePlaceholder
      eyebrow="Services"
      title="Plumbing Services for Commercial & Multi-Family Properties"
      description="A full range of plumbing services for commercial buildings, apartment communities, and care facilities across the Metroplex."
    />
  );
}
