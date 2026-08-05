import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { navIcons } from "@/components/layout/navIcons";
import {
  partnersPageDefaults,
  type VendorOnboardingContent,
} from "@/data/partnersPage";

/**
 * What an approved-vendor record actually buys the property manager. The
 * default claims deliberately track ComplianceDashboardPanel's line items
 * (general liability, TX Master Plumber license, workers' comp, W-9 and
 * onboarding docs, background checks) — the two blocks must not contradict;
 * the Studio description carries the same warning for edited copy.
 */
export function VendorOnboardingSection({
  content = partnersPageDefaults.onboarding,
  titleId = "vendor-onboarding-heading",
}: {
  content?: VendorOnboardingContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId?: string;
}) {
  return (
    <section
      aria-labelledby={titleId}
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
            titleId={titleId}
            eyebrow={content.eyebrow}
            title={content.heading}
            description={content.description}
            theme="dark"
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {content.items.map((item, i) => {
            const Icon = navIcons[item.icon];
            return (
              <li key={item.title}>
                <Reveal delay={i * 0.06} className="h-full">
                  <div className="h-full rounded-2xl border border-white/10 bg-navy-900/70 p-7 backdrop-blur-sm">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-red-600">
                      <Icon aria-hidden="true" className="size-5 text-white" />
                    </span>
                    <h3 className="mt-5 text-[17px] font-extrabold tracking-tight text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-grey-300">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
