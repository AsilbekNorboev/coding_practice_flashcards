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
