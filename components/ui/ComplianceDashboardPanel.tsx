import { BadgeCheck, CheckCircle2 } from "lucide-react";

/**
 * The dashboard-style vendor-compliance visual, extracted from
 * ComplianceSection so /about/partners can reuse it: the two pages must show
 * the SAME line items — a claim added in one place but not the other would
 * read as a contradiction. Rendered on dark bands only.
 */
const dashboardRows = [
  { label: "General liability insurance", status: "Verified" },
  { label: "TX Master Plumber license", status: "Current" },
  { label: "Workers' compensation", status: "Verified" },
  { label: "W-9 & vendor onboarding docs", status: "On file" },
  { label: "Background-check program", status: "Active" },
];

export function ComplianceDashboardPanel() {
  return (
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
  );
}
