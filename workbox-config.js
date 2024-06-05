module.exports = {
    "globDirectory": "public/",
    "globPatterns": [
        "**/*.{html,js,css,json}"
    ],
    "swDest": "public/sw.js",
    "runtimeCaching": [{
        "urlPattern": /^https:\/\/pokeapi\.co\/api\/v2\/pokemon/,
        "handler": "NetworkFirst",
        "options": {
            "cacheName": "pokemon-api-cache"
        }
    }]
};
