import type { NextConfig } from "next";
import { R2_CDN_URL } from "./constants/urls";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      `${process.env.R2_BUCKER!}.${process.env.R2_ENDPOINT!}`,
      R2_CDN_URL,
    ],
  },
};

export default nextConfig;
