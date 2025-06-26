// src/utils/storage.js


import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy
} from 'firebase/firestore';
import cardsData from '../data/flashcards.json';

/**
 * Helper to get the collection of per-card metadata for the current user.
 */
function userCardsCollection(uid) {
  return collection(db, 'users', uid, 'cards');
}

/**
 * Reset only the SM-2 fields (repetitions, interval, easiness, nextReview, notes)
 * for every card in the given unit.
 */
export async function resetUnitSM2(unitName) {
  const uid     = auth.currentUser.uid;
  const cardsCol = collection(db, 'users', uid, 'cards');
  const snap    = await getDocs(cardsCol);

  // Build a map of the original defaults
  const defaults = {};
  cardsData.forEach(c => {
    if (c.unit === unitName) {
      defaults[String(c.id)] = {
        repetitions: c.repetitions,
        interval:    c.interval,
        easiness:    c.easiness,
        nextReview:  c.nextReview,
        notes:       c.notes || ''
      };
    }
  });

  // For each stored card in that unit, overwrite SM-2 fields
  const promises = [];
  snap.forEach(docSnap => {
    const id = docSnap.id;
    if (defaults[id]) {
      promises.push(
        setDoc(docSnap.ref, defaults[id], { merge: true })
      );
    }
  });
  await Promise.all(promises);
}

/**
 * Reset SM-2 for *all* cards, across every unit, back to their original defaults.
 */
export async function resetAllSM2() {
  const uid      = auth.currentUser.uid;
  const cardsCol = collection(db, 'users', uid, 'cards');
  const snap     = await getDocs(cardsCol);

  // Build defaults map once
  const defaults = {};
  cardsData.forEach(c => {
    defaults[String(c.id)] = {
      repetitions: c.repetitions,
      interval:    c.interval,
      easiness:    c.easiness,
      nextReview:  c.nextReview,
      notes:       c.notes || ''
    };
  });

  const promises = snap.docs.map(docSnap =>
    setDoc(docSnap.ref, defaults[docSnap.id], { merge: true })
  );
  await Promise.all(promises);
}
/**
 * Helper to get the user document itself for game metadata.
 */
function userDoc(uid) {
  return doc(db, 'users', String(uid));
}

/**
 * Load all card metadata for the current user.
 * Returns an object mapping cardId → { repetitions, interval, easiness, nextReview, notes }.
 */
export async function loadAllMeta() {
  const uid = auth.currentUser.uid;
  const snap = await getDocs(userCardsCollection(uid));
  const meta = {};
  snap.forEach(docSnap => {
    meta[docSnap.id] = docSnap.data();
  });
  return meta;
}

/**
 * Load metadata for a single card (or empty object if none exists).
 */
export async function loadCardMeta(cardId) {
  const uid    = auth.currentUser.uid;
  const docRef = doc(db, 'users', uid, 'cards', String(cardId));
  const snap   = await getDoc(docRef);
  return snap.exists() ? snap.data() : {};
}

/**
 * Save or merge metadata for a single card.
 */
export async function saveCardMeta(cardId, data) {
  const uid    = auth.currentUser.uid;
  const docRef = doc(db, 'users', uid, 'cards', String(cardId));
  await setDoc(docRef, data, { merge: true });
}

/**
 * Load the array of favorite card IDs.
 */
export async function loadFavorites() {
  const uid    = auth.currentUser.uid;
  const docRef = doc(db, 'users', uid, 'favorites', 'list');
  const snap   = await getDoc(docRef);
  return snap.exists() ? snap.data().ids : [];
}

/**
 * Toggle a card’s favorite status.
 * Returns the updated array of favorite IDs (as strings).
 */
export async function toggleFavorite(cardId) {
  const uid    = auth.currentUser.uid;
  const docRef = doc(db, 'users', uid, 'favorites', 'list');
  const snap   = await getDoc(docRef);
  let ids      = snap.exists() ? snap.data().ids : [];
  const strId  = String(cardId);

  if (ids.includes(strId)) {
    ids = ids.filter(id => id !== strId);
  } else {
    ids.push(strId);
  }

  ids = ids.map(id => String(id));
  await setDoc(docRef, { ids }, { merge: true });
  return ids;
}

/**
 * Load the user’s game metadata: XP, level, streak, lastDate, badges.
 * Returns a default object if none exists yet.
 */
export async function loadGameMeta() {
  const uid    = auth.currentUser.uid;
  const docRef = userDoc(uid);
  const snap   = await getDoc(docRef);
  const data   = snap.exists() ? snap.data() : {};
  // Extract only the gameMeta fields, with defaults:
  return {
    xp:        data.xp        ?? 0,
    level:     data.level     ?? 1,
    streak:    data.streak    ?? 0,
    lastDate:  data.lastDate  ?? null,
    badges:    data.badges    ?? []
  };
}

/**
 * Save the user’s game metadata on their root user doc.
 */
export async function saveGameMeta(meta) {
  const uid    = auth.currentUser.uid;
  const docRef = userDoc(uid);
  // We merge only the game meta fields
await setDoc(docRef, meta, { merge: true });
}

/**
 * Log a review event (cardId, quality, timestamp) into a history subcollection.
 */
export async function logReviewEvent(cardId, quality) {
  const uid      = auth.currentUser.uid;
  const histCol  = collection(db, 'users', uid, 'history');
  await addDoc(histCol, {
    cardId:    String(cardId),
    quality,
    timestamp: new Date().toISOString()
  });
}

/**
 * (Optional) Load the review history, sorted by timestamp descending.
 */
export async function loadReviewHistory() {
  const uid     = auth.currentUser.uid;
  const histCol = collection(db, 'users', uid, 'history');
  const q       = query(histCol, orderBy('timestamp', 'desc'));
  const snap    = await getDocs(q);
  return snap.docs.map(d => d.data());
}
