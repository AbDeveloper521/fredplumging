import { Star } from "lucide-react";
import type { Testimonial } from "@/data/testimonials";
import { GoogleG } from "@/components/ui/GoogleRatingBadge";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  testimonial: Testimonial;
  featured?: boolean;
  className?: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`Rated ${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn(
            "size-[18px]",
            i < rating ? "fill-amber-400 text-amber-400" : "fill-grey-100 text-grey-100",
          )}
        />
      ))}
    </div>
  );
}

export function TestimonialCard({
  testimonial,
  featured = false,
  className,
}: TestimonialCardProps) {
  return (
    <figure
      className={cn(
        "flex flex-col rounded-2xl border border-grey-100 bg-white p-7 shadow-(--shadow-card)",
        featured && "border-l-4 border-l-red-600 p-8 sm:p-10",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Stars rating={testimonial.rating} />
        {testimonial.source === "google" && (
          <span role="img" aria-label="Posted on Google">
            <GoogleG className="size-4" />
          </span>
        )}
      </div>
      <blockquote
        className={cn(
          "mt-5 leading-relaxed text-grey-700",
          featured
            ? "text-xl font-medium tracking-tight text-navy-900 sm:text-2xl"
            : "text-[15px]",
        )}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-grey-100 pt-5">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white"
        >
          {testimonial.name.charAt(0)}
        </span>
        <div>
          <p className="text-sm font-bold text-navy-900">{testimonial.name}</p>
          <p className="text-[13px] text-grey-500">
            {testimonial.role
              ? `${testimonial.role} · `
              : testimonial.reviewerMeta
                ? `${testimonial.reviewerMeta} · `
                : ""}
            {testimonial.sourceUrl ? (
              <a
                href={testimonial.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-navy-900 hover:underline"
              >
                {testimonial.date}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              testimonial.date
            )}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
