import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
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
