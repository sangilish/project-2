const cacheName = 'event-planner-cache-v1';
const assetsToCache = [
  '/',
  '/index.html',
  '/event_creation.html',
  '/rsvp_management.html',
  '/css/styles.css',
  '/js/main.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install the service worker and cache the assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('Caching assets...');
      return cache.addAll(assetsToCache);
    })
  );
});

// Activate the service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});

// Fetch the cached assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});