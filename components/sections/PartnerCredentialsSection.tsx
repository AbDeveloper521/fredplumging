import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ComplianceDashboardPanel } from "@/components/ui/ComplianceDashboardPanel";

/**
 * Lighter sibling of the homepage ComplianceSection, split for
 * /about/partners: that section's heading ("Approved Across Leading Property
 * Management Systems"), checklist, and logo strip would all repeat what the
 * partners page already says in its hero, onboarding band, and platform
 * cards. Only the dashboard panel is additive here — the concrete document
 * line items — so this keeps the panel and drops the rest.
 */
export function PartnerCredentialsSection({ id = "partner-credentials" }: { id?: string }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="relative isolate overflow-hidden bg-navy-950 py-16 sm:py-24 lg:py-28"
    >
      <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_20%_30%,rgb(27_48_73/0.9),transparent_65%)]"
      />

      <Container className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <SectionHeading
              titleId={`${id}-heading`}
              eyebrow="The Paper Trail"
              title="The Documents Behind the Approvals"
              description="These are the records each platform verifies against — kept current year-round, and available for your vendor file directly whenever your system isn't one we're already in."
              theme="dark"
            />
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-9">
              <Button href="/contact" withArrow>
                Request Compliance Documents
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <ComplianceDashboardPanel />
        </Reveal>
      </Container>
    </section>
  );
}
