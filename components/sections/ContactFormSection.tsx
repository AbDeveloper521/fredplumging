import { Clock, FileCheck2, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ContactQuoteForm } from "@/components/forms/ContactQuoteForm";
import type { ContactFormContent } from "@/data/contactPage";
import type { SiteContent } from "@/data/site";
import type { Service } from "@/data/services";

interface ContactFormSectionProps {
  section: ContactFormContent;
  site: SiteContent;
  /** Feeds the "Service needed" dropdown; "Other" is appended here. */
  services: Service[];
  id: string;
}

/**
 * The contact-details sidebar. Every LABEL is editable content; every VALUE
 * comes from Site Settings, so the phone number, email, service area, hours
 * and licence exist in exactly one place on the site.
 */
function DetailsColumn({
  section,
  site,
}: {
  section: ContactFormContent;
  site: SiteContent;
}) {
  return (
    <div className="rounded-2xl border border-grey-100 bg-white p-6 shadow-(--shadow-card) sm:p-8">
      <h3 className="text-lg font-extrabold tracking-tight text-navy-900">
        {section.detailsHeading}
      </h3>
      <ul className="mt-5 space-y-5 text-[15px]">
        <li className="flex items-start gap-3">
          <Phone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div>
            <p className="font-bold text-navy-900">{section.phoneRowLabel}</p>
            <a href={site.phoneHref} className="text-grey-700 hover:text-red-600">
              {site.phone}
            </a>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div>
            <p className="font-bold text-navy-900">{section.emailRowLabel}</p>
            <a
              href={site.emailHref}
              className="break-all text-grey-700 hover:text-red-600"
            >
              {site.email}
            </a>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div>
            <p className="font-bold text-navy-900">
              {section.serviceAreaRowLabel}
            </p>
            <p className="text-grey-700">{site.serviceArea}</p>
          </div>
        </li>
        {site.hours.length > 0 && (
          <li className="flex items-start gap-3">
            <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600" />
            <div>
              <p className="font-bold text-navy-900">{section.hoursRowLabel}</p>
              {site.hours.map((row) => (
                <p key={row.days} className="text-grey-700">
                  {row.days}: {row.hours}
                </p>
              ))}
            </div>
          </li>
        )}
        <li className="flex items-start gap-3">
          <FileCheck2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div>
            <p className="font-bold text-navy-900">{section.licenseRowLabel}</p>
            <p className="text-grey-700">{site.licenseNumber}</p>
          </div>
        </li>
      </ul>
    </div>
  );
}

/**
 * The lead-capture band: heading, intro, the request form, and the contact
 * details beside it.
 *
 * The form's WORDING is all CMS content (see `contactForm` in
 * `sanity/schemas/contactSections.ts`); the form's FIELDS, validation and
 * submission path are fixed in code so a Studio edit can never break lead
 * capture or desynchronise the browser form from the server schema that
 * re-validates it.
 */
export function ContactFormSection({
  section,
  site,
  services,
  id,
}: ContactFormSectionProps) {
  const serviceOptions = [...services.map((service) => service.title), "Other"];

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-24 bg-offwhite py-16 sm:py-24"
    >
      <Container>
        <h2
          id={`${id}-heading`}
          className="max-w-2xl text-[28px] leading-tight font-extrabold tracking-tight text-navy-900 sm:text-[34px]"
        >
          {section.heading}
        </h2>
        {section.intro && (
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-grey-700">
            {section.intro}
          </p>
        )}
        <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          <ContactQuoteForm
            site={site}
            serviceOptions={serviceOptions}
            copy={section}
          />
          <DetailsColumn section={section} site={site} />
        </div>
      </Container>
    </section>
  );
}
