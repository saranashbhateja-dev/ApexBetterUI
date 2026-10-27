const CACHE = 'apex-os-static-v23-auth-scrollnav-20261027';
const CORE = ['./','./index.html','./styles.css?v=apex-auth-sidebar-v2.3','./supabase-config.js','./auth-gate.js','./sync-client.js','./source-project-details.js','./university-admissions-source-data.js','./app.js','./manifest.webmanifest'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && event.request.method === 'GET') { const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,copy)); }
    return response;
  })));
});
