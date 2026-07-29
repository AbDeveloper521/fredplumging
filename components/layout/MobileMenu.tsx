"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import type { Navigation } from "@/data/navigation";
import type { SiteContent } from "@/data/site";
import { isExactActive, isSectionActive } from "@/components/layout/navActive";
import { navIcons } from "@/components/layout/navIcons";
import { NavFeaturedCard } from "@/components/layout/NavFeaturedCard";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navigation: Navigation;
  site: SiteContent;
}

export function MobileMenu({ open, onClose, navigation, site }: MobileMenuProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  /** Section the visitor is currently inside — expanded by default. */
  const activeKey =
    navigation.items.find((group) => isSectionActive(pathname, group.href))
      ?._key ?? null;

  const [expanded, setExpanded] = useState<string | null>(activeKey);

  // Re-sync the open accordion when the route changes.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setExpanded(activeKey);
  }

  // Lock body scroll while the menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm lg:hidden"
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-navy-950 shadow-2xl lg:hidden"
            initial={reduceMotion ? { x: 0 } : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/8 px-5">
              <Logo siteName={site.name} />
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="flex size-11 items-center justify-center rounded-xl border border-white/20 text-white transition-colors hover:bg-white/10"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <nav
              aria-label="Mobile navigation"
              className="flex-1 overflow-y-auto px-3 py-4"
            >
              {/* Conversion card first — thumb-reachable at the top of the list. */}
              <NavFeaturedCard site={site} className="mb-4" onNavigate={onClose} />

              <ul className="space-y-1">
                {navigation.items.map((group) => {
                  const isExpanded = expanded === group._key;
                  const sectionActive = isSectionActive(pathname, group.href);
                  const panelId = `mobile-panel-${group._key}`;

                  return (
                    <li key={group._key}>
                      {/* Label and chevron are separate tap targets: the label
                          navigates to the section landing page, the chevron
                          only expands the children. */}
                      <div className="flex items-center gap-1">
                        <Link
                          href={group.href}
                          onClick={onClose}
                          aria-current={sectionActive ? "page" : undefined}
                          className="relative flex min-h-12 flex-1 items-center rounded-xl px-4 py-3 text-[17px] font-semibold text-white transition-colors hover:bg-white/6"
                        >
                          {/* Section marker: the filled pill is reserved for
                              the exact current page (child rows below). */}
                          {sectionActive && (
                            <span
                              aria-hidden="true"
                              className="absolute top-1/2 left-0 h-6 w-0.5 -translate-y-1/2 rounded-full bg-red-500"
                            />
                          )}
                          {group.label}
                        </Link>
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
                          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${group.label} submenu`}
                          onClick={() =>
                            setExpanded(isExpanded ? null : group._key)
                          }
                          className="flex size-12 shrink-0 items-center justify-center rounded-xl text-grey-300 transition-colors hover:bg-white/6 hover:text-white"
                        >
                          <ChevronDown
                            aria-hidden="true"
                            className={cn(
                              "size-5 transition-transform duration-200",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </button>
                      </div>
                      <div
                        id={panelId}
                        className={cn(
                          "grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none",
                          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                        )}
                      >
                        {/* All vertical spacing lives inside this
                            overflow-hidden element so the grid-rows accordion
                            clips it during the transition instead of letting
                            it jump at the end. */}
                        <div className="overflow-hidden">
                          <ul
                            className="mt-1 mb-2 ml-3 space-y-0.5 rounded-xl border border-white/8 bg-white/3 p-1.5"
                            aria-hidden={!isExpanded}
                          >
                          {group.children.map((child) => {
                            const Icon = child.icon
                              ? navIcons[child.icon]
                              : null;
                            const childActive = isExactActive(
                              pathname,
                              child.href,
                            );
                            return (
                              <li key={child._key}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  tabIndex={isExpanded ? undefined : -1}
                                  aria-current={
                                    childActive ? "page" : undefined
                                  }
                                  className={cn(
                                    "flex min-h-11 items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/6",
                                    childActive && "bg-white/8",
                                  )}
                                >
                                  {Icon ? (
                                    <span
                                      aria-hidden="true"
                                      className={cn(
                                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                                        childActive ? "bg-red-600/15" : "bg-navy-800",
                                      )}
                                    >
                                      <Icon className="size-4 text-red-500" />
                                    </span>
                                  ) : (
                                    <span
                                      aria-hidden="true"
                                      className="mt-[9px] size-1 shrink-0 rounded-full bg-red-500"
                                    />
                                  )}
                                  <span className="min-w-0">
                                    <span
                                      className={cn(
                                        "block text-[15px] font-medium",
                                        childActive
                                          ? "text-white"
                                          : "text-grey-300",
                                      )}
                                    >
                                      {child.label}
                                    </span>
                                    {child.description && (
                                      <span className="mt-0.5 block text-[12.5px] leading-snug text-grey-300/75">
                                        {child.description}
                                      </span>
                                    )}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Phone lives in the featured card up top; only the quote CTA
                stays pinned here. */}
            <div className="shrink-0 border-t border-white/8 p-5">
              <Button
                href={navigation.cta.href}
                className="w-full"
                withArrow
                onClick={onClose}
              >
                {navigation.cta.label}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
