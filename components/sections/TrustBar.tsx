import { Container } from "@/components/ui/Container";
import { trustLogos } from "@/data/navigation";

/**
 * Vendor-system and association logos.
 * Rendered as styled wordmarks until production logo files are added to
 * /public/logos — swap each <li> content for an <Image /> when available.
 */
export function TrustBar() {
  return (
    <section aria-label="Trusted partners and vendor systems" className="bg-white pb-16 pt-4 sm:pb-20">
      <Container>
        <p className="text-center text-sm font-semibold tracking-wide text-grey-500">
          Trusted by property managers and commercial facilities across DFW
        </p>
        <ul className="mt-8 flex snap-x items-center gap-x-12 gap-y-6 overflow-x-auto pb-2 sm:justify-center sm:overflow-visible lg:gap-x-16">
          {trustLogos.map((name) => (
            <li key={name} className="shrink-0 snap-start">
              <span
                aria-label={`${name} logo`}
                className="font-heading text-xl font-extrabold tracking-tight text-grey-300 transition-colors duration-200 select-none hover:text-navy-800 sm:text-[22px]"
              >
                {name}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
