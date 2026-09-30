import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // Use a separate filename so the PWA build never overwrites our
  // hand-written high-reliability offline worker at public/sw.js.
  sw: "sw-pwa.js",
});

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    remotePatterns: [],
    // Several onboarding/auth illustrations use quality={95}; Next 16
    // rejects unconfigured qualities (the optimizer would 400 and the
    // image would render broken).
    qualities: [75, 95],
  },
  // turbopack is dev-only — do NOT enable it here, it prevents Vercel from
  // generating next-server.js.nft.json and breaks the production deployment.
};

export default withPWA(nextConfig);
