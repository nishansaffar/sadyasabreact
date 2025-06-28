// utils/gameHelpers.js
import { ref, get, set } from 'firebase/database';

export const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

export const removeOneCard = (handArray, cardToRemove) => {
  const index = handArray.indexOf(cardToRemove);
  if (index === -1) return handArray;
  return [...handArray.slice(0, index), ...handArray.slice(index + 1)];
};

export const saveHistorySnapshot = async (db, GAME_ID) => {
  const gameRef = ref(db, `/games/${GAME_ID}`);
  const historyRef = ref(db, `/games/${GAME_ID}/history`);

  try {
    const snapshot = await get(gameRef);

    if (!snapshot.exists()) {
      console.warn('⚠️ Tried to save snapshot, but game data is not ready yet.');
      return;
    }

    const state = snapshot.val();
    const historySnap = await get(historyRef);
    const history = historySnap.exists() ? historySnap.val() : [];

    const updatedHistory = [...history.slice(-9), state]; // keep last 10
    await set(historyRef, updatedHistory);
  } catch (error) {
    console.error('❌ Failed to save history snapshot:', error);
  }
};
