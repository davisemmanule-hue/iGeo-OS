const CACHE_NAME = "igeo-operations-v3";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./branding-settings.js",
  "./integration-config.js",
  "./worker-intake-config.js",
  "./worker-intake.html",
  "./worker-intake.js",
  "./manifest.json",
  "./favicon.ico",
  "./igeo-logo.png",
  "./assets/icons/favicon-16x16.png",
  "./assets/icons/favicon-32x32.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/icon-192x192.png",
  "./assets/icons/icon-512x512.png",
  "./workforce/",
  "./workforce/index.html",
  "./workforce/styles.css",
  "./workforce/script.js",
  "./workforce/worker-config.js",
  "./executive/",
  "./executive/index.html",
  "./executive/styles.css",
  "./executive/app.js",
  "./executive/config.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    }),
  );
});
