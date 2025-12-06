import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude .claude directory from webpack/turbopack watching
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/.claude/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default nextConfig;
