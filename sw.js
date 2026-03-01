const CACHE_NAME = ‘ledger-v1’;
const ASSETS = [
‘./index.html’,
‘./manifest.json’,
‘https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap’
];

self.addEventListener(‘install’, e => {
e.waitUntil(
caches.open(CACHE_NAME).then(cache => {
return cache.addAll(ASSETS).catch(() => {});
})
);
self.skipWaiting();
});

self.addEventListener(‘activate’, e => {
e.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
)
);
self.clients.claim();
});

self.addEventListener(‘fetch’, e => {
// For Google Sheets API calls, always go network
if (e.request.url.includes(‘script.google.com’)) {
return;
}
e.respondWith(
caches.match(e.request).then(cached => {
return cached || fetch(e.request).then(response => {
if (response && response.status === 200 && response.type !== ‘opaque’) {
const clone = response.clone();
caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
}
return response;
}).catch(() => cached);
})
);
});
