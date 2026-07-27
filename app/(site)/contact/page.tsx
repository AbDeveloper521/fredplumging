import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Contact Us | Fred's Plumbing",
  description: "Contact Fred's Plumbing for commercial and multi-family plumbing service across the Dallas–Fort Worth Metroplex.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PagePlaceholder
      eyebrow="Contact"
      title="Request Service"
      description="Tell us about the property and the problem — we will respond fast, day or night."
    />
  );
}
