import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Dallas Plumbing Services | Fred's Plumbing",
  description: "Commercial and multi-family plumbing services in Dallas, TX — emergency response, maintenance, drain, and sewer work.",
  alternates: { canonical: "/areas-we-serve/dallas" },
};

export default function DallasPage() {
  return (
    <PagePlaceholder
      eyebrow="Areas We Serve"
      title="Dallas"
      description="Commercial and multi-family plumbing across Dallas and the surrounding communities."
    />
  );
}
