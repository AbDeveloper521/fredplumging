import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Partners | Fred's Plumbing",
  description: "The vendor platforms, suppliers, and property management groups Fred's Plumbing partners with across Dallas–Fort Worth.",
  alternates: { canonical: "/about/partners" },
};

export default function PartnersPage() {
  return (
    <PagePlaceholder
      eyebrow="About Us"
      title="Our Partners"
      description="The vendor systems, suppliers, and property groups we work alongside to keep DFW buildings running."
    />
  );
}
