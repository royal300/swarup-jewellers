import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  serverExternalPackages: ["sharp", "mysql2", "bcryptjs"],
  // Photos live on disk outside the build; never trace them into the server bundle.
  outputFileTracingExcludes: { "*": ["migration/**", "uploads/**", "deploy/**", ".deploy/**"] },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  async redirects() {
    return [
      { source: "/shop", destination: "/collections", permanent: true },
      { source: "/shop/:path*", destination: "/collections", permanent: true },
      { source: "/contact-us", destination: "/visit", permanent: true },
      { source: "/about-us", destination: "/", permanent: true },
      { source: "/wishlist", destination: "/collections", permanent: true },
    ];
  },
};

export default nextConfig;
