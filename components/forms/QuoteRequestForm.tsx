"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import {
  quoteRequestSchema,
  submitLead,
  type QuoteRequestValues,
} from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import type { SiteContent } from "@/data/site";
import { cn } from "@/lib/utils";

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

export function QuoteRequestForm({ site }: { site: SiteContent }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteRequestValues>({
    resolver: zodResolver(quoteRequestSchema),
  });

  async function onSubmit(values: QuoteRequestValues) {
    setStatus("idle");
    try {
      await submitLead(values, "final-cta");
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
        className="flex min-h-[380px] flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 text-center shadow-(--shadow-card-lg)"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-red-100">
          <CheckCircle2 aria-hidden="true" className="size-7 text-red-600" />
        </span>
        <h3 className="text-2xl font-extrabold tracking-tight text-navy-900">
          Thank you
        </h3>
        <p className="max-w-sm text-[15px] leading-relaxed text-grey-500">
          We received your request and will reach out to discuss next steps.
          Need us sooner? Call{" "}
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
      <h3 className="text-xl font-extrabold tracking-tight text-navy-900">
        Request Service
      </h3>
      <p className="mt-1.5 text-sm text-grey-500">
        We typically respond within one business hour.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div>
          <label htmlFor="cta-name" className={labelClasses}>
            Name
          </label>
          <input
            id="cta-name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "cta-name-error" : undefined}
            className={inputClasses}
            {...register("name")}
          />
          <FieldError id="cta-name-error" message={errors.name?.message} />
        </div>

        <div>
          <label htmlFor="cta-phone" className={labelClasses}>
            Phone
          </label>
          <input
            id="cta-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "cta-phone-error" : undefined}
            className={inputClasses}
            {...register("phone")}
          />
          <FieldError id="cta-phone-error" message={errors.phone?.message} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cta-email" className={labelClasses}>
            Email
          </label>
          <input
            id="cta-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "cta-email-error" : undefined}
            className={inputClasses}
            {...register("email")}
          />
          <FieldError id="cta-email-error" message={errors.email?.message} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cta-company" className={labelClasses}>
            Property or company{" "}
            <span className="font-normal text-grey-500">(optional)</span>
          </label>
          <input
            id="cta-company"
            type="text"
            autoComplete="organization"
            className={inputClasses}
            {...register("company")}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cta-message" className={labelClasses}>
            Message
          </label>
          <textarea
            id="cta-message"
            rows={3}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "cta-message-error" : undefined}
            className={cn(inputClasses, "h-auto min-h-24 py-3")}
            placeholder="Tell us about your property and what you need…"
            {...register("message")}
          />
          <FieldError id="cta-message-error" message={errors.message?.message} />
        </div>

        {status === "error" && (
          <p role="alert" className="text-sm font-medium text-red-600 sm:col-span-2">
            Something went wrong sending your request. Please try again or call
            us directly.
          </p>
        )}

        <div className="sm:col-span-2">
          <Button type="submit" loading={isSubmitting} className="w-full" withArrow>
            {isSubmitting ? "Sending…" : "Request Service"}
          </Button>
          <p className="mt-3 text-center text-[13px] font-medium text-grey-500">
            No obligation. Clear communication. Responsive service.
          </p>
        </div>
      </form>
    </div>
  );
}
