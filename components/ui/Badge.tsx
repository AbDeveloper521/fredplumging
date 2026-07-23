import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "red" | "navy" | "outline" | "soft";
  className?: string;
}

const variants = {
  red: "bg-red-600 text-white",
  navy: "bg-navy-900 text-white",
  outline: "border border-white/25 text-white",
  soft: "bg-red-100 text-red-600",
};

export function Badge({ children, variant = "soft", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide uppercase",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
