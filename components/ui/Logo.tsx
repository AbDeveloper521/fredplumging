import Link from "next/link";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  theme?: "light" | "dark";
  className?: string;
}

export function Logo({ theme = "dark", className }: LogoProps) {
  const onDark = theme === "dark";

  return (
    <Link
      href="/"
      aria-label="Fred's Plumbing — home"
      className={cn("flex items-center gap-3", className)}
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-red-600 shadow-[0_6px_16px_rgb(217_39_46/0.35)]">
        <Wrench aria-hidden="true" className="size-[22px] text-white" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-heading text-[19px] font-extrabold tracking-tight whitespace-nowrap",
            onDark ? "text-white" : "text-navy-900",
          )}
        >
          Fred&rsquo;s Plumbing
        </span>
        <span
          className={cn(
            "mt-1 text-[11px] font-semibold tracking-[0.16em] uppercase whitespace-nowrap",
            onDark ? "text-grey-300" : "text-grey-500",
          )}
        >
          Commercial · DFW
        </span>
      </span>
    </Link>
  );
}
