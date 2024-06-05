const PUBLIC_KEY = 'BO6ZmwQ3BJGf-bjUdXiDAgyUqwIIejeki8jbeYvpWFa6CL2nv0WbAXP8mcHuNKpd_2U_0F1P145aOIZQX0xYwM4'
const PRIVATE_KEY = 'Zu5lTtYUi9L6XVQ_QWGCSQuTccYwn8J7y41NqrjGeqg'

window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.error('Service Worker registration failed', err));
    }

    fetchPokemons();
});

const pokemonList = document.getElementById('pokemon-list');

async function fetchPokemons() {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
  const data = await response.json();
  const pokemonResults = data.results;

  const pokemonDetailsPromises = pokemonResults.map(pokemon => fetch(pokemon.url).then(response => response.json()));
  const pokemonDetails = await Promise.all(pokemonDetailsPromises);

  pokemonDetails.sort((a, b) => a.id - b.id);

  const pokemonSpeciesPromises = pokemonDetails.map(pokemon => fetch(pokemon.species.url).then(response => response.json()));
  const pokemonSpecies = await Promise.all(pokemonSpeciesPromises);

  pokemonDetails.forEach((pokemon, index) => {
      const frenchNameEntry = pokemonSpecies[index].names.find(name => name.language.name === 'fr');
      pokemon.frenchName = frenchNameEntry ? frenchNameEntry.name : pokemon.name;
  });

    // Précharge les pages des Pokémon
  preCachePokemonPages(pokemonDetails);

  displayPokemons(pokemonDetails);


}

function displayPokemons(pokemons) {
  const list = document.getElementById('pokemon-list');
  list.innerHTML = '';
  pokemons.forEach(pokemon => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = `pokemon.html?id=${pokemon.id}`;
      link.innerHTML = `<img src="${pokemon.sprites.front_default}" alt="${pokemon.frenchName}" /><span>${pokemon.frenchName}</span>`;
      listItem.appendChild(link);
      list.appendChild(listItem);
  });
}

async function preCachePokemonPages(pokemons) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const cache = await caches.open('pokemon-pages');
      const preCachePromises = pokemons.map(pokemon => {
          const url = new URL(`pokemon.html?id=${pokemon.id}`, location.href);
          return fetch(url).then(response => {
              if (response.status === 200) {
                  return cache.put(url, response);
              }
          }).catch(error => {
              console.error('Failed to fetch and cache', url, error);
          });
      });
      await Promise.all(preCachePromises);
  }
}


// Vérifiez si le service worker et les push sont supportés
if ('serviceWorker' in navigator && 'PushManager' in window) {
    document.getElementById('subscribe').addEventListener('click', function() {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            console.log("Notification permission granted.");
            // Appel de la fonction pour s'inscrire aux notifications push
            subscribeUserToPush();
          } else {
            console.log("User denied the notification permission.");
          }
        });
      });
  } else {
    console.warn('Push messaging is not supported');
  }

  function subscribeUserToPush() {
    navigator.serviceWorker.ready.then(function(registration) {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY)
      };
  
      return registration.pushManager.subscribe(subscribeOptions);
    })
    .then(function(pushSubscription) {
      console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
      // Envoyer l'abonnement au serveur pour le stocker
      return fetch('/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pushSubscription)
      });
    })
    .then(function(response) {
      if (response.ok) {
        console.log('Successfully subscribed for Push notifications.');
      } else {
        throw new Error('Failed to subscribe for Push notifications.');
      }
    })
    .catch(function(error) {
      console.error('Failed to subscribe the user: ', error);
    });
  }
  
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4); // Ajouter le padding si nécessaire
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}