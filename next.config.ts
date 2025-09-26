import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable CSS optimization to avoid lightningcss issues
    optimizeCss: false,
  },
  // Disable SWC minification to avoid potential issues
  swcMinify: false,
};

export default nextConfig;
