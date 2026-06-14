/**
 * AuraPet — PWA + app icon görsel üretici
 * ─────────────────────────────────────────────────────────────────────────
 * Tek kaynak (Aurion maskotu) → web PWA + iOS app icon görselleri:
 *   - public/icons/icon-{192,512}.png            (purpose: "any", yuvarlak köşe)
 *   - public/icons/icon-maskable-{192,512}.png   (purpose: "maskable", tam dolu)
 *   - public/icons/icon-source.svg               (referans kaynak)
 *   - src/app/icon.svg                            (Next favicon konvansiyonu)
 *   - src/app/apple-icon.png                      (180×180, şeffaflıksız)
 *   - public/splash/*.png                         (iOS açılış ekranları)
 *   - ../mobile-ios/.../AppIcon.appiconset/icon-1024.png  (iOS app icon, opak)
 *
 * Böylece web ve iOS markası birebir aynı maskottan üretilir.
 *
 * Çalıştır:  npm run pwa:assets   (web/ dizininde)
 * Gereksinim: sharp (devDependency)
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = join(__dirname, "..");

// ── Marka renkleri (globals.css ile uyumlu) ──────────────────────────────
const BRAND_TOP = "#26A6A0"; // brand-400
const BRAND_MID = "#1E8C87"; // brand-500
const BRAND_BOT = "#197975"; // brand-600
const CANVAS = "#0F1514"; // surface-canvas (splash zemini)

/**
 * Aurion maskotu — 200×200 koordinat sisteminde, beyaz gövdeli varyant.
 * AurionNova bileşeninden uyarlanmıştır; ikon için rafine edildi: güçlü aura
 * halkası, hacimli gövde (gradyan + gölge), gövdeye sokulmuş yumuşak kanatlar,
 * ucu sparkle ile biten kuyruk (eski "Aurion Spark" motifi), sıcak ifade.
 * Gradyan id'leri "aur*" öneklidir (her ikon SVG'sinde maskot bir kez kullanılır).
 */
