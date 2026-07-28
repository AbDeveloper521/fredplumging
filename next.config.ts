import type { NextConfig } from "next";
import { sanity } from "next-sanity/live/cache-life";

const nextConfig: NextConfig = {
  // Cache Components + Sanity Live: data is cached via 'use cache' in
  // sanity/lib/live.ts and revalidated on-demand (Live events + the
  // /api/revalidate webhook), so the default cacheLife is the long-lived
  // `sanity` profile instead of time-based revalidation. Per the repo skill
  // .agents/skills/sanity-live-cache-components/ and
  // node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md
  cacheComponents: true,
  cacheLife: { default: sanity },
  images: {
    // Sanity-hosted content images (services, industries, trust logos).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
