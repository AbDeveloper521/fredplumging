import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "About Us | Fred's Plumbing",
  description: "Learn about Fred's Plumbing — commercial and multi-family plumbing specialists serving the Dallas–Fort Worth Metroplex since 1996.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PagePlaceholder
      eyebrow="About Us"
      title="Commercial Plumbing Partners Since 1996"
      description="Learn who we are, how we work with property teams across Dallas–Fort Worth, and why facilities managers keep us on speed dial."
    />
  );
}
