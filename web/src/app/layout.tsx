import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// iOS açılış ekranları — generate-pwa-assets.mjs ile üretilen dosyalarla eşleşir.
const appleSplash = [
  { w: 1290, h: 2796, dw: 430, dh: 932, r: 3 },
  { w: 1179, h: 2556, dw: 393, dh: 852, r: 3 },
  { w: 1284, h: 2778, dw: 428, dh: 926, r: 3 },
  { w: 1170, h: 2532, dw: 390, dh: 844, r: 3 },
  { w: 1125, h: 2436, dw: 375, dh: 812, r: 3 },
  { w: 1242, h: 2688, dw: 414, dh: 896, r: 3 },
  { w: 828, h: 1792, dw: 414, dh: 896, r: 2 },
  { w: 1242, h: 2208, dw: 414, dh: 736, r: 3 },
  { w: 750, h: 1334, dw: 375, dh: 667, r: 2 },
  { w: 640, h: 1136, dw: 320, dh: 568, r: 2 },
  { w: 1536, h: 2048, dw: 768, dh: 1024, r: 2 },
  { w: 1668, h: 2388, dw: 834, dh: 1194, r: 2 },
  { w: 2048, h: 2732, dw: 1024, dh: 1366, r: 2 },
].map((s) => ({
  url: `/splash/splash-${s.w}x${s.h}.png`,
  media: `(device-width: ${s.dw}px) and (device-height: ${s.dh}px) and (-webkit-device-pixel-ratio: ${s.r}) and (orientation: portrait)`,
}));

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "AuraPet",
  title: {
    default: "AuraPet",
    template: "%s · AuraPet",
  },
  description: "Duygularınla evrilen dijital evcil hayvanınız",
  // manifest, favicon, icon ve apple-touch-icon link'leri Next.js dosya
  // konvansiyonundan (app/manifest.ts, app/favicon.ico, app/icon.svg,
  // app/apple-icon.png) otomatik eklenir — burada tekrar tanımlamıyoruz.
  appleWebApp: {
    capable: true,
    title: "AuraPet",
    statusBarStyle: "black-translucent",
    startupImage: appleSplash,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0F1514" },
    { media: "(prefers-color-scheme: light)", color: "#F6FAF9" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
