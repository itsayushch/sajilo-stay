import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: "export",
  // Keep `next dev` from racing with production exports over the same generated files.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: { unoptimized: true },
};

export default withPWA(nextConfig);
