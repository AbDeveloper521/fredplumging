import { draftMode } from "next/headers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileCallBar } from "@/components/layout/MobileCallBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { SanityLive } from "@/sanity/lib/live";

/**
 * Marketing-site chrome. Lives in the (site) route group so the embedded
 * Sanity Studio at /studio renders without header/footer/call bar — and,
 * for the same reason, this is the ONE place <SanityLive> renders: the
 * Studio route never mounts a second copy. `draftMode()` is the only
 * dynamic API allowed in a prerendered layout body.
 * The bottom padding compensates for the fixed MobileCallBar.
 */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: isDraftMode } = await draftMode();
  return (
    <div className="flex min-h-full flex-1 flex-col pb-[68px] lg:pb-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:bg-red-600 focus:px-5 focus:py-3 focus:font-bold focus:text-white"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileCallBar />
      <JsonLd />
      <SanityLive includeDrafts={isDraftMode} />
    </div>
  );
}
