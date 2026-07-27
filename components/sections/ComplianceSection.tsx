import Image from "next/image";
import { BadgeCheck, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { TrustLogo } from "@/data/navigation";

const complianceItems = [
  "Licensing documentation",
  "Insurance verification",
  "Background requirements",
  "Vendor portal compliance",
  "Service documentation",
  "Property-specific coordination",
];

const dashboardRows = [
  { label: "General liability insurance", status: "Verified" },
  { label: "TX Master Plumber license", status: "Current" },
  { label: "Workers' compensation", status: "Verified" },
  { label: "W-9 & vendor onboarding docs", status: "On file" },
  { label: "Background-check program", status: "Active" },
];

export function ComplianceSection({ logos }: { logos: TrustLogo[] }) {
  return (
    <section
      aria-labelledby="compliance-heading"
      className="relative isolate overflow-hidden bg-navy-950 py-16 sm:py-24 lg:py-28"
    >
      <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_20%,rgb(27_48_73/0.85),transparent_65%)]"
      />

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <SectionHeading
                titleId="compliance-heading"
                eyebrow="Vendor-Ready and Fully Compliant"
                title="Approved Across Leading Property Management Systems"
                description="Fred's Plumbing maintains the insurance, licensing, documentation, and vendor credentials required by commercial property management organizations. Our team helps simplify onboarding, compliance, and ongoing service coordination."
                theme="dark"
              />
            </Reveal>

            <Reveal delay={0.1}>
              <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
                {complianceItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-[15px] font-semibold text-white/90"
                  >
                    <CheckCircle2 aria-hidden="true" className="size-[18px] shrink-0 text-red-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-10">
                <Button href="/contact" withArrow>
                  Discuss Vendor Requirements
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Compliance dashboard-style visual */}
          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-white/10 bg-navy-900/80 p-2 shadow-(--shadow-card-lg) backdrop-blur-sm">
              <div className="rounded-xl bg-navy-900 p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-white/8 pb-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-red-600">
                      <BadgeCheck aria-hidden="true" className="size-5 text-white" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">Vendor Compliance Status</p>
                      <p className="text-xs text-grey-300">Fred&rsquo;s Plumbing · DFW</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                    In good standing
                  </span>
                </div>
                <ul className="divide-y divide-white/6">
                  {dashboardRows.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-center justify-between gap-4 py-3.5"
                    >
                      <span className="text-[14px] font-medium text-grey-300">
                        {row.label}
                      </span>
                      <span className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-400">
                        <CheckCircle2 aria-hidden="true" className="size-3.5" />
                        {row.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Vendor-system wordmarks — hidden entirely when no logos exist */}
        {logos.length > 0 && (
          <Reveal delay={0.1}>
            <ul className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-5 border-t border-white/8 pt-10 lg:mt-20">
              {logos.map((logo) => (
                <li key={logo.name}>
                  {logo.photo ? (
                    <Image
                      src={logo.photo.url}
                      alt={logo.photo.alt}
                      width={200}
                      height={48}
                      className="h-8 w-auto opacity-40 brightness-0 invert transition-opacity duration-200 hover:opacity-80"
                    />
                  ) : (
                    <span
                      aria-label={`${logo.name} logo`}
                      className="font-heading text-lg font-extrabold tracking-tight text-white/30 transition-colors duration-200 select-none hover:text-white/80"
                    >
                      {logo.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
