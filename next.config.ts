import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-build",
  typedRoutes: false,
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
