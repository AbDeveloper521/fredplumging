import { ImageIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  /** Description of the intended photograph — doubles as the accessible label. */
  label: string;
  icon?: LucideIcon;
  tone?: "navy" | "steel";
  /** Hide the caption chip for small placements. */
  showCaption?: boolean;
  className?: string;
}

/**
 * Styled stand-in for production photography.
 * Swap for <Image src="/images/..." /> once real assets are available —
 * the intended file names live in data/services.ts and data/industries.ts.
 */
export function ImagePlaceholder({
  label,
  icon: Icon = ImageIcon,
  tone = "navy",
  showCaption = true,
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden",
        tone === "navy"
          ? "bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950"
          : "bg-gradient-to-br from-grey-700 via-navy-800 to-navy-950",
        className,
      )}
    >
      {/* Blueprint texture + lighting */}
      <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_20%,rgb(255_255_255/0.09),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_90%,rgb(228_42_49/0.14),transparent_55%)]"
      />
      {/* Diagonal pipe-run accent lines */}
      <div
        aria-hidden="true"
        className="absolute -left-8 top-1/3 h-px w-2/3 -rotate-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -right-8 bottom-1/4 h-px w-2/3 -rotate-12 bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
      />

      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl border border-white/15 bg-white/5">
          <Icon aria-hidden="true" className="size-5 text-white/60" />
        </span>
        {showCaption && (
          <span className="max-w-[240px] text-xs leading-snug font-medium text-white/45">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
