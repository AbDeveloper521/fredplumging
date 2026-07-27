"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Clock, Mail, MapPin, Menu, Phone } from "lucide-react";
import type { Navigation } from "@/data/navigation";
import type { SiteContent } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { cn } from "@/lib/utils";

interface HeaderClientProps {
  navigation: Navigation;
  site: SiteContent;
}

export function HeaderClient({ navigation, site }: HeaderClientProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer on route change, including back/forward navigation.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
              Serving {site.serviceArea}
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
          aria-label="Main navigation"
          className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-6 lg:px-8 xl:px-10"
        >
          <Logo siteName={site.name} />

          <DesktopNav navigation={navigation} site={site} />

          {/* Desktop actions */}
          <div className="hidden items-center gap-4 lg:flex">
            <a
              href={site.phoneHref}
              className="hidden items-center gap-2 text-[15px] font-bold whitespace-nowrap text-white transition-colors hover:text-red-500 xl:flex"
            >
              <Phone aria-hidden="true" className="size-4 text-red-500" />
              {site.phone}
            </a>
            <Button
              href={navigation.cta.href}
              size="md"
              className="whitespace-nowrap"
            >
              {navigation.cta.label}
            </Button>
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={site.phoneHref}
              aria-label={`Call ${site.name} at ${site.phone}`}
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

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navigation={navigation}
        site={site}
      />
    </header>
  );
}
