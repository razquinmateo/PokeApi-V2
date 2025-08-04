const CACHE_KEY = "pokemonCache";

/* ==============
       CACHE
   ============== */

const getCachedPokemon = () => {
  return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
};

const saveToCache = (name, data) => {
  const cache = getCachedPokemon();

  cache[name] = {
    name: data.name,
    id: data.id,
    sprites: {
      front_default: data.sprites.front_default,
    },
    types: data.types.map((t) => ({
      type: { name: t.type.name },
    })),
    abilities: data.abilities.map((a) => ({
      ability: { name: a.ability.name },
    })),
    stats: data.stats.map((s) => ({
      base_stat: s.base_stat,
      stat: { name: s.stat.name },
    })),
  };

  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

/* ==============
        API
   ============== */

/**
 * Obtiene una página de Pokémon con nombres y URLs.
 * @param {number} offset
 * @param {number} limit
 * @returns {Promise<Array<{ name: string, url: string }>>}
 */
export const fetchPokemonPage = async (offset = 0, limit = 20) => {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
  );
  const data = await res.json();
  return data.results;
};

/**
 * Obtiene los detalles de un Pokémon por su URL o nombre.
 * @param {string} url
 * @param {string} name
 * @returns {Promise<Object>} Pokémon con datos básicos + habilidades + stats
 */
export const fetchPokemonDetails = async (url, name) => {
  const cache = getCachedPokemon();
  if (cache[name]) return cache[name];

  // Verificar que el cache tenga los datos completos
  if (cache[name]?.id && cache[name]?.abilities && cache[name]?.stats) {
    return cache[name];
  }

  const res = await fetch(url);
  const data = await res.json();

  saveToCache(name, data);
  return getCachedPokemon()[name];
};

/**
 * Obtiene los nombres de Pokémon de una generación específica.
 * @param {string|number} generationId
 * @returns {Promise<string[]>}
 */
export const fetchGenerationPokemonNames = async (generationId) => {
  const res = await fetch(
    `https://pokeapi.co/api/v2/generation/${generationId}`
  );
  const data = await res.json();
  return data.pokemon_species.map((p) => p.name.toLowerCase());
};

/**
 * Obtiene la línea evolutiva completa de un Pokémon dado.
 * @param {string} name
 * @returns {Promise<Array<{ name: string, min_level: number|null }>>}
 */
export const fetchEvolutionChain = async (name) => {
  try {
    // Obtener especie
    const speciesRes = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${name}`
    );
    const speciesData = await speciesRes.json();

    // Obtener URL de la cadena evolutiva
    const evoChainUrl = speciesData.evolution_chain.url;
    const chainRes = await fetch(evoChainUrl);
    const chainData = await chainRes.json();

    const evolutionLine = [];

    const traverseChain = (node, level = null) => {
      evolutionLine.push({ name: node.species.name, min_level: level });
      node.evolves_to.forEach((evo) => {
        const details = evo.evolution_details[0];
        traverseChain(evo, details?.min_level || null);
      });
    };

    traverseChain(chainData.chain);

    return evolutionLine;
  } catch (err) {
    console.error("❌ Error al obtener la línea evolutiva:", err);
    return [];
  }
};
