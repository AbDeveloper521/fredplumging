import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Testimonials | Fred's Plumbing",
  description: "Reviews and testimonials from Dallas–Fort Worth property managers and facilities teams who rely on Fred's Plumbing.",
  alternates: { canonical: "/about/testimonials" },
};

export default function TestimonialsPage() {
  return (
    <PagePlaceholder
      eyebrow="About Us"
      title="Testimonials"
      description="What property managers, facilities directors, and owners say about working with our crews."
    />
  );
}