function aurion(body = "#FFFFFF") {
  return `
    <defs>
      <linearGradient id="aurBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0"    stop-color="#FFFFFF"/>
        <stop offset="0.6"  stop-color="#FBFEFE"/>
        <stop offset="1"    stop-color="#D9EBE9"/>
      </linearGradient>
      <radialGradient id="aurShadow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0"   stop-color="#04332F" stop-opacity="0.40"/>
        <stop offset="0.7" stop-color="#04332F" stop-opacity="0.12"/>
        <stop offset="1"   stop-color="#04332F" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="aurHalo" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"    stop-color="#FFFFFF" stop-opacity="0.35"/>
        <stop offset="0.5"  stop-color="#FFFFFF" stop-opacity="1"/>
        <stop offset="1"    stop-color="#FFFFFF" stop-opacity="0.35"/>
      </linearGradient>
    </defs>

    <!-- aura / hale — markanın imza öğesi ("Aura"Pet) -->
    <g transform="rotate(-8 100 34)">
      <ellipse cx="100" cy="34" rx="41" ry="12.5" fill="none" stroke="url(#aurHalo)" stroke-width="5"/>
      <ellipse cx="100" cy="34" rx="41" ry="12.5" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-opacity="0.55"/>
    </g>

    <!-- kuyruk → ucu sparkle -->
    <path d="M132,150 C158,150 169,172 158,188" fill="none" stroke="${body}" stroke-width="8.5" stroke-linecap="round" stroke-opacity="0.9"/>
    <path transform="translate(158,188)" d="M0,-13 L3.2,-3.2 L13,0 L3.2,3.2 L0,13 L-3.2,3.2 L-13,0 L-3.2,-3.2 Z" fill="${body}"/>

    <!-- yumuşak gövde gölgesi (derinlik) -->
    <ellipse cx="100" cy="150" rx="55" ry="40" fill="url(#aurShadow)"/>

    <!-- kanatlar (gövdeye sokulmuş, yumuşak) -->
    <ellipse cx="54"  cy="120" rx="15" ry="22" fill="${body}" fill-opacity="0.5" transform="rotate(-18 54 120)"/>
    <ellipse cx="146" cy="120" rx="15" ry="22" fill="${body}" fill-opacity="0.5" transform="rotate(18 146 120)"/>

    <!-- kulaklar -->
    <ellipse cx="80"  cy="62" rx="12.5" ry="19" fill="url(#aurBody)" transform="rotate(-10 80 62)"/>
    <ellipse cx="120" cy="62" rx="12.5" ry="19" fill="url(#aurBody)" transform="rotate(10 120 62)"/>
    <ellipse cx="80"  cy="64" rx="5"  ry="10" fill="#FF8FA3" fill-opacity="0.5" transform="rotate(-10 80 64)"/>
    <ellipse cx="120" cy="64" rx="5"  ry="10" fill="#FF8FA3" fill-opacity="0.5" transform="rotate(10 120 64)"/>

    <!-- gövde -->
    <ellipse cx="100" cy="118" rx="49" ry="48" fill="url(#aurBody)"/>

    <!-- gözler (button stili + parıltı) -->
    <ellipse cx="83"  cy="120" rx="8.5" ry="10.5" fill="#1A1D24"/>
    <ellipse cx="117" cy="120" rx="8.5" ry="10.5" fill="#1A1D24"/>
    <circle  cx="86"  cy="116" r="3.2" fill="#FFFFFF"/>
    <circle  cx="120" cy="116" r="3.2" fill="#FFFFFF"/>
    <circle  cx="80.5" cy="123.5" r="1.6" fill="#FFFFFF" fill-opacity="0.75"/>
    <circle  cx="114.5" cy="123.5" r="1.6" fill="#FFFFFF" fill-opacity="0.75"/>

    <!-- yanaklar -->
    <ellipse cx="67"  cy="134" rx="8.5" ry="6" fill="#FF8FA3" fill-opacity="0.6"/>
    <ellipse cx="133" cy="134" rx="8.5" ry="6" fill="#FF8FA3" fill-opacity="0.6"/>

    <!-- gülümseme -->
    <path d="M90,136 Q100,147 110,136" fill="none" stroke="#1A1D24" stroke-width="3" stroke-linecap="round"/>
  `;
}

const brandGradient = (id) => `
  <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0"   stop-color="${BRAND_TOP}"/>
    <stop offset="0.5" stop-color="${BRAND_MID}"/>
    <stop offset="1"   stop-color="${BRAND_BOT}"/>
  </linearGradient>`;

/** Maskotu S×S tuval içinde verilen ölçek oranıyla ortalar (200×200 → S). */
function centeredAurion(size, fraction) {
  const scale = (size * fraction) / 200;
  const offset = (size - 200 * scale) / 2;
  return `<g transform="translate(${offset},${offset}) scale(${scale})">${aurion()}</g>`;
}

/** "any" ikon: şeffaf tuval + yuvarlak köşeli marka gradyanı + maskot. */
function anyIconSvg(size) {
  const r = size * 0.225;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>${brandGradient("g")}
    <radialGradient id="glow" cx="0.5" cy="0.32" r="0.7">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#g)"/>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#glow)"/>
  ${centeredAurion(size, 0.66)}
</svg>`;
}

/** Maskable ikon: tam dolu kare marka gradyanı + güvenli alanda maskot. */
function maskableIconSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>${brandGradient("g")}
    <radialGradient id="glow" cx="0.5" cy="0.32" r="0.75">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.20"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#g)"/>
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#glow)"/>
  ${centeredAurion(size, 0.52)}
</svg>`;
}

