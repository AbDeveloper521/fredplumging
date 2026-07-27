import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NavGroup } from "@/data/navigation";
import { serviceAreaCities } from "@/data/site";
import { navIcons } from "@/components/layout/navIcons";
import { isExactActive } from "@/components/layout/navActive";
import { cn } from "@/lib/utils";

interface NavListPanelProps {
  group: NavGroup;
  pathname: string;
  onNavigate: () => void;
}

/**
 * Single-column dropdown for small nav groups. When the group opts in via
 * `showServiceAreaCities`, the service-area city list from `data/site.ts`
 * renders beneath the links to give the panel a geographic footprint.
 */
export function NavListPanel({ group, pathname, onNavigate }: NavListPanelProps) {
  return (
    <div className="rounded-xl border border-white/8 bg-navy-900 p-2 shadow-(--shadow-card-lg)">
      <ul>
        {group.children.map((child, index) => {
          const Icon = child.icon ? navIcons[child.icon] : null;
          const childActive = isExactActive(pathname, child.href);
          return (
            <li
              key={child._key}
              className="animate-nav-item"
              style={{ "--nav-item-index": index } as React.CSSProperties}
            >
              <Link
                href={child.href}
                aria-current={childActive ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "group/item flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-[14px] font-medium transition-colors hover:bg-navy-800 hover:text-white",
                  childActive ? "bg-navy-800 text-white" : "text-grey-300",
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  {Icon && (
                    <Icon
                      aria-hidden="true"
                      className={cn(
                        "size-4 shrink-0 transition-colors group-hover/item:text-red-500",
                        childActive ? "text-red-500" : "text-grey-300",
                      )}
                    />
                  )}
                  <span className="min-w-0">
                    {child.label}
                    {child.description && (
                      <span className="mt-0.5 block text-[12.5px] leading-snug font-normal text-grey-300/75">
                        {child.description}
                      </span>
                    )}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0 -translate-x-0.5 text-red-500 opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                />
              </Link>
            </li>
          );
        })}
      </ul>

      {group.showServiceAreaCities && (
        <div className="animate-nav-item mt-1 border-t border-white/8 px-3.5 pt-3 pb-2">
          <p className="text-[11px] font-semibold tracking-wider text-grey-300/75 uppercase">
            Cities we cover
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1.5">
            {serviceAreaCities.map((city) => (
              <li
                key={city}
                className="flex items-center gap-2 text-[13px] text-grey-300"
              >
                <span
                  aria-hidden="true"
                  className="size-1 shrink-0 rounded-full bg-red-500"
                />
                {city}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
