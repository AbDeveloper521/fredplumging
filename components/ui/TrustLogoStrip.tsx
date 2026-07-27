import Image from "next/image";
import type { TrustLogo } from "@/data/navigation";

/**
 * The trust-logo row extracted from the phase-3 TrustBar so other sections
 * can reuse the strip without nesting full sections. Renders the uploaded
 * logo image when the Studio has one, otherwise a styled wordmark.
 */
export function TrustLogoStrip({ logos }: { logos: TrustLogo[] }) {
  if (logos.length === 0) return null;

  return (
    <ul className="flex snap-x items-center gap-x-12 gap-y-6 overflow-x-auto pb-2 sm:justify-center sm:overflow-visible lg:gap-x-16">
      {logos.map((logo) => (
        <li key={logo.name} className="shrink-0 snap-start">
          {logo.photo ? (
            <Image
              src={logo.photo.url}
              alt={logo.photo.alt}
              width={200}
              height={56}
              className="h-9 w-auto opacity-70 grayscale transition-opacity duration-200 hover:opacity-100 sm:h-10"
            />
          ) : (
            <span
              aria-label={`${logo.name} logo`}
              className="font-heading text-xl font-extrabold tracking-tight text-grey-300 transition-colors duration-200 select-none hover:text-navy-800 sm:text-[22px]"
            >
              {logo.name}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
