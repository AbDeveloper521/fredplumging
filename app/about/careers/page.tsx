import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Careers | Fred's Plumbing",
  description: "Plumbing careers in Dallas–Fort Worth. Explore open roles for licensed plumbers, apprentices, and support staff at Fred's Plumbing.",
  alternates: { canonical: "/about/careers" },
};

export default function CareersPage() {
  return (
    <PagePlaceholder
      eyebrow="About Us"
      title="Careers"
      description="Licensed plumbers, apprentices, and dispatch staff — see what it is like to build a career here."
    />
  );
}
