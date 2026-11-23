// Offline cache: network first (so updates arrive), cache as the fallback.
const CACHE = 'expresso-v1';
const FACES = ['braids', 'curly', 'glasses', 'bun'].flatMap(c => ['happy', 'angry', 'scared', 'disgust', 'sad'].map(e => `assets/${c}_${e}.png`));
const FILES = ['./', 'index.html', 'manifest.json', 'assets/wild.png', 'assets/icon-192.png', 'assets/icon-512.png',
  ...['blue', 'yellow', 'green', 'red'].map(c => `assets/start_${c}.png`), ...FACES];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
