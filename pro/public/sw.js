// Custom service worker for enhanced caching
const CACHE_NAME = 'invoice-app-v1';
const API_CACHE_NAME = 'invoice-api-v1';

// Cache static assets
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/dashboard/stats',
  '/customers',
  '/products',
  '/companies'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.hostname.includes('vercel.app') && API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            // Return cached response immediately
            fetch(request).then(fetchResponse => {
              // Update cache in background
              cache.put(request, fetchResponse.clone());
            }).catch(() => {
              // Network failed, stick with cache
            });
            return response;
          }
          
          // No cache, fetch from network
          return fetch(request).then(fetchResponse => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((response) => {
        return response || fetch(request);
      })
  );
});
