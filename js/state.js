// ========== IMPORTS ==========
import { fetchPokemonPage, fetchPokemonDetails } from "./api.js";
import { PAGE_LIMIT, TOTAL_POKEMON, BATCH_STEP } from "./constants.js";
import { renderVisiblePokemon } from "./render.js";

// ========== ESTADO GLOBAL ==========
export const state = {
  allPokemon: [],
  filteredPokemon: [],
  renderOffset: PAGE_LIMIT,
  offset: 0,
  loading: false,

  // Filtros activos y pendientes
  activeTypes: new Set(),
  activeGeneration: "",
  searchTerm: "",
  generationNames: null,

  pendingTypes: new Set(),
  pendingGeneration: "",

  favorites: new Set(JSON.parse(localStorage.getItem("favorites") || "[]")),
  showingFavorites: false,
  isViewingFavorites: false,
};

// ========== CARGA DE LOTE DE POKÉMON ==========
export const loadPokemonBatch = async () => {
  if (state.loading) return;
  state.loading = true;

  const basicList = await fetchPokemonPage(state.offset, PAGE_LIMIT);
  const details = await Promise.all(
    basicList.map((p) => fetchPokemonDetails(p.url, p.name))
  );

  state.allPokemon = [...state.allPokemon, ...details];
  state.filteredPokemon = [...state.allPokemon];

  renderVisiblePokemon(); // Mostrar los Pokémon cargados

  state.offset += PAGE_LIMIT;
  state.loading = false;
};

// ========== CARGA PREVIA COMPLETA DE TODOS LOS POKÉMON ==========
export const preloadAllPokemon = async () => {
  for (let i = 0; i < TOTAL_POKEMON; i += BATCH_STEP) {
    const list = await fetchPokemonPage(i, BATCH_STEP);
    const details = await Promise.all(
      list.map((p) => fetchPokemonDetails(p.url, p.name))
    );

    // Evitar duplicados
    details.forEach((p) => {
      if (!state.allPokemon.some((existing) => existing.name === p.name)) {
        state.allPokemon.push(p);
      }
    });
  }

  state.filteredPokemon = [...state.allPokemon];
};
