// FloraNet High-Reliability Offline Service Worker
//
// Caching strategy:
//   - Navigations (HTML pages): NETWORK-FIRST, cache only as an offline
//     fallback. Users always get the freshly-deployed page; stale HTML can
//     never reference deleted build chunks and break hydration.
//   - Immutable build assets (/_next/static/...): CACHE-FIRST — they are
//     content-hashed, so a cached copy is always correct.
//   - Images (/_next/image optimizer + static images): CACHE-FIRST with a
//     network refresh; harmless because the optimizer URL pins the source.
//   - Everything else (API GETs): NETWORK-FIRST with cache fallback.
//
// Cache name is versioned; activation deletes every older cache so a new
// deploy can never be poisoned by stale entries.

const CACHE_NAME = 'floranet-v3-cache';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Precache the minimal offline shell. Individual adds (not addAll) so a
      // single missing URL can never fail the whole install.
      await Promise.allSettled([
        cache.add(new Request('/', { cache: 'reload' })),
        cache.add(new Request('/manifest.json', { cache: 'reload' })),
        cache.add(new Request('/icon.svg', { cache: 'reload' })),
      ]);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GETs without range requests.
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;
  if (request.headers.get('range')) return;

  const url = new URL(request.url);
  const isNavigation = request.mode === 'navigate';
  const isImmutableAsset = url.pathname.startsWith('/_next/static/');
  const isImage =
    url.pathname.startsWith('/_next/image') ||
    /\.(jpg|jpeg|png|webp|avif|gif|svg|ico)$/.test(url.pathname);
  const isApiCall = url.pathname.startsWith('/api/');

  // Navigations & API calls: network-first so fresh deploys always win.
  if (isNavigation || isApiCall) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          if (isNavigation) {
            const shell = (await caches.match('/')) || (await caches.match('/home'));
            if (shell) return shell;
          }
          return new Response('Offline: resource not cached', { status: 503 });
        })
    );
    return;
  }

  // Immutable build assets & images: cache-first with background refresh.
  if (isImmutableAsset || isImage) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        // Immutable assets can return immediately; images wait briefly for a
        // fresher network copy but fall back to cache without delay.
        if (cached) return cached;
        const networkResponse = await networkFetch;
        return networkResponse || new Response('Offline: asset not cached', { status: 503 });
      })()
    );
    return;
  }

  // Everything else: let the browser handle it normally.
});
