"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Clock, Phone, X } from "lucide-react";
import type { Navigation } from "@/data/navigation";
import { isExactActive, isSectionActive } from "@/components/layout/navActive";
import { site } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navigation: Navigation;
}

export function MobileMenu({ open, onClose, navigation }: MobileMenuProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

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

  // Close on route change
  useEffect(() => {
    closeRef.current();
  }, [pathname]);

  // Open the accordion for the section the visitor is currently in.
  useEffect(() => {
    if (!open) return;
    const current = navigation.items.find((group) =>
      isSectionActive(pathname, group.href),
    );
    setExpanded(current?._key ?? null);
  }, [open, pathname, navigation.items]);

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
              <Logo theme="dark" />
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
                          className={cn(
                            "flex min-h-12 flex-1 items-center rounded-xl px-4 py-3 text-[17px] font-semibold transition-colors hover:bg-white/6",
                            sectionActive ? "bg-white/6 text-white" : "text-white",
                          )}
                        >
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
                        <ul
                          className="overflow-hidden pl-4"
                          aria-hidden={!isExpanded}
                        >
                          {group.children.map((child) => (
                            <li key={child._key}>
                              <Link
                                href={child.href}
                                onClick={onClose}
                                tabIndex={isExpanded ? undefined : -1}
                                aria-current={
                                  isExactActive(pathname, child.href)
                                    ? "page"
                                    : undefined
                                }
                                className={cn(
                                  "flex min-h-11 items-center gap-2.5 rounded-lg px-4 py-2.5 text-[15px] font-medium transition-colors hover:bg-white/6 hover:text-white",
                                  isExactActive(pathname, child.href)
                                    ? "text-white"
                                    : "text-grey-300",
                                )}
                              >
                                <span
                                  aria-hidden="true"
                                  className="size-1 rounded-full bg-red-500"
                                />
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="shrink-0 space-y-3 border-t border-white/8 p-5">
              <a
                href={site.phoneHref}
                className="flex items-center justify-center gap-2.5 text-lg font-extrabold text-white"
              >
                <Phone aria-hidden="true" className="size-5 text-red-500" />
                {site.phone}
              </a>
              <p className="flex items-center justify-center gap-2 text-[13px] font-medium text-grey-300">
                <Clock aria-hidden="true" className="size-3.5 text-red-500" />
                24/7 Emergency Service · DFW Metroplex
              </p>
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
