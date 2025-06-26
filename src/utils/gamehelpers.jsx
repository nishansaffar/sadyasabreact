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
  const gameSnap = await get(gameRef);
  const currentState = gameSnap.val();

  // 🔥 Avoid recursive history nesting
  const { history, ...stateWithoutHistory } = currentState || {};

  const historyRef = ref(db, `/games/${GAME_ID}/history`);
  const historySnap = await get(historyRef);
  const historyArray = historySnap.val() || [];

  const newHistory = [...historyArray, stateWithoutHistory];

  await set(historyRef, newHistory);
};
