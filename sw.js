/* sw.js — offline cache untuk Forge (PWA). Strategi: network-first
   utk file app (biar update masuk), cache-first utk CDN font/ikon. */
const CACHE = "planner-forge-v3";
const CORE = ["./", "./index.html", "./config.js", "./manifest.json", "./assets/logo.svg"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const isCDN = url.origin !== location.origin;
  if (isCDN) {
    // cache-first: font & ikon
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => hit)));
  } else {
    // network-first: file app & engine
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
  }
});
