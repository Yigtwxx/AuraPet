/* AuraPet Service Worker
 * ─────────────────────────────────────────────────────────────────────────
 * Elle yazılmıştır (Turbopack ile %100 uyumlu, build-time bağımlılığı yok).
 * Stratejiler:
 *   - Navigasyonlar (HTML)        → network-first, çevrimdışıysa /offline.html
 *   - Statik asset'ler (_next vb.)→ stale-while-revalidate
 *   - GET dışı / GraphQL / API     → dokunulmaz (yalnızca network)
 * CACHE_VERSION değiştiğinde eski cache'ler temizlenir.
 */
const CACHE_VERSION = "aurapet-v3"; // v3: petrol/teal tema
const PRECACHE = `${CACHE_VERSION}-precache`;
const RUNTIME = `${CACHE_VERSION}-runtime`;

const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Anında güncelleme tetiklemek için (opsiyonel mesaj kanalı)
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/splash/") ||
    url.pathname.startsWith("/lottie/") ||
    /\.(?:js|css|woff2?|ttf|otf|png|jpe?g|gif|svg|webp|avif|ico)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Yalnızca GET; POST/GraphQL/API istekleri asla cache'lenmez.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Yalnızca aynı origin; harici istekler tarayıcıya bırakılır.
  if (url.origin !== self.location.origin) return;

  // Sayfa gezintileri → network-first, çevrimdışıysa offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Statik asset'ler → stale-while-revalidate.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(RUNTIME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
