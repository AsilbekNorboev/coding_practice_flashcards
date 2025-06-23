// src/utils/game.js

// Default thresholds for levels
export const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000];

// Load or initialize the game state
export function loadGameMeta() {
  try {
    return JSON.parse(localStorage.getItem('flashcards_game')) || {
      xp:        0,
      level:     1,
      streak:    0,
      lastDate:  null,
      badges:    []
    };
  } catch {
    return { xp:0, level:1, streak:0, lastDate:null, badges: [] };
  }
}

// Persist the game state
export function saveGameMeta(meta) {
  localStorage.setItem('flashcards_game', JSON.stringify(meta));
}
