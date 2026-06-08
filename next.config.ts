import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  headers: async () => [
    {
      source: "/giscus-:theme.css",
      headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
    },
  ],
};

export default nextConfig;
