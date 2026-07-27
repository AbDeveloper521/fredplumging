import Link from "next/link";
import Image from "next/image";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Business name from site settings — passed in so this client-bundled
   * component doesn't import the static data/site.ts constant. */
  siteName: string;
  /**
   * The supplied logo asset only works on dark backgrounds — its "PLUMBING"
   * wordmark is pure white. `light-bg` falls back to the text lockup.
   */
  variant?: "dark-bg" | "light-bg";
  className?: string;
}

export function Logo({ siteName, variant = "dark-bg", className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${siteName} — home`}
      className={cn("flex items-center", className)}
    >
      {variant === "dark-bg" ? (
        <Image
          src="/logos/freds-plumbing-logo.png"
          alt={siteName}
          // Intrinsic 1993×789 — declared at the same ratio so the browser
          // reserves space and the header never shifts.
          width={253}
          height={100}
          preload
          className="h-11 w-auto lg:h-13"
        />
      ) : (
        // TODO: light-background logo variant not yet supplied by client —
        // rendering the text lockup instead of faking it with a CSS invert.
        <span className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-red-600 shadow-[0_6px_16px_rgb(211_33_39/0.35)]">
            <Wrench aria-hidden="true" className="size-[22px] text-white" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-[19px] font-extrabold tracking-tight whitespace-nowrap text-navy-900">
              {siteName}
            </span>
            <span className="mt-1 text-[11px] font-semibold tracking-[0.16em] uppercase whitespace-nowrap text-grey-500">
              Commercial · DFW
            </span>
          </span>
        </span>
      )}
    </Link>
  );
}
