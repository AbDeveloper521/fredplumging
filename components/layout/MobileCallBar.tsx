import { Phone } from "lucide-react";
import { site } from "@/data/site";

/** Sticky bottom emergency call bar — mobile and tablet only. */
export function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy-950/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between gap-4 px-5">
      <p className="flex items-center gap-2.5 text-sm font-bold text-white">
        <span
          aria-hidden="true"
          className="availability-dot size-2 rounded-full bg-red-500"
        />
        24/7 Emergency
      </p>
      <a
        href={site.phoneHref}
        className="flex h-12 items-center gap-2.5 rounded-xl bg-red-600 px-6 text-[15px] font-bold text-white transition-colors hover:bg-red-500"
      >
        <Phone aria-hidden="true" className="size-[18px]" />
        Call Now
      </a>
      </div>
    </div>
  );
}
