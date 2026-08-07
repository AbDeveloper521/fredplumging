import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { getSite } from "@/sanity/lib/getSite";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Headings only. Weight is omitted on purpose: Fraunces ships a variable
// `wght` font, so the one file covers the 700 (font-bold) and 800
// (font-extrabold) the headings actually use. The SOFT/WONK/opsz axes are
// left out — they are opt-in and would only add bytes.
const fraunces = Fraunces({
  variable: "--font-fraunces",
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
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
