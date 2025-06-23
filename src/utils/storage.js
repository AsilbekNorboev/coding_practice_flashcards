// src/utils/storage.js

// Load the full metadata map
export function loadAllMeta() {
  try {
    return JSON.parse(localStorage.getItem('flashcards_meta')) || {};
  } catch {
    return {};
  }
}

// Load metadata for one card
export function loadCardMeta(id) {
  return loadAllMeta()[id] || {};
}

// Save (or merge) metadata for one card
export function saveCardMeta(id, meta) {
  const all = loadAllMeta();
  all[id] = { ...all[id], ...meta };
  localStorage.setItem('flashcards_meta', JSON.stringify(all));
}


/** Log a single review event */
export function logReviewEvent(cardId, quality) {
  const key = 'flashcards_history';
  const raw = localStorage.getItem(key);
  const history = raw ? JSON.parse(raw) : [];
  history.push({
    cardId,
    quality,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(key, JSON.stringify(history));
}

/** Load all review events */
export function loadReviewHistory() {
  const raw = localStorage.getItem('flashcards_history');
  return raw ? JSON.parse(raw) : [];
}


// src/utils/storage.js

/** Load the array of favorited card IDs */
export function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem('flashcards_favorites') || '[]');
  } catch {
    return [];
  }
}

/** Toggle a card’s favorite status and persist */
export function toggleFavorite(cardId) {
  const favs = new Set(loadFavorites());
  if (favs.has(cardId)) favs.delete(cardId);
  else              favs.add(cardId);
  const arr = Array.from(favs);
  localStorage.setItem('flashcards_favorites', JSON.stringify(arr));
  return arr;  // return updated list if you need it
}
