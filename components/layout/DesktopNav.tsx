"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { NavGroup, Navigation } from "@/data/navigation";
import type { SiteContent } from "@/data/site";
import { isSectionActive } from "@/components/layout/navActive";
import { MegaPanel } from "@/components/layout/MegaPanel";
import { NavListPanel } from "@/components/layout/NavListPanel";
import { cn } from "@/lib/utils";

/** Hover intent: slow enough that crossing items doesn't flicker a panel open. */
const OPEN_DELAY = 120;
const CLOSE_DELAY = 200;

/** Same curve as `Reveal.tsx` and `.animate-rise`. */
const PANEL_EASE = [0.21, 0.47, 0.32, 0.98] as const;

interface DesktopNavProps {
  navigation: Navigation;
  site: SiteContent;
}

export function DesktopNav({ navigation, site }: DesktopNavProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [openKey, setOpenKey] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  /** Set when a panel is opened from the keyboard, so focus moves into it. */
  const focusPanelOnMount = useRef(false);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement | null>());

  // Close whenever the route changes (React's render-time state reset pattern).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenKey(null);
  }

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

  // Close on any pointer press outside the nav (hover close doesn't cover
  // touch or pen input on desktop-width viewports).
  useEffect(() => {
    if (!openKey) return;
    function onPointerDown(e: PointerEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        closeNow();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openKey, closeNow]);

  /** Runs after the panel is committed to the DOM. */
  const attachPanel = useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;
    if (node && focusPanelOnMount.current) {
      focusPanelOnMount.current = false;
      node.querySelector<HTMLAnchorElement>("a[href]")?.focus();
    }
  }, []);

  const focusTrigger = useCallback((key: string) => {
    triggerRefs.current.get(key)?.focus();
  }, []);

  function onTriggerKeyDown(e: React.KeyboardEvent, group: NavGroup) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      clearTimer();
      if (openKey === group._key) {
        // Already open (e.g. from hover) — no remount, so focus directly.
        panelRef.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
        return;
      }
      focusPanelOnMount.current = true;
      setOpenKey(group._key);
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
    // Tab moves through panel items naturally; the group's onBlur closes the
    // panel once focus leaves it entirely.
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? [],
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
    <ul ref={navRef} className="relative hidden items-center gap-1 lg:flex">
      {navigation.items.map((group) => {
        const open = openKey === group._key;
        const isMega = group.layout === "mega";
        const sectionActive = isSectionActive(pathname, group.href);
        const panelId = `nav-panel-${group._key}`;
        const triggerId = `nav-trigger-${group._key}`;
        // Mega panels center under the whole nav (anchored to the ul) so they
        // never clip the viewport edge; list panels hang off their trigger.
        const panelX = isMega ? "-50%" : 0;

        return (
          <li
            key={group._key}
            className={cn(!isMega && "relative")}
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
                  ref={attachPanel}
                  aria-labelledby={triggerId}
                  onKeyDown={(e) => onPanelKeyDown(e, group)}
                  initial={
                    reduceMotion
                      ? { opacity: 1, x: panelX }
                      : { opacity: 0, y: 8, x: panelX }
                  }
                  animate={{ opacity: 1, y: 0, x: panelX }}
                  exit={
                    reduceMotion
                      ? { opacity: 0, x: panelX }
                      : { opacity: 0, y: 8, x: panelX }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 0.18,
                    ease: PANEL_EASE,
                  }}
                  className={cn(
                    // pt-3 keeps a hoverable bridge between trigger and card.
                    "absolute top-full z-50 pt-3",
                    isMega
                      ? "left-1/2 w-[min(840px,calc(100vw-4rem))]"
                      : "left-0",
                    !isMega &&
                      (group.showServiceAreaCities ? "w-80" : "w-72"),
                  )}
                >
                  {isMega ? (
                    <MegaPanel
                      group={group}
                      site={site}
                      pathname={pathname}
                      onNavigate={closeNow}
                    />
                  ) : (
                    <NavListPanel
                      group={group}
                      site={site}
                      pathname={pathname}
                      onNavigate={closeNow}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
