"use client";

import { Fragment, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, PhoneCall } from "lucide-react";
import {
  contactQuoteSchema,
  submitLead,
  CONTACT_METHOD_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  REFERRAL_OPTIONS,
  URGENCY_OPTIONS,
  type ContactQuoteValues,
} from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import type { SiteContent } from "@/data/site";
import type { ContactFormContent } from "@/data/contactPage";
import { cn } from "@/lib/utils";

const inputClasses =
  "h-12 w-full rounded-lg border border-grey-300 bg-white px-3.5 text-[15px] text-ink placeholder:text-grey-500/70 transition-colors focus:border-navy-800 focus:outline-2 focus:outline-offset-1 focus:outline-red-500/70 aria-[invalid=true]:border-red-600";

const labelClasses = "mb-1.5 block text-[14px] font-semibold text-grey-700";

const legendClasses =
  "mb-1 text-lg font-extrabold text-navy-900";

function Optional() {
  return <span className="font-normal text-grey-500">(optional)</span>;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-[14px] font-medium text-red-600">
      {message}
    </p>
  );
}

/**
 * Renders editor-written copy in which `{phone}` becomes a call link. Split
 * into text nodes rather than injected as HTML — CMS text is never treated
 * as markup.
 */
function withPhoneLink(
  text: string,
  site: SiteContent,
  linkClassName: string,
): React.ReactNode {
  const parts = text.split("{phone}");
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && (
        <a href={site.phoneHref} className={linkClassName}>
          {site.phone}
        </a>
      )}
    </Fragment>
  ));
}

interface ContactQuoteFormProps {
  site: SiteContent;
  /** Service names from Sanity (with "Other" appended by the server page). */
  serviceOptions: string[];
  /**
   * Every string this form shows, from the `contactForm` CMS section. What
   * the form COLLECTS and how it validates is deliberately not in here — see
   * `sanity/schemas/contactSections.ts` for why.
   */
  copy: ContactFormContent;
}

