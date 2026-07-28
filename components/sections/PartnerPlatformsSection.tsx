import Image from "next/image";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import type { TrustLogo, TrustLogoCategory } from "@/data/navigation";
import { cn } from "@/lib/utils";

interface PartnerPlatformsSectionProps {
  /** Trust-logo entries WITH a blurb — the caller filters. */
  partners: TrustLogo[];
  id?: string;
}

const CATEGORY_LABELS: Record<TrustLogoCategory, string> = {
  "vendor-portal": "Vendor portal",
  "compliance-network": "Compliance network",
  association: "Trade association",
  credential: "Credential",
};

/**
 * One card per vendor platform, alternating logo-tile side. The wordmark
 * tile is the shipping default — real logos are an upgrade the client
 * uploads in the Studio (see public/logos/README.txt).
 */
export function PartnerPlatformsSection({
  partners,
  id = "partner-platforms",
}: PartnerPlatformsSectionProps) {
  if (partners.length === 0) return null;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="bg-offwhite py-16 sm:py-24 lg:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            eyebrow="Vendor Compliance"
            title="Approved Across the Systems Property Managers Already Use"
            description="Each registration below is active and maintained — documentation, insurance, and certifications are already on file, so approving Fred's Plumbing is a lookup in the system you use today, not a new onboarding project."
          />
        </Reveal>

        <ul className="mt-14 space-y-6">
          {partners.map((partner, i) => {
            const flipped = i % 2 === 1;
            return (
              <li key={partner.name}>
                <Reveal delay={Math.min(i, 5) * 0.06}>
                  <article
                    className={cn(
                      "grid grid-cols-1 items-center gap-8 rounded-2xl border border-grey-100 bg-white p-8 shadow-(--shadow-card) lg:grid-cols-[auto_1fr] lg:gap-12 lg:p-10",
                      "border-l-4 border-l-transparent transition-colors duration-200 hover:border-l-red-600 focus-within:border-l-red-600",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-28 items-center justify-center rounded-xl border border-grey-100 bg-offwhite px-3 lg:size-32",
                        flipped && "lg:order-2 lg:justify-self-end",
                      )}
                    >
                      {partner.photo ? (
                        <Image
                          src={partner.photo.url}
                          alt={partner.photo.alt}
                          width={200}
                          height={48}
                          className="h-10 w-auto"
                        />
                      ) : (
                        <span
                          aria-label={`${partner.name} logo`}
                          className="font-heading text-center text-xl font-extrabold tracking-tight text-navy-900 select-none"
                        >
                          {partner.name}
                        </span>
                      )}
                    </div>

                    <div className={cn(flipped && "lg:order-1")}>
                      {partner.verified && partner.category && (
                        <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                          <BadgeCheck aria-hidden="true" className="size-3.5" />
                          Verified vendor · {CATEGORY_LABELS[partner.category]}
                        </p>
                      )}
                      <h3 className="text-[22px] font-extrabold tracking-tight text-navy-900 sm:text-[26px]">
                        {partner.headline ?? `Approved vendor on ${partner.name}`}
                      </h3>
                      <p className="mt-4 text-[16px] leading-relaxed text-grey-700">
                        {partner.blurb}
                      </p>
                      {partner.url && (
                        <a
                          href={partner.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-bold text-navy-900 underline decoration-red-600/50 underline-offset-4 transition-colors hover:text-red-600"
                        >
                          View our profile on {partner.name}
                          <ArrowUpRight aria-hidden="true" className="size-4 text-red-600" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
