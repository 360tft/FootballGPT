import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable turbopack for build (can still use it for dev)
  experimental: {
    // Using webpack for production builds
  },
};

export default nextConfig;
