import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "x-debug-headers",
            value: "enabled",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/debug-headers",
        destination: "/api/debug-headers",
      },
    ];
  },
};

export default nextConfig;
