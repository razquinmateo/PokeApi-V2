import {
  searchInput,
  applyFiltersBtn,
  clearFiltersBtn,
  filterModal,
  typeFiltersContainer,
  generationFiltersContainer,
  scrollToTopBtn,
  pokemonLink,
  favoritesLink,
  modal,
  modalTitle,
  modalBody,
} from "./dom.js";

import { state } from "./state.js";
import { applyFilters } from "./filters.js";
import { PAGE_LIMIT, GENERATIONS } from "./constants.js";
import { renderVisiblePokemon, renderFavorites } from "./render.js";
import { fetchPokemonDetails, fetchEvolutionChain } from "./api.js";

// ========== FILTROS: Búsqueda, Aplicar, Limpiar ==========
searchInput.addEventListener("input", (e) => {
  state.searchTerm = e.target.value;
  applyFilters();
});

applyFiltersBtn.addEventListener("click", async () => {
  state.activeTypes.clear();
  state.pendingTypes.forEach((t) => state.activeTypes.add(t));
  state.activeGeneration = state.pendingGeneration;
  await applyFilters();
});

clearFiltersBtn.addEventListener("click", async () => {
  state.pendingTypes.clear();
  state.pendingGeneration = "";
  state.activeTypes.clear();
  state.activeGeneration = "";

  await applyFilters();

  const allBadges = document.querySelectorAll(
    "#type-filters .badge, #generation-filters .badge"
  );
  allBadges.forEach((b) => b.classList.remove("active-type"));

  const modalInstance = bootstrap.Modal.getInstance(filterModal);
  if (modalInstance) modalInstance.hide();
});

// ========== MODAL DE FILTROS ==========
filterModal.addEventListener("show.bs.modal", () => {
  state.pendingTypes = new Set(state.activeTypes);
  state.pendingGeneration = state.activeGeneration;

  const typeBadges = typeFiltersContainer.querySelectorAll(".badge");
  typeBadges.forEach((badge) => {
    const type = badge.textContent;
    badge.classList.toggle("active-type", state.pendingTypes.has(type));
  });

  const genBadges = generationFiltersContainer.querySelectorAll(".badge");
  genBadges.forEach((badge) => {
    const label = badge.textContent;
    const match = GENERATIONS.find((g) => g.label === label);
    if (!match) return;
    badge.classList.toggle("active-type", state.pendingGeneration === match.id);
  });
});

// ========== INFINITE SCROLL (SOLO EN POKEDEX) ==========
window.addEventListener("scroll", () => {
  if (state.showingFavorites) return;

  const bottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
  if (bottom && state.renderOffset < state.filteredPokemon.length) {
    state.renderOffset += PAGE_LIMIT;
    renderVisiblePokemon();
  }
});

// ========== GESTIÓN DE FAVORITOS ==========
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("favorite-icon")) return;

  e.stopPropagation();

  const name = e.target.dataset.name;

  if (state.favorites.has(name)) {
    state.favorites.delete(name);
  } else {
    state.favorites.add(name);
  }

  localStorage.setItem("favorites", JSON.stringify([...state.favorites]));

  if (state.showingFavorites) {
    renderFavorites();
  } else {
    renderVisiblePokemon();
  }
});

