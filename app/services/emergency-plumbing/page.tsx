import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "24/7 Emergency Plumbing | Fred's Plumbing",
  description: "24/7 emergency plumbing response for burst pipes, major leaks, and urgent failures across the Dallas–Fort Worth Metroplex.",
  alternates: { canonical: "/services/emergency-plumbing" },
};

export default function EmergencyPlumbingPage() {
  return (
    <PagePlaceholder
      eyebrow="Services"
      title="Emergency Plumbing"
      description="24/7 response for burst lines, major leaks, and anything that cannot wait until morning."
    />
  );
}
