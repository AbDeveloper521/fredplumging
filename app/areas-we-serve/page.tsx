import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Areas We Serve | Fred's Plumbing",
  description: "Fred's Plumbing serves commercial and multi-family properties throughout the Dallas–Fort Worth Metroplex.",
  alternates: { canonical: "/areas-we-serve" },
};

export default function AreasWeServePage() {
  return (
    <PagePlaceholder
      eyebrow="Areas We Serve"
      title="Serving the Dallas–Fort Worth Metroplex"
      description="Crews staged across DFW so response times stay short no matter where your property sits."
    />
  );
}
