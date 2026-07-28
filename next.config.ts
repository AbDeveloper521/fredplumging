import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Dev-only: without this, `next dev` caches Sanity fetch responses across
    // HMR refreshes (even uncached ones), so a Studio publish can look like it
    // "didn't work" until a full navigation. Documented in
    // node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverComponentsHmrCache.md
    serverComponentsHmrCache: false,
  },
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
