import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev'de telefon LAN IP'sinden eriştiğinde HMR (canlı güncelleme) çalışsın.
  // Yoksa "Blocked cross-origin request to /_next/webpack-hmr" ile telefon eski kodu görür.
  allowedDevOrigins: ["192.168.1.104"],
};

export default nextConfig;
