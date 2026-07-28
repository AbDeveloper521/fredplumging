import { ClipboardList, Clock4, FileCheck2, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

/**
 * What an approved-vendor record actually buys the property manager. The
 * claims here deliberately track ComplianceDashboardPanel's line items
 * (general liability, TX Master Plumber license, workers' comp, W-9 and
 * onboarding docs, background checks) — the two blocks must not contradict.
 */
const points = [
  {
    icon: FileCheck2,
    title: "Onboarding without the paperwork chase",
    description:
      "Our insurance certificates, licensing, and W-9 are already filed in the portals you use, so approval is a lookup rather than a request.",
  },
  {
    icon: ShieldCheck,
    title: "Coverage that stays current",
    description:
      "General liability, workers' compensation, and our Texas Master Plumber license are renewed and re-uploaded before they lapse, not after a system flags them.",
  },
  {
    icon: Clock4,
    title: "Dispatch that starts the same day",
    description:
      "An approved vendor record means an emergency call becomes a truck rolling, not a compliance ticket.",
  },
  {
    icon: ClipboardList,
    title: "Documentation that closes the work order",
    description:
      "Invoices, photos, and service notes land in your system in the format it expects.",
  },
];

export function VendorOnboardingSection({ id = "vendor-onboarding" }: { id?: string }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="relative isolate overflow-hidden bg-navy-950 py-16 sm:py-24 lg:py-28"
    >
      <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_20%,rgb(27_48_73/0.85),transparent_65%)]"
      />

      <Container className="relative">
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            eyebrow="Why It Matters"
            title="What Vendor Approval Buys You On Day One"
            description="Being registered in your compliance system isn't a badge for our website — it's the difference between a same-day dispatch and a week of document requests."
            theme="dark"
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {points.map(({ icon: Icon, title, description }, i) => (
            <li key={title}>
              <Reveal delay={i * 0.06} className="h-full">
                <div className="h-full rounded-2xl border border-white/10 bg-navy-900/70 p-7 backdrop-blur-sm">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-red-600">
                    <Icon aria-hidden="true" className="size-5 text-white" />
                  </span>
                  <h3 className="mt-5 text-[17px] font-extrabold tracking-tight text-white">
                    {title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-grey-300">
                    {description}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
