"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Clock, Phone, X } from "lucide-react";
import { navigation } from "@/data/navigation";
import { site } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

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

            <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {navigation.map((item) =>
                  item.children ? (
                    <li key={item.label}>
                      <button
                        type="button"
                        aria-expanded={expanded === item.label}
                        onClick={() =>
                          setExpanded(expanded === item.label ? null : item.label)
                        }
                        className="flex min-h-12 w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[17px] font-semibold text-white transition-colors hover:bg-white/6"
                      >
                        {item.label}
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-5 text-grey-300 transition-transform duration-200",
                            expanded === item.label && "rotate-180",
                          )}
                        />
                      </button>
                      <div
                        className={cn(
                          "grid transition-[grid-template-rows] duration-300",
                          expanded === item.label
                            ? "grid-rows-[1fr]"
                            : "grid-rows-[0fr]",
                        )}
                      >
                        <ul className="overflow-hidden pl-4">
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <Link
                                href={child.href}
                                onClick={onClose}
                                className="flex min-h-11 items-center gap-2.5 rounded-lg px-4 py-2.5 text-[15px] font-medium text-grey-300 transition-colors hover:bg-white/6 hover:text-white"
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
                  ) : (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex min-h-12 items-center rounded-xl px-4 py-3 text-[17px] font-semibold text-white transition-colors hover:bg-white/6"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
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
              <Button href="/contact" className="w-full" withArrow onClick={onClose}>
                Request Service
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
