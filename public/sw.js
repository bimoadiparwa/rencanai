// RencanAI service worker — offline-ready app shell, client-side only, zero backend.
//
// - Install: precaches the app shell (/, index.html) under cache "rencanai-v1".
// - Activate: deletes old caches, clients.claim() so the SW controls the page at once.
// - Fetch:
//   * Provider/API calls (Gemini, OpenRouter, Groq) -> network only, never cached.
//   * Navigation requests -> cache first, network fallback, cached shell as last resort.
//   * Assets (/assets/...) -> cache first, populated on demand.
// Hashed Vite asset names are unknowable before build, so assets are cached at runtime
// on first request rather than enumerated in the install step.
"use strict";

const CACHE = "rencanai-v1";
const SCOPE = new URL(".", self.registration.scope).href; // ends with "/"
const SHELL = ["", "index.html"].map((p) => new URL(p, SCOPE).href);
const ASSET_PREFIX = new URL("assets/", SCOPE).pathname; // "/rencanai/assets/" in prod, "/assets/" in dev
const PROVIDER_HOSTS = [
  "generativelanguage.googleapis.com",
  "api.groq.com",
  "openrouter.ai",
];

function isProvider(url) {
  return PROVIDER_HOSTS.some((host) => url.hostname === host);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // AI provider fetches: network only — never cached (cross-origin anyway).
  if (isProvider(url)) return;

  if (event.request.method !== "GET") return;

  // Navigation requests: shell from cache, network fallback, then cached index.html.
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches
        .match(event.request)
        .then((cached) => cached || fetch(event.request))
        .catch(() => caches.match(new URL("index.html", SCOPE).href))
    );
    return;
  }

  // Built assets + fonts: cache first, populate on demand.
  if (
    url.pathname === ASSET_PREFIX ||
    url.pathname.startsWith(ASSET_PREFIX)
  ) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) =>
                cache.put(event.request, copy)
              );
            }
            return response;
          })
      )
    );
  }
});
