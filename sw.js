// Offline-Speicher der Kuchenkasse.
// Bei jeder neuen Version der Kasse VERSION hochzählen, damit die Tablets die neue Fassung laden.
const VERSION = 'kuchenkasse-v1';
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Zuerst aus dem Tablet-Speicher laden (funktioniert ohne Netz);
// wenn Internet da ist, im Hintergrund die neueste Fassung holen.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(VERSION).then(cache =>
      cache.match(e.request, { ignoreSearch: true }).then(gespeichert => {
        const ausNetz = fetch(e.request)
          .then(antwort => { if (antwort.ok) cache.put(e.request, antwort.clone()); return antwort; })
          .catch(() => gespeichert);
        return gespeichert || ausNetz;
      })
    )
  );
});
