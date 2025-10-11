/**
 * Service Worker for NyNus PWA
 * Handles caching, offline functionality, and push notifications
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

const CACHE_NAME = 'nynus-v1.0.0';
const OFFLINE_URL = '/offline';

// Assets to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/pages/_app.js',
  // Add more critical assets as needed
];

// API endpoints to cache with network-first strategy
const API_CACHE_PATTERNS = [
  /^\/api\/auth\//,
  /^\/api\/user\//,
  /^\/api\/courses\//,
  /^\/api\/questions\//
];

// Assets to cache with cache-first strategy
const ASSET_CACHE_PATTERNS = [
  /\/_next\/static\//,
  /\/images\//,
  /\/icons\//,
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  /\.(?:js|css|woff|woff2|ttf|eot)$/
];

// ===== INSTALL EVENT =====

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        // Force activation of new service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to install service worker:', error);
      })
  );
});

// ===== ACTIVATE EVENT =====

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        // Take control of all pages immediately
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[SW] Failed to activate service worker:', error);
      })
  );
});

// ===== FETCH EVENT =====

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle different types of requests
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isAssetRequest(url)) {
    event.respondWith(handleAssetRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  }
});

// ===== REQUEST HANDLERS =====

/**
 * Handle API requests with network-first strategy
 */
async function handleAPIRequest(request) {
  const cacheName = `${CACHE_NAME}-api`;
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Không có kết nối internet. Vui lòng thử lại sau.'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle static assets with cache-first strategy
 */
async function handleAssetRequest(request) {
  const cacheName = `${CACHE_NAME}-assets`;
  
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch asset:', request.url);
    
    // Return a fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#999">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

/**
 * Handle navigation requests with network-first, cache fallback
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful HTML responses
    if (networkResponse.ok && networkResponse.headers.get('content-type')?.includes('text/html')) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for navigation, trying cache:', request.url);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Last resort: basic offline page
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>NyNus - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
            .offline { color: #666; }
          </style>
        </head>
        <body>
          <h1>NyNus</h1>
          <div class="offline">
            <h2>Bạn đang offline</h2>
            <p>Vui lòng kiểm tra kết nối internet và thử lại.</p>
          </div>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// ===== HELPER FUNCTIONS =====

function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isAssetRequest(url) {
  return ASSET_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

// ===== PUSH NOTIFICATIONS =====

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'Bạn có thông báo mới từ NyNus',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'nynus-notification',
    data: {
      url: '/'
    }
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.data = data.data || options.data;
    } catch (error) {
      console.error('[SW] Failed to parse push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('NyNus', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ===== BACKGROUND SYNC =====

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending data when back online
    console.log('[SW] Performing background sync...');
    
    // Example: Sync user progress, cached form submissions, etc.
    // This would integrate with your app's offline data storage
    
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// ===== MESSAGE HANDLING =====

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service worker script loaded');
