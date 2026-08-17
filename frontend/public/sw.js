/**
 * Wits Quest Service Worker
 * 
 * What it does:
 *   1. Caches the app shell (HTML, CSS, JS bundles) so the app loads offline.
 *   2. Uses a "network first, fall back to cache" strategy for navigation.
 *   3. Uses a "cache first" strategy for static assets (images, fonts).
 *   4. When an API call fails (offline), notifies the main thread so the
 *      offline queue can save the action.
 *   5. When connectivity returns, tells the main thread to process the queue.
 * 
 * Lifecycle:
 *   install → activate → fetch events
 */

const CACHE_NAME = 'wits-quest-v1';
const API_CACHE = 'wits-quest-api-v1';

// App shell files to pre-cache on install
const SHELL_FILES = [
  '/',
  '/index.html',
];

// ─── INSTALL: Pre-cache the app shell ─────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_FILES);
    })
  );
  // Skip waiting so the new SW activates immediately
  self.skipWaiting();
});

// ─── ACTIVATE: Clean up old caches ────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== API_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  // Take control of all open pages immediately
  self.clients.claim();
});

// ─── FETCH: Intercept all network requests ────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET for navigation (POST/PUT/DELETE pass through)
  if (request.method !== 'GET') {
    // For API POST requests that fail, notify main thread
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(
        fetch(request).catch(async () => {
          // API call failed while offline — tell the main thread
          const clients = await self.clients.matchAll();
          clients.forEach((client) => {
            client.postMessage({
              type: 'API_OFFLINE',
              url: request.url,
              method: request.method,
            });
          });
          return new Response(
            JSON.stringify({ error: 'Offline', offline: true }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
      );
    }
    return;
  }

  // For API GET requests: network first, fallback to cached response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          const clone = response.clone();
          caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(async () => {
          // Offline: return cached API response if available
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ error: 'Offline', offline: true }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // For static assets: cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Cache successful responses for static assets
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Final fallback for navigation requests
      if (request.mode === 'navigate') {
        return caches.match('/index.html');
      }
      return new Response('Offline', { status: 503 });
    })
  );
});

// ─── ONLINE EVENT: Tell main thread to sync the queue ─────────────
self.addEventListener('message', (event) => {
  if (event.data === 'CHECK_ONLINE') {
    // Main thread is asking us to confirm connectivity
    event.source.postMessage({ type: 'ONLINE_STATUS', online: navigator.onLine });
  }
});

// Periodically check connectivity and notify main thread
setInterval(async () => {
  if (navigator.onLine) {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: 'ONLINE' });
    });
  }
}, 30000); // Check every 30 seconds
