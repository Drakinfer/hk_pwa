document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const pokemonId = params.get('id');
    
    if (pokemonId) {
        fetchPokemonDetails(pokemonId);
    }

    async function fetchPokemonDetails(id) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const pokemon = await response.json();
            
            const speciesResponse = await fetch(pokemon.species.url);
            const speciesData = await speciesResponse.json();
            const frenchNameEntry = speciesData.names.find(name => name.language.name === 'fr');
            const frenchName = frenchNameEntry ? frenchNameEntry.name : pokemon.name;
            const frenchDescriptionEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'fr');
            const frenchDescription = frenchDescriptionEntry ? frenchDescriptionEntry.flavor_text : "Description non disponible";

            document.getElementById('pokemon-name').textContent = frenchName;
            document.getElementById('pokemon-image').src = pokemon.sprites.front_default;
            document.getElementById('pokemon-description').textContent = frenchDescription;
        } catch (error) {
            console.error('Erreur lors de la récupération des détails du Pokémon:', error);
        }
    }
});