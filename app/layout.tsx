import type { Metadata } from "next";
import { Montserrat, Roboto_Condensed } from "next/font/google";
import { getSite } from "@/sanity/lib/getSite";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

/* ---------------------------------------------------------------------------
 * THE TYPEFACES — this block is the only place in the codebase that names one.
 *
 * Everything else resolves through two semantic tokens declared in
 * `app/globals.css`: `--font-heading` and `--font-sans` (body). Those tokens
 * point at the two face variables below, which are deliberately named for
 * their ROLE, not for the font — so swapping a typeface again is an edit to
 * this block and nothing else:
 *
 *   1. change the import,
 *   2. change the loader call it is passed to.
 *
 * No CSS, no component, and no utility class needs to be touched.
 *
 * Both families are variable fonts, so `weight` is omitted on purpose: one
 * file spans the whole axis and covers everything the site uses (font-normal
 * 400 through font-extrabold 800) instead of shipping a static file per
 * weight. Narrowing to the 400–800 the site actually uses buys nothing —
 * Google serves byte-identical files for `wght@400..800` and `wght@100..900`,
 * and next/font's generated types for these two families accept only discrete
 * weights or the full variable axis anyway, not a range string.
 *
 * `subsets: ["latin"]` only — this is a Dallas–Fort Worth plumbing site, and
 * every extra subset is dead weight on mobile.
 *
 * `adjustFontFallback` is left at its default (on): it synthesises a
 * metric-matched local fallback so the page does not reflow when the webfont
 * lands. That matters more than usual with a condensed body face, whose
 * metrics sit a long way from any system default.
 * ------------------------------------------------------------------------- */

const headingFont = Montserrat({
  variable: "--font-heading-face",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = Roboto_Condensed({
  variable: "--font-body-face",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const title = `Commercial Plumbing Services in Dallas–Fort Worth | ${site.name}`;
  const description = `${site.name} provides 24/7 commercial, multi-family, drain, sewer, maintenance, and emergency plumbing services across the ${site.serviceArea}.`;

  return {
    // The one origin every canonical and Open Graph URL resolves against —
    // environment-driven (lib/siteUrl.ts), never from the CMS.
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      url: "/",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Root layout is chrome-free so the embedded Sanity Studio at /studio doesn't
 * inherit the marketing header/footer. Site chrome lives in (site)/layout.tsx.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      {/* Browser extensions (ColorZilla's `cz-shortcut-listen`, Grammarly,
          password managers) add attributes to <body> before React hydrates,
          which reads as a hydration mismatch. This suppresses the diff on
          this element's own attributes only — mismatches in the tree below
          still report normally. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
