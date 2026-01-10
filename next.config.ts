import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack root configuration
  turbopack: {
    root: __dirname,
  },
  // Allow CORS from local development
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
