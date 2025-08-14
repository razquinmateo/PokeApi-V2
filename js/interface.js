import { ALL_TYPES, GENERATIONS } from "./constants.js";
import { state } from "./state.js";
import { typeFiltersContainer, generationFiltersContainer } from "./dom.js";

// ========== CARGAR FILTROS DE TIPO ==========
export const loadTypeFilters = () => {
  ALL_TYPES.forEach((type) => {
    const badge = document.createElement("span");
    badge.textContent = type;
    badge.className = `badge text-capitalize px-3 py-2 border type-${type}`;
    badge.style.cursor = "pointer";

    badge.addEventListener("click", () => {
      const badges = Array.from(typeFiltersContainer.children);

      if (state.pendingTypes.has(type)) {
        state.pendingTypes.delete(type);
        badge.classList.remove("active-type");
      } else {
        if (state.pendingTypes.size === 2) {
          const secondType = Array.from(state.pendingTypes)[1];
          state.pendingTypes.delete(secondType);

          const secondBadge = badges.find((b) => b.textContent === secondType);
          if (secondBadge) secondBadge.classList.remove("active-type");
        }

        state.pendingTypes.add(type);
        badge.classList.add("active-type");
      }
    });

    typeFiltersContainer.appendChild(badge);
  });
};

// ========== CARGAR FILTROS DE GENERACIÓN ==========
export const loadGenerationFilters = () => {
  GENERATIONS.forEach(({ id, label }) => {
    const badge = document.createElement("span");
    badge.textContent = label;
    badge.className = "badge text-capitalize px-3 py-2 border";
    badge.style.cursor = "pointer";

    badge.addEventListener("click", () => {
      const allBadges = generationFiltersContainer.querySelectorAll(".badge");

      if (state.pendingGeneration === id) {
        state.pendingGeneration = "";
        badge.classList.remove("active-type");
      } else {
        state.pendingGeneration = id;
        allBadges.forEach((b) => b.classList.remove("active-type"));
        badge.classList.add("active-type");
      }
    });

    generationFiltersContainer.appendChild(badge);
  });
};
