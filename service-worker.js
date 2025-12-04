const CACHE_NAME = 'running-challenge-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativação e limpeza de caches antigos
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

// Interceptação de requisições (Cache First para assets estáticos, Network First para HTML)
self.addEventListener('fetch', (event) => {
  // Ignora requisições do esquema chrome-extension ou firebase
  if (event.request.url.startsWith('chrome-extension') || event.request.url.includes('firebase') || event.request.url.includes('firestore')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache se existir
      if (response) {
        return response;
      }
      // Caso contrário, busca na rede
      return fetch(event.request).catch(() => {
        // Fallback offline (opcional, aqui retornaria o index se fosse navegação)
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
