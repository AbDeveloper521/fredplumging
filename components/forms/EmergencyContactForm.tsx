"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Phone } from "lucide-react";
import {
  emergencyContactSchema,
  submitLead,
  type EmergencyContactValues,
} from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import type { SiteContent } from "@/data/site";
import { homePageDefaults } from "@/data/homePage";
import { cn } from "@/lib/utils";

const serviceOptions = [
  "Emergency Plumbing",
  "Commercial Plumbing",
  "Drain & Sewer",
  "Preventive Maintenance",
  "Specialty Plumbing",
  "Backflow Testing",
  "Other",
];

const inputClasses =
  "h-12 w-full rounded-lg border border-grey-300 bg-white px-3.5 text-[15px] text-ink placeholder:text-grey-500/70 transition-colors focus:border-navy-800 focus:outline-2 focus:outline-offset-1 focus:outline-red-500/70 aria-[invalid=true]:border-red-600";

const labelClasses = "mb-1.5 block text-[13px] font-semibold text-grey-700";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-[13px] font-medium text-red-600">
      {message}
    </p>
  );
}

/**
 * Copy defaults live in `data/homePage.ts` (the hero's fallback) and reach
 * this form as props — the field labels, validation messages and success
 * state stay in code, because they are bound to the zod schema and the
 * screen-reader wiring rather than to marketing copy.
 */
export function EmergencyContactForm({
  site,
  heading = homePageDefaults.hero.formHeading,
  intro = homePageDefaults.hero.formIntro,
  submitLabel = homePageDefaults.hero.formSubmitLabel,
}: {
  site: SiteContent;
  heading?: string;
  intro?: string;
  submitLabel?: string;
}) {
  // Unique per mounted instance — the hero section (and this form with it)
  // can be duplicated in the Studio, and duplicate DOM ids break label
  // association for screen readers.
  const idPrefix = useId();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmergencyContactValues>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: { service: "" },
  });

  async function onSubmit(values: EmergencyContactValues) {
    setStatus("idle");
    try {
      await submitLead(values, "homepage-hero");
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
          Request received
        </h3>
        <p className="max-w-sm text-[15px] leading-relaxed text-grey-500">
          Thank you — our team will contact you shortly. If this is an active
          emergency, please call us now at{" "}
          <a href={site.phoneHref} className="font-bold text-red-600 hover:underline">
            {site.phone}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 text-sm font-semibold text-navy-900 underline underline-offset-4 hover:text-red-600"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-(--shadow-card-lg) sm:p-8">
      <h2 className="text-[22px] font-extrabold tracking-tight text-navy-900">
        {heading}
      </h2>
      {intro && (
        <p className="mt-1.5 text-sm leading-relaxed text-grey-500">{intro}</p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div>
          <label htmlFor={`${idPrefix}firstName`} className={labelClasses}>
            First name
          </label>
          <input
            id={`${idPrefix}firstName`}
            type="text"
            autoComplete="given-name"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? `${idPrefix}firstName-error` : undefined}
            className={inputClasses}
            {...register("firstName")}
          />
          <FieldError id={`${idPrefix}firstName-error`} message={errors.firstName?.message} />
        </div>

        <div>
          <label htmlFor={`${idPrefix}lastName`} className={labelClasses}>
            Last name
          </label>
          <input
            id={`${idPrefix}lastName`}
            type="text"
            autoComplete="family-name"
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? `${idPrefix}lastName-error` : undefined}
            className={inputClasses}
            {...register("lastName")}
          />
          <FieldError id={`${idPrefix}lastName-error`} message={errors.lastName?.message} />
        </div>

        <div>
          <label htmlFor={`${idPrefix}email`} className={labelClasses}>
            Email
          </label>
          <input
            id={`${idPrefix}email`}
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${idPrefix}email-error` : undefined}
            className={inputClasses}
            {...register("email")}
          />
          <FieldError id={`${idPrefix}email-error`} message={errors.email?.message} />
        </div>

        <div>
          <label htmlFor={`${idPrefix}phone`} className={labelClasses}>
            Phone
          </label>
          <input
            id={`${idPrefix}phone`}
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? `${idPrefix}phone-error` : undefined}
            className={inputClasses}
            {...register("phone")}
          />
          <FieldError id={`${idPrefix}phone-error`} message={errors.phone?.message} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${idPrefix}company`} className={labelClasses}>
            Property or company name{" "}
            <span className="font-normal text-grey-500">(optional)</span>
          </label>
          <input
            id={`${idPrefix}company`}
            type="text"
            autoComplete="organization"
            className={inputClasses}
            {...register("company")}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${idPrefix}service`} className={labelClasses}>
            Service needed
          </label>
          <select
            id={`${idPrefix}service`}
            aria-invalid={!!errors.service}
            aria-describedby={errors.service ? `${idPrefix}service-error` : undefined}
            className={cn(inputClasses, "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22none%22%20stroke%3D%22%23687383%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m4%206%204%204%204-4%22/%3E%3C/svg%3E')] bg-[position:right_0.9rem_center] bg-no-repeat pr-10")}
            defaultValue=""
            {...register("service")}
          >
            <option value="" disabled>
              Select a service…
            </option>
            {serviceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldError id={`${idPrefix}service-error`} message={errors.service?.message} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${idPrefix}message`} className={labelClasses}>
            Message
          </label>
          <textarea
            id={`${idPrefix}message`}
            rows={3}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? `${idPrefix}message-error` : undefined}
            className={cn(inputClasses, "h-auto min-h-24 py-3")}
            placeholder="Briefly describe the issue or project…"
            {...register("message")}
          />
          <FieldError id={`${idPrefix}message-error`} message={errors.message?.message} />
        </div>

        {status === "error" && (
          <p role="alert" className="text-sm font-medium text-red-600 sm:col-span-2">
            Something went wrong sending your request. Please try again or call
            us directly.
          </p>
        )}

        <div className="sm:col-span-2">
          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full"
            withArrow
          >
            {isSubmitting ? "Sending…" : submitLabel}
          </Button>
          <p className="mt-3.5 flex items-center justify-center gap-1.5 text-center text-[13px] font-medium text-grey-500">
            <Phone aria-hidden="true" className="size-3.5 text-red-600" />
            For urgent service, call{" "}
            <a href={site.phoneHref} className="font-bold text-navy-900 hover:text-red-600">
              {site.phone}
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
