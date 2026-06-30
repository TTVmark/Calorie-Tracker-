// Daily Log — offline service worker
const CACHE = 'daily-log-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html'])));
  self.skipWaiting();
});

self.addEventListener('activate', e => { self.clients.claim(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  // App page: try network, fall back to cached app shell when offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  // Everything else (fonts, etc.): cache-first, then network, and cache it
  e.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => cached)
    )
  );
});
