import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Correctly nested under `eslint`
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
