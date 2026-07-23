import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconFeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
  theme?: "light" | "dark";
  className?: string;
}

export function IconFeature({
  icon: Icon,
  title,
  description,
  theme = "light",
  className,
}: IconFeatureProps) {
  const dark = theme === "dark";

  return (
    <div className={cn("flex gap-4", className)}>
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl",
          dark ? "border border-white/12 bg-white/5" : "bg-red-100",
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn("size-[22px]", dark ? "text-red-500" : "text-red-600")}
        />
      </span>
      <div>
        <h3
          className={cn(
            "text-[17px] font-bold tracking-tight",
            dark ? "text-white" : "text-navy-900",
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "mt-1.5 text-[15px] leading-relaxed",
            dark ? "text-grey-300" : "text-grey-500",
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
