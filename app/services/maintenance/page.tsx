import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Preventive Plumbing Maintenance | Fred's Plumbing",
  description: "Scheduled preventive plumbing maintenance programs for DFW commercial buildings and multi-family communities.",
  alternates: { canonical: "/services/maintenance" },
};

export default function MaintenancePage() {
  return (
    <PagePlaceholder
      eyebrow="Services"
      title="Maintenance"
      description="Scheduled preventive programs that catch problems before they become emergencies."
    />
  );
}
