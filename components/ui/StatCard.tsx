import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string;
  label: string;
  icon?: LucideIcon;
  theme?: "light" | "dark";
  className?: string;
}

export function StatCard({
  value,
  label,
  icon: Icon,
  theme = "light",
  className,
}: StatCardProps) {
  const dark = theme === "dark";

  return (
    <div
      className={cn(
        "border-l-2 border-red-600 pl-5",
        dark ? "text-white" : "text-navy-900",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        {Icon && <Icon aria-hidden="true" className="size-5 text-red-500" />}
        <p className="font-heading text-3xl font-extrabold tracking-tight sm:text-[34px]">
          {value}
        </p>
      </div>
      <p
        className={cn(
          "mt-1.5 text-sm font-medium",
          dark ? "text-grey-300" : "text-grey-500",
        )}
      >
        {label}
      </p>
    </div>
  );
}
