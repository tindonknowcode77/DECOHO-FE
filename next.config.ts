import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const configuredBackendUrl = process.env.BACKEND_INTERNAL_URL?.trim();
    const backendUrl =
      configuredBackendUrl ||
      (process.env.NODE_ENV === "production"
        ? undefined
        : "http://127.0.0.1:3001/api");

    if (!backendUrl) {
      throw new Error(
        "BACKEND_INTERNAL_URL is required in production. Example: https://decoho-api.onrender.com/api",
      );
    }

    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendUrl.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
