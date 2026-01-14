import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load environment variables from ../.env
try {
  const envFile = readFileSync(resolve(__dirname, "../.env"), "utf-8");
  envFile.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        if (key.startsWith("NEXT_PUBLIC_")) {
          process.env[key] = value;
        }
      }
    }
  });
} catch (error) {
  console.warn("Could not load ../.env file:", error);
}

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_TELEGRAM_BOT_NAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME,
  },
};

export default nextConfig;
