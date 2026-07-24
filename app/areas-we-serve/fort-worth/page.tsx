import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Fort Worth Plumbing Services | Fred's Plumbing",
  description: "Commercial and multi-family plumbing services in Fort Worth, TX — emergency response, maintenance, drain, and sewer work.",
  alternates: { canonical: "/areas-we-serve/fort-worth" },
};

export default function FortWorthPage() {
  return (
    <PagePlaceholder
      eyebrow="Areas We Serve"
      title="Fort Worth"
      description="Commercial and multi-family plumbing across Fort Worth and Tarrant County."
    />
  );
}
