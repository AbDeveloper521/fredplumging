import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NavGroup } from "@/data/navigation";
import { navIcons } from "@/components/layout/navIcons";
import { isExactActive } from "@/components/layout/navActive";
import { NavFeaturedCard } from "@/components/layout/NavFeaturedCard";
import { cn } from "@/lib/utils";

interface MegaPanelProps {
  group: NavGroup;
  pathname: string;
  onNavigate: () => void;
}

/**
 * Two-column icon grid plus the emergency conversion card. Mounted only while
 * its dropdown is open; item entrances are CSS (`.animate-nav-item`) so the
 * stagger costs no extra JS.
 */
export function MegaPanel({ group, pathname, onNavigate }: MegaPanelProps) {
  return (
    <div className="grid grid-cols-[1fr_248px] gap-2 rounded-xl border border-white/8 bg-navy-900 p-2 shadow-(--shadow-card-lg)">
      <ul className="grid grid-cols-2 content-start gap-1">
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
                  "group/item flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-navy-800",
                  childActive && "bg-navy-800",
                )}
              >
                {Icon && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy-800 transition-colors group-hover/item:bg-navy-700",
                      childActive && "bg-navy-700",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 text-grey-300 transition-colors group-hover/item:text-red-500",
                        childActive && "text-red-500",
                      )}
                    />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[14px] font-semibold text-white">
                    {child.label}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0 -translate-x-0.5 text-red-500 opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                    />
                  </span>
                  {child.description && (
                    <span className="mt-0.5 block text-[12.5px] leading-snug font-normal text-grey-300/75">
                      {child.description}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <NavFeaturedCard
        className="animate-nav-item"
        onNavigate={onNavigate}
      />
    </div>
  );
}
