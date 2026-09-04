import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  // Register in a client component so a newly activated worker can refresh the
  // document and keep App Router HTML aligned with its JavaScript chunks.
  register: false,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Keep `next dev` from racing with production exports over the same generated files.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: { unoptimized: true },
};

export default withPWA(nextConfig);
