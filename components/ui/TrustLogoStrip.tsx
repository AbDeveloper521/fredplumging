import Image from "next/image";
import type { TrustLogo } from "@/data/navigation";

/**
 * The trust-logo row extracted from the phase-3 TrustBar so other sections
 * can reuse the strip without nesting full sections. Every logo sits in an
 * identical white tile so mixed logo shapes — and uploads with baked-in
 * background rectangles — read as one even row. Renders the uploaded logo
 * image when the Studio has one, otherwise a styled wordmark in the same tile.
 */
export function TrustLogoStrip({ logos }: { logos: TrustLogo[] }) {
  if (logos.length === 0) return null;

  return (
    <ul className="flex snap-x items-center gap-4 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible lg:gap-5">
      {logos.map((logo) => (
        <li
          key={logo.name}
          className="group flex h-20 w-40 shrink-0 snap-start items-center justify-center rounded-xl border border-grey-300/60 bg-white px-5 py-4 shadow-card lg:h-24 lg:w-48"
        >
          {logo.photo ? (
            <div className="relative h-full w-full">
              <Image
                src={logo.photo.url}
                alt={logo.photo.alt}
                fill
                sizes="(min-width: 1024px) 192px, 160px"
                className="object-contain opacity-80 grayscale transition duration-200 group-hover:opacity-100 group-hover:grayscale-0 group-focus-within:opacity-100 group-focus-within:grayscale-0"
              />
            </div>
          ) : (
            <span
              aria-label={`${logo.name} logo`}
              className="text-center font-heading text-lg font-extrabold tracking-tight text-grey-300 transition-colors duration-200 select-none group-hover:text-navy-800 sm:text-xl"
            >
              {logo.name}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
