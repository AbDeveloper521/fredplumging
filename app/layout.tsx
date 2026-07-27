import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { getSite } from "@/sanity/lib/getSite";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const title = `Commercial Plumbing Services in Dallas–Fort Worth | ${site.name}`;
  const description = `${site.name} provides 24/7 commercial, multi-family, drain, sewer, maintenance, and emergency plumbing services across the ${site.serviceArea}.`;

  return {
    metadataBase: new URL(site.url),
    title,
    description,
    alternates: {
      // Canonical placeholder — confirm the production domain before launch.
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
    <html lang="en" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
