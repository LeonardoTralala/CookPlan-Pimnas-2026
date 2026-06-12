// Service Worker CookPlan — caching ringan untuk installability PWA + offline shell.
// Strategi: cache-first untuk aset statis, network-first untuk navigasi (SPA).
// Sengaja TIDAK meng-cache request ke Supabase/AI (selalu butuh data fresh).

const CACHE = "cookplan-v1";
const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/cookplan-logo.svg",
  "/img/recipe-placeholder.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Jangan campur tangan request ke origin lain (Supabase, AI proxy, fonts, dll).
  if (url.origin !== self.location.origin) return;

  // Navigasi (SPA) → network-first, fallback ke shell "/" saat offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/"))
    );
    return;
  }

  // Aset statis same-origin → cache-first, lalu update cache di background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
