import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import {
  associationBadgeLogos,
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
 * Unlike the vendor tile strips these render FULL COLOUR at rest — dimmed
 * certification marks read as decoration; in colour they read as
 * credentials. Bare row, no tiles: badges are designed for light
 * backgrounds, and the schema already asks for transparent uploads. Even
 * slot heights + object-contain keep mixed badge shapes tidy (the NMSDC
 * hexagon stays contained, never cropped).
 *
 * Layout: a centred wrapping row whose slot flex-basis sets the wrap point —
 * six fit one line at `lg`+ inside the Container, tablets wrap 3-up, phones
 * 2-up. Nothing hardcodes the count: a seventh badge wraps to a tidy centred
 * second line instead of shrinking the row into illegibility.
 */
export function AssociationBadgeStrip({ logos }: { logos: TrustLogo[] }) {
  const badges = associationBadgeLogos(logos);
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
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-10">
            {/*
              basis is the wrap threshold, not the rendered size: slots then
              grow to share their row equally, capped at max-w-40 so a short
              row (or a wrapped seventh badge) can't balloon. basis-28 fits
              two per row on a 320px phone and six per row at lg; the wider
              sm basis deliberately wraps tablets at three per row.
            */}
            {badges.map((logo) => (
              <li
                key={logo.name}
                className="flex max-w-40 basis-28 grow items-center justify-center sm:basis-40 lg:basis-28"
              >
                {logo.photo ? (
                  <div className="relative h-12 w-full lg:h-14">
                    <Image
                      src={logo.photo.url}
                      alt={logo.photo.alt}
                      fill
                      sizes="160px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="font-heading text-center text-lg leading-tight font-extrabold tracking-tight text-navy-900">
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
