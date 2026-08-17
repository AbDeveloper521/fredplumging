import { Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import type { ContactChannelsContent } from "@/data/contactPage";
import type { SiteContent } from "@/data/site";

interface ContactChannelsSectionProps {
  section: ContactChannelsContent;
  site: SiteContent;
  id: string;
}

/**
 * The two-path band: call now (dark card) beside send-the-details (light
 * card). Both the number and its tel: link come from Site Settings — the
 * section stores only the words around them.
 *
 * Spacing note: the top padding is deliberately small because this band is
 * designed to sit directly under a hero, whose white wave provides the
 * separation. Placed lower down a page it will sit close to the band above
 * it.
 */
export function ContactChannelsSection({
  section,
  site,
  id,
}: ContactChannelsSectionProps) {
  const hasCta = Boolean(section.quoteCtaLabel && section.quoteCtaHref);

  return (
    <section id={id} aria-label="How to reach us" className="bg-white pt-2 pb-16 sm:pb-20">
      <Container className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-navy-950 p-8 sm:p-10">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-red-600" />
          <p className="flex items-center gap-3 eyebrow text-red-500">
            <span
              aria-hidden="true"
              className="availability-dot size-1.5 rounded-full bg-red-500"
            />
            {section.emergencyHeading}
          </p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-grey-300">
            {section.emergencyBody}
          </p>
          <a
            href={site.phoneHref}
            className="mt-6 inline-flex items-center gap-3 text-[30px] font-extrabold text-white transition-colors hover:text-red-500 sm:text-[38px]"
          >
            <Phone aria-hidden="true" className="size-8 text-red-500" />
            {site.phone}
          </a>
          {section.emergencyNote && (
            <p className="mt-2 text-[13px] font-semibold tracking-wide text-grey-300 uppercase">
              {section.emergencyNote}
            </p>
          )}
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-grey-100 bg-offwhite p-8 shadow-(--shadow-card) sm:p-10">
          <div>
            <p className="eyebrow text-red-600">{section.quoteHeading}</p>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-grey-700">
              {section.quoteBody}
            </p>
          </div>
          {hasCta && (
            <div className="mt-7">
              <Button
                href={section.quoteCtaHref!}
                variant="dark"
                size="lg"
                withArrow
              >
                {section.quoteCtaLabel}
              </Button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