/** Apple touch icon: tam dolu kare (şeffaflık yok), iOS köşeleri kendisi yuvarlar. */
function appleIconSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>${brandGradient("g")}
    <radialGradient id="glow" cx="0.5" cy="0.32" r="0.75">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.20"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#g)"/>
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#glow)"/>
  ${centeredAurion(size, 0.62)}
</svg>`;
}

/** iOS açılış ekranı: koyu canvas + ortalı maskot + yumuşak marka parıltısı. */
function splashSvg(w, h) {
  const min = Math.min(w, h);
  const mascot = min * 0.34;
  const scale = mascot / 200;
  const tx = (w - 200 * scale) / 2;
  const ty = (h - 200 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0"   stop-color="${BRAND_MID}" stop-opacity="0.30"/>
      <stop offset="0.6" stop-color="${BRAND_MID}" stop-opacity="0.06"/>
      <stop offset="1"   stop-color="${BRAND_MID}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="${CANVAS}"/>
  <circle cx="${w / 2}" cy="${h / 2}" r="${min * 0.45}" fill="url(#halo)"/>
  <g transform="translate(${tx},${ty}) scale(${scale})">${aurion()}</g>
</svg>`;
}

async function svgToPng(svg, outPath, size) {
  await mkdir(dirname(outPath), { recursive: true });
  const img = sharp(Buffer.from(svg), { density: 384 });
  if (Array.isArray(size)) img.resize(size[0], size[1]);
  else if (size) img.resize(size, size);
  await img.png().toFile(outPath);
  console.log("✓", outPath.replace(WEB_ROOT + "/", ""));
}

/** Opak PNG (alpha kanalı yok) — iOS app icon'u şeffaflık kabul etmez. */
async function svgToOpaquePng(svg, outPath, size) {
  await mkdir(dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size)
    .flatten({ background: BRAND_BOT })
    .png()
    .toFile(outPath);
  console.log("✓", outPath);
}

async function writeSvg(svg, outPath) {
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, svg.trim() + "\n", "utf8");
  console.log("✓", outPath.replace(WEB_ROOT + "/", ""));
}

// Apple'ın beklediği portre açılış ekranı boyutları (cihaz piksel cinsinden).
// media sorgusu manifest/metadata startupImage girişleriyle birebir eşleşmeli.
const SPLASH = [
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
];

async function main() {
  const ICONS = join(WEB_ROOT, "public/icons");
  const SPLASH_DIR = join(WEB_ROOT, "public/splash");
  const APP = join(WEB_ROOT, "src/app");

  // Kaynak SVG'ler
  await writeSvg(anyIconSvg(512), join(ICONS, "icon-source.svg"));
  await writeSvg(anyIconSvg(512), join(APP, "icon.svg"));

  // "any" ikonlar
  await svgToPng(anyIconSvg(192), join(ICONS, "icon-192.png"), 192);
  await svgToPng(anyIconSvg(512), join(ICONS, "icon-512.png"), 512);

  // maskable ikonlar
  await svgToPng(maskableIconSvg(192), join(ICONS, "icon-maskable-192.png"), 192);
  await svgToPng(maskableIconSvg(512), join(ICONS, "icon-maskable-512.png"), 512);

  // apple touch icon (180×180, şeffaflıksız)
  await svgToPng(appleIconSvg(180), join(APP, "apple-icon.png"), 180);

  // iOS app icon (1024×1024, opak) — Xcode AppIcon.appiconset; aynı maskot kaynağı
  const IOS_APPICON = join(
    WEB_ROOT,
    "..",
    "mobile-ios/AuraPet/Resources/Assets.xcassets/AppIcon.appiconset/icon-1024.png",
  );
  await svgToOpaquePng(appleIconSvg(1024), IOS_APPICON, 1024);

  // iOS açılış ekranları
  for (const s of SPLASH) {
    await svgToPng(splashSvg(s.w, s.h), join(SPLASH_DIR, `splash-${s.w}x${s.h}.png`), [s.w, s.h]);
  }

  console.log("\nTüm PWA görselleri üretildi.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
