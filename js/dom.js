/*================== 
Todas las constantes
====================*/
export const container = document.getElementById("pokemon-container");
export const searchInput = document.getElementById("search-input");
export const typeFiltersContainer = document.getElementById("type-filters");
export const generationFilter = document.getElementById("generation-filter");
export const applyFiltersBtn = document.getElementById("apply-filters-btn");
export const generationFiltersContainer =
  document.getElementById("generation-filters");
export const clearFiltersBtn = document.getElementById("clear-filters-btn");
export const filterModal = document.getElementById("filterModal");
export const scrollToTopBtn = document.getElementById("scrollToTopBtn");
export const pokemonLink = document.getElementById("pokemon-link");
export const favoritesLink = document.getElementById("favorites-link");

export const modal = new bootstrap.Modal(
  document.getElementById("pokemonModal")
);
export const modalTitle = document.getElementById("pokemonModalLabel");
export const modalBody = document.getElementById("pokemon-modal-body");
