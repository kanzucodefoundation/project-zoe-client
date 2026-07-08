const APP_VERSION = 'project-zoe-pwa-v1';
const STATIC_CACHE = `${APP_VERSION}-static`;
const RUNTIME_CACHE = `${APP_VERSION}-runtime`;

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.png',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/pwa-maskable-512.png',
  '/pwa-apple-touch-icon.png',
];

const STATIC_DESTINATIONS = new Set([
  'font',
  'image',
  'script',
  'style',
  'worker',
]);

const isSameOrigin = (request) => {
  const url = new URL(request.url);
  return url.origin === self.location.origin;
};

const cacheAppShell = async () => {
  const cache = await caches.open(STATIC_CACHE);
  await Promise.all(
    APP_SHELL_URLS.map(async (url) => {
      try {
        await cache.add(url);
      } catch (error) {
        console.warn('[service-worker] Skipped app-shell asset:', url, error);
      }
    }),
  );
};

const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  const networkResponsePromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || networkResponsePromise;
};

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => !cacheName.startsWith(APP_VERSION))
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || !isSameOrigin(request)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseCopy = response.clone();
            caches
              .open(STATIC_CACHE)
              .then((cache) => cache.put('/index.html', responseCopy));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(STATIC_CACHE);
          return (
            (await cache.match(request)) ||
            (await cache.match('/index.html')) ||
            Response.error()
          );
        }),
    );
    return;
  }

  const url = new URL(request.url);
  const isBuiltAsset = url.pathname.startsWith('/assets/');
  const isStaticAsset = STATIC_DESTINATIONS.has(request.destination);

  if (isBuiltAsset || isStaticAsset) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
