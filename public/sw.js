// PWA service worker — network-first so clients pick up new deploys.
const CACHE_VERSION = "pdexai-v2";
const OFFLINE_URL = "/offline.html";
const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/icons/manifest-icon-192.maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      await cache.addAll(PRECACHE_ASSETS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Never cache API or Next.js internals — always hit the network.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/")
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);

      try {
        const networkResponse = await fetch(request);

        // Cache only same-origin successful GETs for offline fallback assets.
        if (
          networkResponse.ok &&
          (url.pathname === OFFLINE_URL ||
            url.pathname.startsWith("/icons/"))
        ) {
          cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      } catch {
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }

        if (request.mode === "navigate") {
          const offlinePage = await cache.match(OFFLINE_URL);
          if (offlinePage) {
            return offlinePage;
          }
        }

        return new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable",
        });
      }
    })(),
  );
});
