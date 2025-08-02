import { state, loadPokemonBatch, preloadAllPokemon } from './state.js';
import { loadTypeFilters, loadGenerationFilters } from './interface.js';
import './events.js';

loadPokemonBatch();
loadTypeFilters();
loadGenerationFilters();
preloadAllPokemon();
