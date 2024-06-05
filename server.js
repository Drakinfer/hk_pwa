const express = require('express');
const webPush = require('web-push');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Configurez ici vos clés VAPID générées via web-push
const vapidKeys = {
  publicKey: 'BO6ZmwQ3BJGf-bjUdXiDAgyUqwIIejeki8jbeYvpWFa6CL2nv0WbAXP8mcHuNKpd_2U_0F1P145aOIZQX0xYwM4',
  privateKey: 'Zu5lTtYUi9L6XVQ_QWGCSQuTccYwn8J7y41NqrjGeqg'
};

webPush.setVapidDetails(
  'mailto:example@yourdomain.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Cet objet stockera les abonnements push des clients
const subscriptions = {};

// Sert des fichiers statiques du dossier actuel
app.use(express.static(path.join(__dirname, '/')));
app.use(express.static(path.join(__dirname, 'public')));

// Servez index.html à la racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint pour enregistrer une souscription client
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  const clientId = subscription.keys.auth; // Utilisez un identifiant unique pour le client
  subscriptions[clientId] = subscription;
  res.status(201).json({ message: 'Souscription enregistrée.' });
});

// Endpoint pour envoyer une notification push à tous les clients abonnés
app.post('/notify', (req, res) => {
  const notificationPayload = JSON.stringify({ title: 'Mise à jour de PokeAPI', body: 'Des données ont été mises à jour.' });

  const sendNotifications = [];

  Object.values(subscriptions).forEach(subscription => {
    sendNotifications.push(
      webPush.sendNotification(subscription, notificationPayload)
        .catch(err => {
          if (err.statusCode === 410) { // GCM/FCM a renvoyé un code 410 si l'abonnement n'est plus valide
            delete subscriptions[subscription.keys.auth];
          } else {
            console.log('Subscription is no longer valid: ', err);
          }
        })
    );
  });

  Promise.all(sendNotifications).then(() => res.status(200).json({ message: 'Notifications envoyées.' }));
});

async function checkForUpdates() {
  const apiURL = 'https://pokeapi.co/api/v2/pokemon/';
  const fetch = (await import('node-fetch')).default;
  
  fetch(apiURL)
    .then(res => res.json())
    .then(data => {
      console.log(data);
    })
    .catch(err => console.error('Erreur lors de la récupération de PokeAPI:', err));
}

setInterval(checkForUpdates, 86400000);

app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
