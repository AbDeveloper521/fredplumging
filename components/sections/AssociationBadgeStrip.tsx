import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import {
  ASSOCIATION_BADGE_CATEGORIES,
  ASSOCIATION_STRIP_HEADING,
  type TrustLogo,
} from "@/data/navigation";

/**
 * Association & certification badges (AAGD, TDLR, NMSDC MBE, …) on every
 * service page, directly above the map band. Fed by the same Trust Logos
 * collection as the vendor strips, filtered to the association/credential
 * categories — an editor uploads a badge with that category in Studio and it
 * appears here on every service page, no per-page editing.
 *
 * Unlike the vendor tile strip these render FULL COLOUR at rest — dimmed
 * certification marks read as decoration; in colour they read as
 * credentials. Bare row, no tiles: badges are designed for light
 * backgrounds, and the schema already asks for transparent uploads. Even
 * slot heights + object-contain keep mixed badge shapes tidy; the row wraps
 * on small screens so every credential stays visible (no horizontal scroll).
 */
export function AssociationBadgeStrip({ logos }: { logos: TrustLogo[] }) {
  const badges = logos.filter(
    (logo) =>
      logo.category !== undefined &&
      ASSOCIATION_BADGE_CATEGORIES.includes(logo.category),
  );
  if (badges.length === 0) return null;

  return (
    <section
      aria-labelledby="association-badges-heading"
      className="bg-white py-12 sm:py-16"
    >
      <Container>
        <Reveal>
          <h2
            id="association-badges-heading"
            className="flex items-center justify-center gap-3 text-center text-[13px] font-bold tracking-[0.14em] text-grey-500 uppercase"
          >
            <span aria-hidden="true" className="h-px w-8 bg-grey-300" />
            {ASSOCIATION_STRIP_HEADING}
            <span aria-hidden="true" className="h-px w-8 bg-grey-300" />
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 lg:gap-x-14">
            {badges.map((logo) => (
              <li key={logo.name} className="flex items-center justify-center">
                {logo.photo ? (
                  <div className="relative h-14 w-36 sm:h-16 sm:w-40">
                    <Image
                      src={logo.photo.url}
                      alt={logo.photo.alt}
                      fill
                      sizes="160px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="font-heading max-w-40 text-center text-lg leading-tight font-extrabold tracking-tight text-navy-900">
                    {logo.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
