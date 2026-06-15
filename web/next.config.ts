import type { NextConfig } from "next";
import { networkInterfaces } from "os";

// Dev'de telefon/hotspot LAN IP'sinden eriştiğinde Next, kendi origin'inde
// olmayan cross-origin dev isteklerini (/_next/* — HMR + sayfa hidrasyonu)
// engeller. Engellenince HTML yüklenir ama React hidrate olmaz → butonlar
// "tıklanmıyor" görünür. Tek bir IP sabit yazmak yerine makinenin O ANKİ tüm
// yerel IPv4 adreslerini otomatik bul; böylece Wi-Fi → telefon hotspot'u
// geçişinde IP değişse de (ör. 192.168.x → 172.20.10.x) elle düzeltme gerekmez.
// Not: bu liste `next dev` başlarken hesaplanır — ağ değişince dev'i yeniden başlat.
function localIPv4s(): string[] {
  const ips: string[] = [];
  for (const addrs of Object.values(networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.family === "IPv4" && !a.internal) ips.push(a.address);
    }
  }
  return ips;
}

const nextConfig: NextConfig = {
  allowedDevOrigins: localIPv4s(),
};

export default nextConfig;
