import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Commercial Plumbing | Fred's Plumbing",
  description: "Commercial plumbing services for retail, office, restaurant, and industrial properties across Dallas–Fort Worth.",
  alternates: { canonical: "/services/commercial-plumbing" },
};

export default function CommercialPlumbingPage() {
  return (
    <PagePlaceholder
      eyebrow="Services"
      title="Commercial Plumbing"
      description="Retail, office, restaurant, and industrial plumbing handled around your operating hours."
    />
  );
}
