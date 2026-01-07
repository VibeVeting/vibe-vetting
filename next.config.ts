import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["puppeteer-extra", "puppeteer-extra-plugin-stealth"],
};

export default nextConfig;
