import { Container } from "@/components/ui/Container";
import { TrustLogoStrip } from "@/components/ui/TrustLogoStrip";
import type { TrustLogo } from "@/data/navigation";
import { homePageDefaults } from "@/data/homePage";

/**
 * Vendor-system and association logos. The strip itself lives in
 * `components/ui/TrustLogoStrip.tsx` so service-page sections can reuse it.
 */
export function TrustBar({
  logos,
  tagline = homePageDefaults.trustBar.tagline,
}: {
  logos: TrustLogo[];
  tagline?: string;
}) {
  return (
    <section aria-label="Trusted partners and vendor systems" className="bg-white pb-16 pt-4 sm:pb-20">
      <Container>
        <p className="text-center text-sm font-semibold tracking-wide text-grey-500">
          {tagline}
        </p>
        <div className="mt-8">
          <TrustLogoStrip logos={logos} />
        </div>
      </Container>
    </section>
  );
}
