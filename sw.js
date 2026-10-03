// Offline support: cache the app files, serve from cache, refresh in the background.
const CACHE = "streak-v1";
const FILES = ["./", "index.html", "styles.css", "stats.js", "store.js", "app.js", "effects.js", "editor.js", "detail.js",
               "settings.js", "reminders.js", "main.js", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(hit => {
    const fresh = fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => hit);
    return hit || fresh;
  }));
});
self.addEventListener("notificationclick", e => { e.notification.close(); e.waitUntil(clients.openWindow("./")); });
