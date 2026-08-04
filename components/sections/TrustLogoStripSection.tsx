import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { TrustLogoStrip } from "@/components/ui/TrustLogoStrip";
import { cn } from "@/lib/utils";
import type { TrustLogoStripSection as StripData } from "@/data/serviceSections";
import type { TrustLogo } from "@/data/navigation";

interface TrustLogoStripSectionProps {
  section: StripData;
  logos: TrustLogo[];
  id: string;
}

/**
 * Standalone badge strip: just the shared Trust Logos row on its own band —
 * for pages that close on the certification badges without a "why trust us"
 * proof-point section around them. Hidden entirely while the Trust Logos
 * collection is empty.
 */
export function TrustLogoStripSection({
  section,
  logos,
  id,
}: TrustLogoStripSectionProps) {
  if (logos.length === 0) return null;
  return (
    <section
      id={id}
      aria-label="Certifications and partnerships"
      className={cn(
        "py-12 sm:py-16",
        section.background === "white" ? "bg-white" : "bg-offwhite",
      )}
    >
      <Container>
        <Reveal>
          <TrustLogoStrip logos={logos} />
        </Reveal>
      </Container>
    </section>
  );
}
