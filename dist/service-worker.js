const CACHE_NAME = 'd4guide-v1',
  ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/scripts.js',
    '/favicon.svg',
    '/manifest.json'
  ];
(self.addEventListener('install', e => {
  (e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(e => (console.log('[SW] Caching core assets'), e.addAll(ASSETS_TO_CACHE)))
  ),
    self.skipWaiting());
}),
  self.addEventListener('activate', e => {
    (e.waitUntil(
      caches
        .keys()
        .then(e =>
          Promise.all(
            e
              .filter(e => e !== CACHE_NAME)
              .map(e => (console.log('[SW] Deleting old cache:', e), caches.delete(e)))
          )
        )
    ),
      self.clients.claim());
  }),
  self.addEventListener('fetch', e => {
    'GET' === e.request.method &&
      e.request.url.startsWith(self.location.origin) &&
      e.respondWith(
        caches.match(e.request).then(
          t =>
            t ||
            fetch(e.request)
              .then(t => {
                if (!t || 200 !== t.status || 'basic' !== t.type) return t;
                const s = t.clone();
                return (
                  caches.open(CACHE_NAME).then(t => {
                    t.put(e.request, s);
                  }),
                  t
                );
              })
              .catch(() => {
                if ('navigate' === e.request.mode) return caches.match('/index.html');
              })
        )
      );
  }));
