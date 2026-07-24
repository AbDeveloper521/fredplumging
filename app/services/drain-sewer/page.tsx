import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Drain & Sewer Services | Fred's Plumbing",
  description: "Drain cleaning, sewer camera inspection, and line repair for commercial and multi-family properties in Dallas–Fort Worth.",
  alternates: { canonical: "/services/drain-sewer" },
};

export default function DrainSewerPage() {
  return (
    <PagePlaceholder
      eyebrow="Services"
      title="Drain & Sewer"
      description="Camera inspection, cleaning, and repair for drain and sewer lines of every size."
    />
  );
}
