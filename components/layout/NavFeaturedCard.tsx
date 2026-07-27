import type { SiteContent } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface NavFeaturedCardProps {
  site: SiteContent;
  className?: string;
  onNavigate?: () => void;
}

/**
 * Emergency-dispatch conversion card shared by the desktop mega panels and
 * the mobile menu. Pure markup — safe inside any client tree.
 */
export function NavFeaturedCard({ site, className, onNavigate }: NavFeaturedCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-5 rounded-xl bg-navy-800 p-4 shadow-(--shadow-card)",
        className,
      )}
    >
      <div>
        <p className="flex items-center gap-2.5 text-[14px] font-bold text-white">
          <span
            aria-hidden="true"
            className="availability-dot size-2 shrink-0 rounded-full bg-red-500"
          />
          24/7 Emergency Service
        </p>
        <p className="mt-2 text-[13px] leading-snug text-grey-300">
          Burst pipe, backup, or no water? A live dispatcher answers around the
          clock across the {site.serviceArea}.
        </p>
      </div>
      <Button
        href={site.phoneHref}
        size="md"
        withPhoneIcon
        className="w-full whitespace-nowrap"
        onClick={onNavigate}
      >
        {site.phone}
      </Button>
    </div>
  );
}
