import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { TrustLogoStrip } from "@/components/ui/TrustLogoStrip";
import { cn } from "@/lib/utils";
import type { TrustLogoStripSection as StripData } from "@/data/serviceSections";
import { vendorPlatformLogos, type TrustLogo } from "@/data/navigation";

interface TrustLogoStripSectionProps {
  section: StripData;
  logos: TrustLogo[];
  id: string;
}

/**
 * Standalone tile strip: just the shared Trust Logos row on its own band —
 * for stacks that close on the vendor-platform tiles without a "why trust
 * us" proof-point section around them. Vendor platforms only; the
 * certification/association badges have their own full-colour strip. Hidden
 * entirely while there are no vendor logos.
 */
export function TrustLogoStripSection({
  section,
  logos,
  id,
}: TrustLogoStripSectionProps) {
  const vendors = vendorPlatformLogos(logos);
  if (vendors.length === 0) return null;
  return (
    <section
      id={id}
      aria-label="Partner platforms and vendor systems"
      className={cn(
        "py-12 sm:py-16",
        section.background === "white" ? "bg-white" : "bg-offwhite",
      )}
    >
      <Container>
        <Reveal>
          <TrustLogoStrip logos={vendors} />
        </Reveal>
      </Container>
    </section>
  );
}
