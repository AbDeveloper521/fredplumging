"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Menu,
  Phone,
} from "lucide-react";
import { navigation } from "@/data/navigation";
import { site } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenDropdown(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Top utility bar */}
      <div
        className={cn(
          "hidden overflow-hidden bg-navy-950 text-grey-300 transition-[max-height] duration-300 lg:block",
          scrolled ? "max-h-0" : "max-h-12",
        )}
      >
        <div className="mx-auto flex h-10 max-w-[1320px] items-center justify-between px-5 text-[13px] font-medium sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center gap-6">
            <a
              href={site.emailHref}
              className="flex items-center gap-2 transition-colors hover:text-white"
            >
              <Mail aria-hidden="true" className="size-3.5 text-red-500" />
              {site.email}
            </a>
            <a
              href={site.phoneHref}
              className="flex items-center gap-2 transition-colors hover:text-white"
            >
              <Phone aria-hidden="true" className="size-3.5 text-red-500" />
              {site.phone}
            </a>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-3.5 text-red-500" />
              Serving Dallas–Fort Worth Metroplex
            </span>
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="availability-dot size-1.5 rounded-full bg-red-500"
              />
              <Clock aria-hidden="true" className="size-3.5 text-red-500" />
              24/7 Emergency Service
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div
        className={cn(
          "transition-all duration-300",
          scrolled
            ? "bg-navy-950/92 shadow-(--shadow-header) backdrop-blur-md"
            : "bg-navy-950/40 backdrop-blur-sm",
        )}
      >
        <nav
          ref={navRef}
          aria-label="Main navigation"
          className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between gap-6 px-5 sm:px-6 lg:px-8 xl:px-10"
        >
          <Logo theme="dark" />

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) =>
              item.children ? (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    aria-expanded={openDropdown === item.label}
                    aria-haspopup="true"
                    onClick={() =>
                      setOpenDropdown(openDropdown === item.label ? null : item.label)
                    }
                    className={cn(
                      "flex h-11 items-center gap-1.5 rounded-lg px-3 text-[15px] font-semibold whitespace-nowrap text-white/85 transition-colors hover:bg-white/8 hover:text-white",
                      openDropdown === item.label && "bg-white/8 text-white",
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-4 text-grey-300 transition-transform duration-200",
                        openDropdown === item.label && "rotate-180",
                      )}
                    />
                  </button>
                  {openDropdown === item.label && (
                    <ul className="absolute left-0 top-full w-64 rounded-xl border border-white/8 bg-navy-900 p-2 shadow-(--shadow-card-lg)">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[14px] font-medium text-grey-300 transition-colors hover:bg-white/6 hover:text-white"
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
                  )}
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex h-11 items-center rounded-lg px-3 text-[15px] font-semibold whitespace-nowrap text-white/85 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          {/* Desktop actions */}
          <div className="hidden items-center gap-4 lg:flex">
            <a
              href={site.phoneHref}
              className="hidden items-center gap-2 text-[15px] font-bold whitespace-nowrap text-white transition-colors hover:text-red-500 xl:flex"
            >
              <Phone aria-hidden="true" className="size-4 text-red-500" />
              {site.phone}
            </a>
            <Button href="/contact" size="md" className="whitespace-nowrap">
              Request Service
            </Button>
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={site.phoneHref}
              aria-label={`Call Fred's Plumbing at ${site.phone}`}
              className="flex size-11 items-center justify-center rounded-xl bg-red-600 text-white transition-colors hover:bg-red-500"
            >
              <Phone aria-hidden="true" className="size-5" />
            </a>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen(true)}
              className="flex size-11 items-center justify-center rounded-xl border border-white/20 text-white transition-colors hover:bg-white/10"
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>
          </div>
        </nav>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
