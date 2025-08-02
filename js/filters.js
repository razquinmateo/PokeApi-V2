// ========== IMPORTS ==========
import { fetchGenerationPokemonNames } from "./api.js";
import { state } from "./state.js";
import { PAGE_LIMIT } from "./constants.js";
import { renderVisiblePokemon } from "./render.js";

// ========== APLICAR FILTROS PRINCIPALES ==========
export const applyFilters = async () => {
  // Si estamos en la vista de favoritos, no se aplican filtros
  if (state.showingFavorites) return;

  // Comenzamos con todos los Pokémon disponibles
  let result = [...state.allPokemon];

  // ---- Filtro por nombre ----
  if (state.searchTerm.trim()) {
    result = result.filter((p) =>
      p.name.toLowerCase().includes(state.searchTerm.toLowerCase())
    );
  }

  // ---- Filtro por generación ----
  if (state.activeGeneration) {
    if (
      !state.generationNames ||
      state.generationNames.generation !== state.activeGeneration
    ) {
      const names = await fetchGenerationPokemonNames(state.activeGeneration);
      state.generationNames = { generation: state.activeGeneration, names };
    }

    result = result.filter((p) =>
      state.generationNames.names.includes(p.name.toLowerCase())
    );
  }

  // ---- Filtro por tipos (hasta 2 tipos) ----
  if (state.activeTypes.size > 0) {
    result = result.filter((p) =>
      Array.from(state.activeTypes).every((t) =>
        p.types.map((tp) => tp.type.name).includes(t)
      )
    );
  }

  // ---- Actualizar estado y renderizar ----
  state.filteredPokemon.length = 0;
  state.filteredPokemon.push(...result);
  state.renderOffset = PAGE_LIMIT;
  renderVisiblePokemon();
};

// ========== ACTIVAR/DESACTIVAR FILTRO DE TIPO DESDE LAS CARDS ==========
export const toggleTypeFilter = (type) => {
  import("./dom.js").then(({ typeFiltersContainer }) => {
    const badges = Array.from(typeFiltersContainer.children);

    if (state.activeTypes.has(type)) {
      state.activeTypes.delete(type);
    } else {
      if (state.activeTypes.size === 2) {
        const [_, secondType] = Array.from(state.activeTypes);
        state.activeTypes.delete(secondType);
      }

      state.activeTypes.add(type);
    }

    badges.forEach((badge) => {
      badge.classList.toggle(
        "active-type",
        state.activeTypes.has(badge.textContent)
      );
    });

    applyFilters();
  });
};
