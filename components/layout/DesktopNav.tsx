"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { NavGroup, Navigation } from "@/data/navigation";
import { isExactActive, isSectionActive } from "@/components/layout/navActive";
import { cn } from "@/lib/utils";

/** Hover intent: slow enough that crossing items doesn't flicker a panel open. */
const OPEN_DELAY = 120;
const CLOSE_DELAY = 200;

interface DesktopNavProps {
  navigation: Navigation;
}

export function DesktopNav({ navigation }: DesktopNavProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [pendingFocus, setPendingFocus] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement | null>());

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(
    (key: string) => {
      clearTimer();
      timerRef.current = setTimeout(() => setOpenKey(key), OPEN_DELAY);
    },
    [clearTimer],
  );

  const scheduleClose = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setOpenKey(null), CLOSE_DELAY);
  }, [clearTimer]);

  const closeNow = useCallback(() => {
    clearTimer();
    setOpenKey(null);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  // Close whenever the route changes.
  useEffect(() => {
    setOpenKey(null);
  }, [pathname]);

  // Move focus into a panel opened from the keyboard.
  useEffect(() => {
    if (!openKey || !pendingFocus) return;
    const first = panelRef.current?.querySelector<HTMLAnchorElement>("[data-nav-item]");
    first?.focus();
    setPendingFocus(false);
  }, [openKey, pendingFocus]);

  const focusTrigger = useCallback((key: string) => {
    triggerRefs.current.get(key)?.focus();
  }, []);

  function onTriggerKeyDown(e: React.KeyboardEvent, group: NavGroup) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      clearTimer();
      setOpenKey(group._key);
      setPendingFocus(true);
    } else if (e.key === "Escape") {
      closeNow();
    }
  }

  function onPanelKeyDown(e: React.KeyboardEvent, group: NavGroup) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeNow();
      focusTrigger(group._key);
      return;
    }
    if (e.key === "Tab") {
      // Let focus leave naturally, but don't leave a panel hanging open.
      closeNow();
      return;
    }
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLAnchorElement>("[data-nav-item]") ?? [],
    );
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLAnchorElement);

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  }

  return (
    <ul className="hidden items-center gap-1 lg:flex">
      {navigation.items.map((group) => {
        const open = openKey === group._key;
        const sectionActive = isSectionActive(pathname, group.href);
        const panelId = `nav-panel-${group._key}`;
        const triggerId = `nav-trigger-${group._key}`;

        return (
          <li
            key={group._key}
            className="relative"
            onMouseEnter={() => scheduleOpen(group._key)}
            onMouseLeave={scheduleClose}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                closeNow();
              }
            }}
          >
            <div
              className={cn(
                "flex h-11 items-center rounded-lg transition-colors",
                (open || sectionActive) && "bg-white/8",
              )}
            >
              <Link
                href={group.href}
                aria-current={sectionActive ? "page" : undefined}
                onClick={closeNow}
                className={cn(
                  "flex h-11 items-center rounded-l-lg pl-3 text-[15px] font-semibold whitespace-nowrap transition-colors hover:text-white",
                  sectionActive ? "text-white" : "text-white/85",
                )}
              >
                {group.label}
              </Link>
              <button
                type="button"
                id={triggerId}
                ref={(node) => {
                  triggerRefs.current.set(group._key, node);
                }}
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={`${open ? "Hide" : "Show"} ${group.label} submenu`}
                onClick={() => {
                  clearTimer();
                  setOpenKey(open ? null : group._key);
                }}
                onKeyDown={(e) => onTriggerKeyDown(e, group)}
                className="flex h-11 items-center rounded-r-lg pr-3 pl-1.5 text-white/85 transition-colors hover:text-white"
              >
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-4 text-grey-300 transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              </button>
            </div>

            <AnimatePresence>
              {open && (
                <motion.div
                  id={panelId}
                  ref={panelRef}
                  aria-labelledby={triggerId}
                  onKeyDown={(e) => onPanelKeyDown(e, group)}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
                  className={cn(
                    "absolute top-full left-0 z-50 mt-1 rounded-xl border border-white/8 bg-navy-900 p-2 shadow-(--shadow-card-lg)",
                    group.layout === "mega"
                      ? "w-[min(640px,calc(100vw-3rem))] max-w-[calc(100vw-3rem)]"
                      : "w-64",
                  )}
                >
                  <ul
                    className={cn(
                      group.layout === "mega" && "grid grid-cols-2 gap-x-1",
                    )}
                  >
                    {group.children.map((child) => {
                      const childActive = isExactActive(pathname, child.href);
                      return (
                        <li key={child._key}>
                          <Link
                            href={child.href}
                            data-nav-item=""
                            aria-current={childActive ? "page" : undefined}
                            onClick={closeNow}
                            className={cn(
                              "flex items-start gap-2.5 rounded-lg px-3.5 py-2.5 text-[14px] font-medium transition-colors hover:bg-white/6 hover:text-white",
                              childActive
                                ? "bg-white/6 text-white"
                                : "text-grey-300",
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className="mt-[7px] size-1 shrink-0 rounded-full bg-red-500"
                            />
                            <span>
                              {child.label}
                              {group.layout === "mega" && child.description && (
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
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
