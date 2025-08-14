import { container } from "./dom.js";
import { state } from "./state.js";

// ========== RENDER DE POKÉMON VISIBLES (Pokedex) ==========
export const renderVisiblePokemon = () => {
  const visible = state.filteredPokemon.slice(0, state.renderOffset);

  container.innerHTML = visible.map(buildCardHTML).join("");

  bindTypeBadgesEvents();
};

// ========== RENDER DE FAVORITOS ==========
export const renderFavorites = () => {
  const favoriteList = state.allPokemon.filter((p) =>
    state.favorites.has(p.name)
  );

  if (favoriteList.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center mt-4">
        <p class="text-muted">No hay Pokémon favoritos aún.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = favoriteList.map(buildCardHTML).join("");
  bindTypeBadgesEvents();
};

// ========== CREACIÓN DEL HTML DE UNA CARD ==========
const buildCardHTML = (pokemon) => {
  const types = pokemon.types
    .map((t) => {
      const typeName = t.type.name;
      const isActive = state.activeTypes.has(typeName) ? "active-type" : "";
      return `
      <span class="badge type-${typeName} ${isActive} me-1 px-3 py-2 text-capitalize"
            data-type="${typeName}" style="cursor:pointer">
        ${typeName}
      </span>
    `;
    })
    .join("");

  const isFavorite = state.favorites.has(pokemon.name);
  const starIcon = isFavorite ? "bi-star-fill text-warning" : "bi-star";

  return `
  <div class="col-sm-6 col-md-4 col-lg-3">
    <div class="card text-center shadow-sm position-relative" data-name="${pokemon.name}">
      <i class="bi ${starIcon} position-absolute top-0 end-0 m-2 fs-4 favorite-icon"
         style="cursor:pointer" data-name="${pokemon.name}"></i>
      <img src="${pokemon.sprites.front_default}" class="card-img-top p-3" alt="${pokemon.name}">
      <div class="card-body">
        <h5 class="card-title text-capitalize">${pokemon.name}</h5>
        <div>${types}</div>
      </div>
    </div>
  </div>
`;
};

// ========== ASIGNAR EVENTOS A LOS BADGES DE TIPO ==========
const bindTypeBadgesEvents = () => {
  document.querySelectorAll("[data-type]").forEach((badge) => {
    badge.addEventListener("click", () => {
      import("./filters.js").then((module) =>
        module.toggleTypeFilter(badge.dataset.type)
      );
    });
  });
};
