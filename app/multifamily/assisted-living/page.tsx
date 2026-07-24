import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Assisted Living Plumbing | Fred's Plumbing",
  description: "Plumbing services for assisted living communities in Dallas–Fort Worth, scheduled around residents and care routines.",
  alternates: { canonical: "/multifamily/assisted-living" },
};

export default function AssistedLivingPage() {
  return (
    <PagePlaceholder
      eyebrow="Multifamily"
      title="Assisted Living"
      description="Quiet, respectful crews working around residents and care schedules."
    />
  );
}
