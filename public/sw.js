const CACHE_NAME = 'lintratech-static-v1';

// --- INSTALL ---
self.addEventListener('install', () => {
  self.skipWaiting();
});

// --- ACTIVATE ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

// --- FETCH ---
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 🚫 Nunca interceptar métodos mutáveis
  if (request.method !== 'GET') return;

  // 🚫 Nunca cachear API ou rotas privadas
  const url = new URL(request.url);
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/main')
  ) {
    return;
  }

  // ✅ Cache apenas assets estáticos
  const isStaticAsset =
    url.pathname.startsWith('/_next/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2');

  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        const responseClone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      });
    }),
  );
});
