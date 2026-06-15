const CACHE_NAME = 'quanly-nhatro-cache-v1';
const OFFLINE_URL = '/index.html';

// Các file cốt lõi cần precache ngay khi cài đặt
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/logo-192.png',
  '/logo-512.png'
];

// Sự kiện Install - Cài đặt Service Worker và lưu trữ các asset cơ bản
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Sự kiện Activate - Dọn dẹp cache cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Sự kiện Fetch - Đánh chặn và tối ưu phản hồi từ cache/mạng
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Bỏ qua các yêu cầu API (chúng ta muốn dữ liệu thời gian thực và tránh cache hóa đơn/chat cũ)
  if (url.pathname.startsWith('/api/') || request.method !== 'GET') {
    return; // Cho phép đi thẳng ra mạng
  }

  // Bỏ qua các giao thức không được Cache API hỗ trợ (ví dụ chrome-extension://, chrome://...)
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
    return;
  }

  // 2. Đối với các yêu cầu điều hướng trang (ví dụ /tenant, /rooms, /invoices...)
  // Vì là SPA (Single Page App), tất cả các trang đều trỏ về index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        // Nếu mất mạng, trả về file index.html đã lưu trong cache
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // 3. Đối với các file tĩnh (JS, CSS, hình ảnh, icon, font...)
  // Áp dụng chiến lược: Stale-While-Revalidate (Lấy từ cache trả về ngay, đồng thời cập nhật cache từ mạng ở background)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Cập nhật ngầm từ mạng
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse);
            });
          }
        }).catch((err) => console.log('[Service Worker] Failed to update cache in background:', err));
        
        return cachedResponse;
      }

      // Nếu không có trong cache, fetch từ mạng
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Lưu bản sao vào cache cho lần sau
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
