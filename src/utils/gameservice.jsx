import { ref, get, set, remove } from 'firebase/database';
import { db } from '../firebase';
import { GAME_ID } from './constants';

export const startNewGame = async (deck, players) => {
  const gameState = {
    deck,
    currentTurn: 'player1',
    players,
    log: ['Game started.']
  };

  await set(ref(db, `/games/${GAME_ID}`), gameState);
};

export const saveHistorySnapshot = async () => {
  const gameRef = ref(db, `/games/${GAME_ID}`);
  const gameSnap = await get(gameRef);
  const currentState = gameSnap.val();
  const { history, ...stateWithoutHistory } = currentState;

  const historyRef = ref(db, `/games/${GAME_ID}/history`);
  const historySnap = await get(historyRef);
  const historyArray = historySnap.val() || [];

  const newHistory = [...historyArray, stateWithoutHistory];
  await set(historyRef, newHistory);
};

export const undoLastMove = async () => {
  const historyRef = ref(db, `/games/${GAME_ID}/history`);
  const historySnap = await get(historyRef);
  const history = historySnap.val() || [];

  if (history.length < 1) throw new Error("Nothing to undo");

  const previousState = history.pop();

  await Promise.all([
    set(ref(db, `/games/${GAME_ID}`), previousState),
    set(historyRef, history)
  ]);
};
