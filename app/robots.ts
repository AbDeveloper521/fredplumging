import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/api/"],
    },
    // Same origin as every canonical (lib/siteUrl.ts) — a sitemap advertised
    // on one host and canonicals on another is the classic way to split
    // indexing signals.
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
