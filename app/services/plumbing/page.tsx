import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Plumbing Services | Fred's Plumbing",
  description: "General plumbing repairs, replacements, re-pipes, and fixture installation for DFW commercial and multi-family properties.",
  alternates: { canonical: "/services/plumbing" },
};

export default function PlumbingPage() {
  return (
    <PagePlaceholder
      eyebrow="Services"
      title="Plumbing"
      description="Repairs, replacements, re-pipes, and fixture work handled by licensed technicians."
    />
  );
}
