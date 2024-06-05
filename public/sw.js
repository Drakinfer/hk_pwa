importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');

// Assurez-vous que Workbox est chargé correctement.
if (workbox) {
  console.log(`Workbox is loaded 🎉`);
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: '1' },
    { url: '/index.html', revision: '1' },
    { url: '/app.js', revision: '1' },
    { url: '/style.css', revision: '1' },
    { url: '/manifest.json', revision: '1' },
    { url: '/icons/icon-192x192.png', revision: '1' },
    { url: '/icons/icon-512x512.png', revision: '1' },
    { url: '/sw.js', revision: '1' },
  ]);

  workbox.routing.registerRoute(
    new RegExp('/public/.*\\.(css|js|png|jpg|jpeg|svg)$'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
    })
  );

  // Utilisez NetworkFirst pour les requêtes API pour obtenir toujours les données les plus récentes, mais avec un backup en cache.
  workbox.routing.registerRoute(
    new RegExp('https://pokeapi.co/api/v2/'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50, // Nombre maximum d'entrées dans le cache.
          maxAgeSeconds: 24 * 60 * 60, // Cache pendant 24 heures.
        }),
      ],
    })
  );
  
  // Add a route for caching images
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100, // Nombre maximum d'entrées dans le cache.
          maxAgeSeconds: 7 * 24 * 60 * 60, // Cache pendant 7 jours.
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200], // Mettre en cache seulement les réponses avec ces statuts.
        }),
      ],
    })
  );

  // Utilisez StaleWhileRevalidate pour les ressources CSS et JS statiques.
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'style' || request.destination === 'script',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
    })
  );

} else {
  console.log(`Workbox didn't load 😬`);
}

self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : { title: 'Default Title', body: 'Default message body' };
    const title = data.title;
    const options = {
        body: data.body,
        icon: 'images/icon.png',
        badge: 'images/badge.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
});