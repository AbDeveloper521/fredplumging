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
  async redirects() {
    return [
      {
        // Hydro jetting shipped briefly at /commercial/hydro-jetting before
        // it was made a service. There is exactly ONE hydro jetting page and
        // it is /services/hydro-jetting, so the old address is a permanent
        // (308) redirect rather than a second page: anything already linking
        // or indexed against it hands its ranking to the surviving URL
        // instead of competing with it.
        source: "/commercial/hydro-jetting",
        destination: "/services/hydro-jetting",
        permanent: true,
      },
    ];
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
