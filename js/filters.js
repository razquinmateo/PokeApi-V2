import { fetchGenerationPokemonNames } from "./api.js";
import { state } from "./state.js";
import { PAGE_LIMIT } from "./constants.js";
import { renderVisiblePokemon } from "./render.js";

// ========== APLICAR FILTROS PRINCIPALES ==========
export const applyFilters = async () => {
  if (state.showingFavorites) return;

  let result = [...state.allPokemon];

  if (state.searchTerm.trim()) {
    result = result.filter((p) =>
      p.name.toLowerCase().includes(state.searchTerm.toLowerCase())
    );
  }

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

  if (state.activeTypes.size > 0) {
    result = result.filter((p) =>
      Array.from(state.activeTypes).every((t) =>
        p.types.map((tp) => tp.type.name).includes(t)
      )
    );
  }

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
