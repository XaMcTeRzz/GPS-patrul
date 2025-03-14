// Service Worker для фонової роботи
const CACHE_NAME = 'guard-patrol-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Обробка фонових подій
self.addEventListener('message', (event) => {
  if (event.data.type === 'START_MONITORING') {
    startMonitoring(event.data.points);
  }
});

// Функція моніторингу точок
function startMonitoring(points) {
  setInterval(() => {
    const now = new Date();
    points.forEach(point => {
      if (point.startTime) {
        const startTime = new Date(point.startTime);
        const timeLimit = point.timeMinutes * 60 * 1000;
        
        if (now - startTime > timeLimit && !point.isCompleted) {
          // Відправляємо повідомлення про пропущену точку
          self.registration.showNotification('Пропущена точка', {
            body: `Точка "${point.name}" не була перевірена вчасно`,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            vibrate: [200, 100, 200]
          });
        }
      }
    });
  }, 10000); // Перевіряємо кожні 10 секунд
}

// Обробка push-повідомлень
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('Контроль обходу', options)
  );
}); 