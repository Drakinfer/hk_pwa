# Hakai_Generator PWA

## Install
`nom install`

## Lancer le serveur
`node server.js`
se rendre sur localhost:3000

## Fonctionnalités
- Connexion à l'API
- Mise en cache des requêtes
- Notifications Push :
-   - Cliquer sur "S'abonner aux notifications"
    - Sur postman : utiliser la requête `localhost:3000/notify` avec le serveur lancé
- L'application est en ligne à l'adresse : `https://pokepwaschool-2abb54751ecd.herokuapp.com/`, mais je n'ai pas pu tester dans un environnement mobile.
- Le précachage des pages ne fonctionnent, il faut aller dessus en étant en ligne pour qu'elles soient mises en cache.
