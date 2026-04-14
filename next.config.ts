import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sds/ui"],
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
