import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fashion-be-nfrg.onrender.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
