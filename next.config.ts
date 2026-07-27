import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
