import { Star } from "lucide-react";
import type { GoogleReviewProfile } from "@/data/googleReviews";
import { cn } from "@/lib/utils";

interface GoogleRatingBadgeProps {
  profile: GoogleReviewProfile;
  variant?: "light" | "dark";
  className?: string;
}

/**
 * The four-colour Google "G". Official brand colours — Google's brand
 * guidelines forbid recolouring it to the site palette.
 */
export function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.26-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.28V6.61H1.27a12 12 0 0 0 0 10.78l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

/**
 * Compact Google-listing summary: the "G", the rating, a 5-star row, and the
 * review count linking out to the listing. Server component — no state.
 */
export function GoogleRatingBadge({
  profile,
  variant = "light",
  className,
}: GoogleRatingBadgeProps) {
  const dark = variant === "dark";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full border",
          dark ? "border-white/15 bg-white" : "border-grey-100 bg-white shadow-(--shadow-card)",
        )}
      >
        <GoogleG className="size-5" />
      </span>
      <div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-bold",
              dark ? "text-white" : "text-navy-900",
            )}
          >
            {profile.rating.toFixed(1)}
          </span>
          <span
            className="flex items-center gap-0.5"
            role="img"
            aria-label={`Rated ${profile.rating.toFixed(1)} out of 5 stars on Google`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                aria-hidden="true"
                className="size-3.5 fill-amber-400 text-amber-400"
              />
            ))}
          </span>
        </div>
        <a
          href={profile.reviewsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-[13px] font-semibold underline-offset-4 hover:underline",
            dark ? "text-grey-300 hover:text-white" : "text-grey-500 hover:text-navy-900",
          )}
        >
          {profile.reviewCount} Google reviews
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
