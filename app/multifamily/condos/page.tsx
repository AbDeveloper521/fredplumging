import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Condo Plumbing Services | Fred's Plumbing",
  description: "Condominium plumbing services for DFW associations and unit owners, with clear scoping and documentation.",
  alternates: { canonical: "/multifamily/condos" },
};

export default function CondosPage() {
  return (
    <PagePlaceholder
      eyebrow="Multifamily"
      title="Condos"
      description="Work scoped cleanly between unit owners and the association."
    />
  );
}
