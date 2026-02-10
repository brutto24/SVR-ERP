import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
    // @ts-expect-error - allowedDevOrigins is valid in this version but missing from types
    allowedDevOrigins: ["localhost:3000", "192.168.29.249:3000"],
  },
};

export default nextConfig;
