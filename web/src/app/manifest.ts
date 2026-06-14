import type { MetadataRoute } from "next";

/**
 * Web App Manifest — Next.js native (type-safe) yaklaşım.
 * `/manifest.webmanifest` olarak servis edilir; <link rel="manifest"> Next
 * tarafından otomatik eklenir. Uygulamayı kurulabilir bir PWA yapar.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AuraPet — Duygularınla evrilen dijital evcil hayvan",
    short_name: "AuraPet",
    description: "Duygularınla evrilen dijital evcil hayvanınız",
    lang: "tr",
    dir: "ltr",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0F1514",
    theme_color: "#0F1514",
    categories: ["lifestyle", "health", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Günlük ekle",
        short_name: "Günlük",
        description: "Bugünün ruh halini kaydet",
        url: "/log",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Koleksiyon",
        short_name: "Koleksiyon",
        description: "Aurion'unu gör",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Geçmiş",
        short_name: "Geçmiş",
        description: "Duygu geçmişini incele",
        url: "/history",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