export function ContactQuoteForm({
  site,
  serviceOptions,
  copy,
}: ContactQuoteFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  // Honeypot lives outside react-hook-form so its value never enters the
  // schema — it is read directly off the DOM node at submit time.
  const honeypotRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ContactQuoteValues>({
    resolver: zodResolver(contactQuoteSchema),
    defaultValues: { service: "", urgency: "scheduled", contactMethod: "phone" },
  });

  const urgency = useWatch({ control, name: "urgency" });

  async function onSubmit(values: ContactQuoteValues) {
    setStatus("idle");
    try {
      await submitLead(
        { ...values, website: honeypotRef.current?.value ?? "" },
        "contact-page",
      );
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 text-center shadow-(--shadow-card-lg)"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-red-100">
          <CheckCircle2 aria-hidden="true" className="size-7 text-red-600" />
        </span>
        <h3 className="text-2xl font-extrabold tracking-tight text-navy-900">
          {copy.successHeading}
        </h3>
        <p className="max-w-sm text-[15px] leading-relaxed text-grey-500">
          {withPhoneLink(
            copy.successBody,
            site,
            "font-bold text-red-600 hover:underline",
          )}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 text-sm font-semibold text-navy-900 underline underline-offset-4 hover:text-red-600"
        >
          {copy.successAgainLabel}
        </button>
      </div>
    );
  }

  return (
    <form
      // handleSubmit is invoked inside the event (not during render) so the
      // honeypot ref is only ever read at submit time.
      onSubmit={(event) =>
        handleSubmit(onSubmit, (formErrors) => {
          // Move focus to the first invalid field so keyboard and
          // screen-reader users land on what needs fixing.
          const first = Object.keys(formErrors)[0] as
            | keyof ContactQuoteValues
            | undefined;
          if (first) setFocus(first);
        })(event)
      }
      noValidate
      className="space-y-6"
    >
      {/* Honeypot: humans never see it; anything typed here marks the
          submission as a bot on the server (which fakes success). */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="contact-website">
          Leave this field empty
          <input
            id="contact-website"
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <fieldset className="rounded-2xl bg-white p-6 shadow-(--shadow-card-lg) sm:p-8">
        <legend className={legendClasses}>{copy.workLegend}</legend>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-service" className={labelClasses}>
              {copy.serviceLabel}
            </label>
            <select
              id="contact-service"
              aria-invalid={!!errors.service}
              aria-describedby={errors.service ? "contact-service-error" : undefined}
              className={inputClasses}
              {...register("service")}
            >
              <option value="">{copy.servicePlaceholder}</option>
              {serviceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <FieldError id="contact-service-error" message={errors.service?.message} />
          </div>

          <div>
            <label htmlFor="contact-property-type" className={labelClasses}>
              {copy.propertyTypeLabel} <Optional />
            </label>
            <select
              id="contact-property-type"
              className={inputClasses}
              {...register("propertyType")}
            >
              <option value="">Select…</option>
              {PROPERTY_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="contact-location" className={labelClasses}>
              {copy.locationLabel} <Optional />
            </label>
            <input
              id="contact-location"
              type="text"
              autoComplete="street-address"
              className={inputClasses}
              {...register("location")}
            />
          </div>

          <div
            role="radiogroup"
            aria-labelledby="contact-urgency-label"
            className="sm:col-span-2"
          >
            <p id="contact-urgency-label" className={labelClasses}>
              {copy.urgencyLabel}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {URGENCY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-grey-300 bg-white px-3.5 text-[14px] font-semibold text-grey-700 transition-colors has-checked:border-navy-800 has-checked:bg-offwhite has-checked:text-navy-900"
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="size-4 accent-red-600"
                    {...register("urgency")}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {urgency === "emergency" && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-3 rounded-lg border border-red-600/30 bg-red-100 p-4"
              >
                <PhoneCall aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600" />
                <p className="text-[14px] leading-relaxed font-semibold text-navy-900">
                  {withPhoneLink(
                    copy.emergencyNotice,
                    site,
                    "font-extrabold text-red-600 underline underline-offset-2",
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="contact-message" className={labelClasses}>
              {copy.messageLabel}
            </label>
            <textarea
              id="contact-message"
              rows={4}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "contact-message-error" : undefined}
              className={cn(inputClasses, "h-auto min-h-28 py-3")}
              placeholder={copy.messagePlaceholder}
              {...register("message")}
            />
            <FieldError id="contact-message-error" message={errors.message?.message} />
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl bg-white p-6 shadow-(--shadow-card-lg) sm:p-8">
        <legend className={legendClasses}>{copy.contactLegend}</legend>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className={labelClasses}>
              {copy.nameLabel}
            </label>
            <input
              id="contact-name"
              type="text"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              className={inputClasses}
              {...register("name")}
            />
            <FieldError id="contact-name-error" message={errors.name?.message} />
          </div>

          <div>
            <label htmlFor="contact-company" className={labelClasses}>
              {copy.companyLabel} <Optional />
            </label>
            <input
              id="contact-company"
              type="text"
              autoComplete="organization"
              className={inputClasses}
              {...register("company")}
            />
          </div>

          <div>
            <label htmlFor="contact-phone" className={labelClasses}>
              {copy.phoneLabel}
            </label>
            <input
              id="contact-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "contact-phone-error" : undefined}
              className={inputClasses}
              {...register("phone")}
            />
            <FieldError id="contact-phone-error" message={errors.phone?.message} />
          </div>

          <div>
            <label htmlFor="contact-email" className={labelClasses}>
              {copy.emailLabel}
            </label>
            <input
              id="contact-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              className={inputClasses}
              {...register("email")}
            />
            <FieldError id="contact-email-error" message={errors.email?.message} />
          </div>

          <div
            role="radiogroup"
            aria-labelledby="contact-method-label"
            className="sm:col-span-2"
          >
            <p id="contact-method-label" className={labelClasses}>
              {copy.contactMethodLabel} <Optional />
            </p>
            <div className="grid grid-cols-3 gap-2">
              {CONTACT_METHOD_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-grey-300 bg-white text-[14px] font-semibold text-grey-700 transition-colors has-checked:border-navy-800 has-checked:bg-offwhite has-checked:text-navy-900"
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="size-4 accent-red-600"
                    {...register("contactMethod")}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="contact-referral" className={labelClasses}>
              {copy.referralLabel} <Optional />
            </label>
            <select
              id="contact-referral"
              className={inputClasses}
              {...register("referral")}
            >
              <option value="">Select…</option>
              {REFERRAL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {status === "error" && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {withPhoneLink(
            copy.errorMessage,
            site,
            "font-bold underline underline-offset-2",
          )}
        </p>
      )}

      <div>
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full" withArrow>
          {isSubmitting ? copy.submittingLabel : copy.submitLabel}
        </Button>
        {copy.submitNote && (
          <p className="mt-3 text-center text-[14px] font-medium text-grey-500">
            {withPhoneLink(
              copy.submitNote,
              site,
              "font-bold text-red-600 hover:underline",
            )}
          </p>
        )}
        {copy.consentLine && (
          <p className="mt-2 text-center text-[13px] leading-relaxed text-grey-500">
            {withPhoneLink(
              copy.consentLine,
              site,
              "font-bold text-red-600 hover:underline",
            )}
          </p>
        )}
      </div>
    </form>
  );
}
