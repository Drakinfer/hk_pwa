importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');

// Assurez-vous que Workbox est chargé correctement.
if (workbox) {
  console.log(`Workbox is loaded 🎉`);
  workbox.precaching.precacheAndRoute([
    {url: '/index.html', revision: null},
    {url: '/public/style.css', revision: null},
    {url: '/public/app.js', revision: null},
    // Assurez-vous d'ajouter des révisions ou de mettre à jour `revision: null` pour une meilleure gestion du cache
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