// ========== MODAL CON DATOS DEL POKÉMON ==========
export async function openPokemonModal(name) {
  const pokemon =
    state.allPokemon.find((p) => p.name === name) ||
    (await fetchPokemonDetails(
      `https://pokeapi.co/api/v2/pokemon/${name}`,
      name
    ));

  if (!state.allPokemon.some((p) => p.name === pokemon.name)) {
    state.allPokemon.push(pokemon);
  }

  modalTitle.textContent = `${pokemon.name} #${
    pokemon.id?.toString().padStart(3, "0") || "???"
  }`;

  const types = pokemon.types
    .map(
      (t) =>
        `<span class="badge type-${t.type.name} me-1">${t.type.name}</span>`
    )
    .join("");

  const abilities =
    pokemon.abilities?.map((a) => a.ability.name).join(", ") || "Desconocidas";

  const stats = pokemon.stats
    ?.map((s) => {
      const name = s.stat.name;
      const value = s.base_stat;
      const percentage = Math.min(100, (value / 150) * 100);
      return `
        <div class="d-flex align-items-center justify-content-between stat-line mb-2" style="width: 100%;">
          <span class="text-capitalize fw-semibold text-end text-nowrap" style="width: 130px;">${name}</span>
          <div class="flex-grow-1 mx-2" style="background-color: #eee; height: 10px; border-radius: 5px; overflow: hidden;">
            <div class="bg-success" style="width: ${percentage}%; height: 100%;"></div>
          </div>
          <span class="fw-bold text-end" style="width: 30px;">${value}</span>
        </div>
      `;
    })
    .join("");

  const statsMobile = pokemon.stats
    ?.map((s) => {
      const name = s.stat.name;
      const value = s.base_stat;

      const colorClass =
        {
          hp: "stat-color-hp",
          attack: "stat-color-attack",
          defense: "stat-color-defense",
          "special-attack": "stat-color-sp-attack",
          "special-defense": "stat-color-sp-defense",
          speed: "stat-color-speed",
        }[name] || "bg-secondary";

      const widthPercentage = Math.min(100, (value / 150) * 100);

      return `
      <div class="stat-bar-container mb-2">
        <div class="stat-name text-capitalize">${name.replace("-", " ")}</div>
        <div class="stat-bar">
          <div class="stat-fill ${colorClass}" style="width: ${widthPercentage}%;">
            ${value}
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  // === Línea evolutiva ===
  let evolutionHTML = "";
  try {
    const chain = await fetchEvolutionChain(pokemon.name);
    const isEeveeChain = chain.some((p) => p.name === "eevee");

    if (chain.length > 1) {
      if (isEeveeChain) {
        const eeveeData = await fetchPokemonDetails(
          `https://pokeapi.co/api/v2/pokemon/eevee`,
          "eevee"
        );

        const evolutions = await Promise.all(
          chain
            .filter((p) => p.name !== "eevee")
            .map(async (evo) => {
              const data = await fetchPokemonDetails(
                `https://pokeapi.co/api/v2/pokemon/${evo.name}`,
                evo.name
              );
              return `
              <div class="d-flex align-items-center mb-3">
                <div class="me-2" style="font-size: 1.5rem; color: black;">→</div>
                <img src="${data.sprites.front_default}" alt="${evo.name}" style="width: 60px; cursor: pointer;" data-evo-name="${evo.name}">
                <span class="text-capitalize ms-2">${evo.name}</span>
              </div>
            `;
            })
        );

        evolutionHTML = `
          <div class="mt-4 w-100 text-center">
            <strong>Línea evolutiva</strong>
            <div class="d-flex justify-content-center align-items-center mt-3">
              <div class="text-center me-4">
                <img src="${
                  eeveeData.sprites.front_default
                }" alt="eevee" style="width: 80px; cursor: pointer;" data-evo-name="eevee">
                <div class="text-capitalize mt-1">eevee</div>
              </div>
              <div class="d-flex flex-column align-items-start">
                ${evolutions.join("")}
              </div>
            </div>
          </div>
        `;
      } else {
        const evoParts = [];

        for (let i = 0; i < chain.length; i++) {
          const evo = chain[i];
          const data = await fetchPokemonDetails(
            `https://pokeapi.co/api/v2/pokemon/${evo.name}`,
            evo.name
          );

          const card = `
            <div class="d-flex flex-column align-items-center mx-3">
              <img src="${data.sprites.front_default}" alt="${evo.name}" style="width: 80px; cursor: pointer;" data-evo-name="${evo.name}">
              <div class="text-capitalize mt-1">${evo.name}</div>
            </div>
          `;
          evoParts.push(card);

          if (i < chain.length - 1) {
            const next = chain[i + 1];
            const arrow = `
              <div class="d-flex flex-column align-items-center mx-2">
                <div style="font-size: 2rem; font-weight: bold; color: black;">→</div>
                ${
                  next.min_level
                    ? `<small class="text-muted">Lvl ${next.min_level}</small>`
                    : `<small class="invisible">Lvl</small>`
                }
              </div>
            `;
            evoParts.push(arrow);
          }
        }

        evolutionHTML = `
          <div class="mt-4 w-100 text-center">
            <strong>Línea evolutiva</strong>
            <div class="d-flex justify-content-center align-items-end flex-wrap mt-3 gap-2">
              ${evoParts.join("")}
            </div>
          </div>
        `;
      }
    }
  } catch (err) {
    console.warn("⚠️ Error al cargar la evolución:", err);
  }

  modalBody.innerHTML = `
  <div class="modal-scroll-content" style="max-height: 70vh; overflow-y: auto;">
    <div class="d-flex flex-column align-items-center pb-3">
      <div class="rounded-circle bg-light d-flex align-items-center justify-content-center mb-3" style="width: 160px; height: 160px;">
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" style="width: 200px; height: 200px;">
      </div>
      <h5 class="text-capitalize">${pokemon.name}</h5>
      <div class="mb-2">${types}</div>
      <p><strong>Habilidades:</strong> ${abilities}</p>
      <div class="w-75 mb-3">
        <div class="stats-desktop">
          ${stats}
        </div>
        <div class="d-flex justify-content-center">
          <div class="stats-mobile d-none">
            ${statsMobile}
          </div> 
        </div>
      </div>
      ${evolutionHTML}
    </div>
  </div>
`;

  modal.show();
}

// ========== MODAL DEL POKEMON ==========
document.addEventListener("click", async (e) => {
  if (
    e.target.classList.contains("favorite-icon") ||
    e.target.closest("[data-type]")
  )
    return;

  const card = e.target.closest(".card");
  if (!card) return;

  const name = card.dataset.name;
  if (!name) return;

  openPokemonModal(name);
});

// =========================
// Modal de linea evolutiva
// =========================
modalBody.addEventListener("click", (e) => {
  const evoName = e.target.dataset.evoName;
  if (!evoName) return;

  modal.hide();

  setTimeout(() => {
    openPokemonModal(evoName);
  }, 200);
});

// ========== NAVEGACIÓN ENTRE VISTAS ==========
pokemonLink.classList.add("active-link");

pokemonLink.addEventListener("click", (e) => {
  e.preventDefault();
  state.showingFavorites = false;
  renderVisiblePokemon();

  favoritesLink.classList.remove("active-link");
  pokemonLink.classList.add("active-link");
});

favoritesLink.addEventListener("click", (e) => {
  e.preventDefault();
  state.showingFavorites = true;
  renderFavorites();

  pokemonLink.classList.remove("active-link");
  favoritesLink.classList.add("active-link");
});

// ========== BOTÓN SCROLL TO TOP ==========
window.addEventListener("scroll", () => {
  scrollToTopBtn.style.display = window.scrollY > 400 ? "flex" : "none";
});

scrollToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
