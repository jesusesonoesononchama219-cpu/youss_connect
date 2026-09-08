/* AFRICA CONNECT — service worker
   Caches the app shell so the app installs as a PWA and boots offline.
   Note: this demo has no real backend, so "offline" only affects the
   simulated network checks inside the app (e.g. Wallet payments), not
   the ability to load the screens themselves. */
const CACHE = "africa-connect-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./js/state.js",
  "./js/ui.js",
  "./js/router.js",
  "./js/screens/shell.js",
  "./js/screens/auth.js",
  "./js/screens/home.js",
  "./js/screens/transport.js",
  "./js/screens/wallet.js",
  "./js/screens/rewards.js",
  "./js/screens/activities.js",
  "./js/screens/notifications.js",
  "./js/screens/profile.js",
  "./js/screens/explorer.js",
  "./js/screens/restaurants.js",
  "./js/screens/market.js",
  "./js/screens/events.js",
  "./js/screens/culture.js",
  "./js/screens/delivery.js",
  "./js/screens/business.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
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
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return res;
      }).catch(() => cached);
    })
  );
});
