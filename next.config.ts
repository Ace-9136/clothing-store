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
  // Vercel deployment optimizations
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["zustand", "@supabase/supabase-js"],
  },
};

export default nextConfig;
