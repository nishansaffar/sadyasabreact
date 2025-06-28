import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, set, remove, get ,update } from 'firebase/database';
import { getDeckForPlayers } from './logic/decklists';
import { getSpecialCardHandlers } from './logic/cardhandlers';
import Card from './components/card';
import CardSelectorModal from './components/cardselectormodal';
import SpecialActionModal from './components/specialactionmodal';
import SadyaTray from './components/sadyatray';
import { shuffleArray, removeOneCard, saveHistorySnapshot } from './utils/gamehelpers';
import { GAME_ID, dishCards } from './utils/constants';
import './App.css';

const VERSION = 'v1.1 – Dynamic Player Count';

const App = () => {
  const [playerCount, setPlayerCount] = useState(2);
  const [playerCountInput, setPlayerCountInput] = useState(2);
  const [deck, setDeck] = useState([]);
  const [playerId, setPlayerId] = useState('');
  const [hand, setHand] = useState([]);
  const [tray, setTray] = useState([]);
  const [allTrays, setAllTrays] = useState({});
  const [turn, setTurn] = useState(null);
  const [log, setLog] = useState([]);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [pendingDrawReason, setPendingDrawReason] = useState(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [specialActionMessage, setSpecialActionMessage] = useState(null);
  const [showSpecialAction, setShowSpecialAction] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestarting, setIsRestarting] = useState(false);
  // 🔄 Sync playerCountInput from Firebase on initial load
  useEffect(() => {
    const playerCountRef = ref(db, `/games/${GAME_ID}/playerCount`);
    get(playerCountRef).then((snap) => {
      const count = snap.val();
      if (count && typeof count === 'number') {
        setPlayerCount(count);
        setPlayerCountInput(count);
      }
    });
  }, []);

  useEffect(() => {
    if (!playerId) return;

    const gameRef = ref(db, `/games/${GAME_ID}`);
    get(gameRef).then(snapshot => {
      const game = snapshot.val();
      if (game?.playerCount) setPlayerCount(game.playerCount);
      if (!game || !Array.isArray(game.log) || game.log[0] !== 'Game started.') {
        console.warn("🛠 No valid game state found. Starting new game...");
        startGame();
      }
    });

    const handRef = ref(db, `/games/${GAME_ID}/players/${playerId}/hand`);
    const playersRef = ref(db, `/games/${GAME_ID}/players`);
    const turnRef = ref(db, `/games/${GAME_ID}/currentTurn`);
    const logRef = ref(db, `/games/${GAME_ID}/log`);
    const deckRef = ref(db, `/games/${GAME_ID}/deck`);
    const playerCountRef = ref(db, `/games/${GAME_ID}/playerCount`);

    const unsubPlayerCount = onValue(playerCountRef, snap => {
      const count = snap.val();
      if (count) {
        setPlayerCount(count);
        setPlayerCountInput(count); }
      });

    const unsubDeck = onValue(deckRef, snap => setDeck(snap.val() || []));
    const unsubHand = onValue(handRef, snap => setHand(snap.val() || []));
    const unsubPlayers = onValue(playersRef, snap => {
      const players = snap.val() || {};
      setTray(players[playerId]?.tray || []);
      const others = { ...players };
      delete others[playerId];
      setAllTrays(others);

    // 🔁 Sync player list based on latest playerCount
    const updates = {};

    for (let i = 1; i <= playerCount; i++) {
      const id = `player${i}`;
      if (!players[id]) {
        updates[`/games/${GAME_ID}/players/${id}`] = { hand: [], tray: [] };
      }
    }

    // 🧹 Remove extra players beyond current count
    Object.keys(players).forEach((pid) => {
      const num = parseInt(pid.replace("player", ""));
      if (num > playerCount) {
        updates[`/games/${GAME_ID}/players/${pid}`] = null;
      }
    });

    if (Object.keys(updates).length){
      update(ref(db), updates);
    }
    });

    const unsubTurn = onValue(turnRef, snap => setTurn(snap.val()));
    const unsubLog = onValue(logRef, snap => {
      const entries = snap.val() || [];
      setLog(entries);
      const last = entries[entries.length - 1];
      if (last?.includes('played')) {
        setSpecialActionMessage(last);
        setShowSpecialAction(true);
      }
      if (entries[0] === 'Game started.') {
        setIsLoading(false);
        setIsRestarting(false);
      }
    });

    return () => {
      unsubDeck();
      unsubHand();
      unsubPlayers();
      unsubTurn();
      unsubLog();
      unsubPlayerCount();
    };
  }, [playerId, playerCount]);

  useEffect(() => {
  setPlayerCountInput(playerCount);
}, [playerCount]);

  const endTurn = async () => {
    const currentIndex = parseInt(playerId.replace('player', ''));
    const nextPlayer = `player${(currentIndex % playerCount) + 1}`;
    await set(ref(db, `/games/${GAME_ID}/currentTurn`), nextPlayer);
  };

  const startGame = async (countOverride = null) => {
    if (typeof countOverride === 'object') countOverride = null;
    let finalCount = countOverride;

    // ⬇️ If no override is passed, fetch the stored player count from Firebase
    if (finalCount === null) {
      const countSnap = await get(ref(db, `/games/${GAME_ID}/playerCount`));
      finalCount = countSnap.val() || 2; // fallback to 2 if not found
    }

    // ✅ Guard clause
    if (isNaN(finalCount) || finalCount < 2 || finalCount > 8) {
      console.error("🚨 Invalid player count during startGame:", finalCount);
      alert("Invalid player count. Please refresh and try again.");
      return;
    }

    setIsRestarting(true);
    setIsLoading(true);
    await remove(ref(db, `/games/${GAME_ID}`));

    const freshDeck = shuffleArray([...getDeckForPlayers(finalCount)]);
    const players = {};
    for (let i = 1; i <= finalCount; i++) {
      players[`player${i}`] = { hand: freshDeck.splice(0, 7), tray: [] };
    }

    const gameState = {
      deck: freshDeck,
      currentTurn: 'player1',
      players,
      playerCount: finalCount,
      log: ['Game started.'],
    };

    await set(ref(db, `/games/${GAME_ID}`), gameState);
    setPlayerCount(finalCount);
    setPlayerCountInput(finalCount);
    setIsRestarting(false);
    setIsLoading(false);
  };



  const drawCard = async () => {
    if (turn !== playerId) return alert('Not your turn!');
    //await saveHistorySnapshot(db, GAME_ID);

    const handRef = ref(db, `/games/${GAME_ID}/players/${playerId}/hand`);
    const deckRef = ref(db, `/games/${GAME_ID}/deck`);
    const logRef = ref(db, `/games/${GAME_ID}/log`);

    const [handSnap, deckSnap] = await Promise.all([get(handRef), get(deckRef)]);
    const currentHand = handSnap.val() || [];
    const currentDeck = deckSnap.val() || [];

    if (currentDeck.length === 0) return alert('Deck is empty.');
    if (currentHand.length >= 7) {
      setShowReplaceModal(true);
      setPendingDrawReason('replaceToDraw');
      return;
    }

    const newCard = currentDeck.pop();
    await Promise.all([
      set(deckRef, currentDeck),
      set(handRef, [...currentHand, newCard]),
      set(logRef, [...log, `${playerId} drew ${newCard}`]),
    ]);

    await endTurn();
  };

  const onCardReplace = async (replaceCard) => {
    //await saveHistorySnapshot(db, GAME_ID);
    const handRef = ref(db, `/games/${GAME_ID}/players/${playerId}/hand`);
    const deckRef = ref(db, `/games/${GAME_ID}/deck`);
    const logRef = ref(db, `/games/${GAME_ID}/log`);

    const [handSnap, deckSnap] = await Promise.all([get(handRef), get(deckRef)]);
    const hand = handSnap.val() || [];
    const deck = deckSnap.val() || [];

    const updatedHand = removeOneCard(hand, replaceCard);
    const shuffledDeck = shuffleArray([...deck, replaceCard]);
    const newCard = shuffledDeck.pop();
    const finalHand = [...updatedHand, newCard];

    await Promise.all([
      set(deckRef, shuffledDeck),
      set(handRef, finalHand),
      set(logRef, [...log, `${playerId} replaced ${replaceCard} and drew ${newCard}`]),
    ]);
    await endTurn();

    setShowReplaceModal(false);
    setPendingDrawReason(null);
  };

  const onDiscardCard = async (cardToDiscard) => {
    //await saveHistorySnapshot(db, GAME_ID);
    const updatedHand = removeOneCard(hand, cardToDiscard);

    await Promise.all([
      set(ref(db, `/games/${GAME_ID}/players/${playerId}/hand`), updatedHand),
      set(ref(db, `/games/${GAME_ID}/log`), [...log, `${playerId} discarded ${cardToDiscard}`]),
    ]);
    await endTurn();

    setShowDiscardModal(false);
    setPendingDrawReason(null);
  };

  const cancelModal = () => {
    setShowReplaceModal(false);
    setShowDiscardModal(false);
    setPendingDrawReason(null);
  };

  const placeCard = async (card) => {
    try {
      if (turn !== playerId) return alert('Not your turn!');
      //await saveHistorySnapshot(db, GAME_ID);

      const playerSnap = await get(ref(db, `/games/${GAME_ID}/players/${playerId}`));
      const { tray = [], extraDishPlays = 0 } = playerSnap.val() || {};

      const lastMove = log[log.length - 1] || '';
      const alreadyMoved = lastMove.startsWith(`${playerId} placed`) || lastMove.startsWith(`${playerId} drew`);
      if (alreadyMoved && extraDishPlays === 0) return alert('You already made a move!');

      if (tray.length === 0 && card !== '🍃 Banana Leaf') return alert('Start with 🍃 Banana Leaf!');
      if (!dishCards.includes(card)) return alert('Only dish cards allowed!');
      if (tray.includes(card)) return alert(`${card} already placed.`);

      const newHand = removeOneCard(hand, card);
      const newTray = [...tray, card];
      const logEntry = `${playerId} placed ${card} on tray`;

      const newLog = [...log, logEntry];
      if ([...new Set(newTray.filter(c => dishCards.includes(c)))].length === 11) {
        newLog.push(`${playerId} completed the Sadya and won! 🎉`);
        alert('🎉 You completed the Sadya and won!');
      }

      await Promise.all([
        set(ref(db, `/games/${GAME_ID}/players/${playerId}/hand`), newHand),
        set(ref(db, `/games/${GAME_ID}/players/${playerId}/tray`), newTray),
        set(ref(db, `/games/${GAME_ID}/log`), newLog),
      ]);

      if (extraDishPlays > 0) {
        const newPlays = extraDishPlays - 1;
        await set(ref(db, `/games/${GAME_ID}/players/${playerId}/extraDishPlays`), newPlays);
        if (newPlays === 0) await endTurn();
      } else {
        await endTurn();
      }
    } catch (err) {
      console.error("🔥 placeCard error:", err);
      alert("An error occurred while placing the card.");
    }
  };

  return (
    <div className={`app ${turn === playerId ? 'your-turn' : 'not-your-turn'}`}>
      <div className='header'><h1>Sadya Sabotage 🥳 <span className="version">{VERSION}</span></h1>
                <button className="start" onClick={() => startGame()}>
            Restart game ⟳
          </button></div>

      {!playerId ? (
        <div className="setup">
        <h3>Set number of players:</h3>
        <label>Player Count: </label>
        <input
          type="number"
          min="2"
          max="8"
          value={playerCountInput}
          onChange={(e) => setPlayerCountInput(parseInt(e.target.value))}
        />
        <button
          onClick={async () => {
            if (playerCountInput >= 2 && playerCountInput <= 8) {
              await set(ref(db, `/games/${GAME_ID}/playerCount`), playerCountInput);
              setPlayerCount(playerCountInput);
              await startGame(playerCountInput); // 👈 Add this line to auto restart game
            } else {
              alert('Choose between 2 to 8 players');
            }
          }}
        >
          Set
        </button>

          <h3>Select your player:</h3>
          {[...Array(playerCount)].map((_, i) => (
            <button key={i} onClick={() => setPlayerId(`player${i + 1}`)}>
              Play as Player {i + 1}
            </button>
          ))}
        </div>
      ) : (
        <>
          <p className="player-label">🎮 You are <strong>{playerId}</strong></p>
          <h2 className="turn-indicator">{turn === playerId ? "🔔 It's your turn!" : `🕒 It's ${turn}'s turn`}</h2>
          {isLoading && <div className="loading-screen"><div className="spinner" /><p>{isRestarting ? 'Restarting game...' : 'Loading game...'}</p></div>}


          <p><strong>Your Hand ({hand.length} cards):</strong></p>
          <div className="hand">{hand.map((card, i) => <Card key={i} card={card} onPlay={placeCard} />)}</div>
          <SadyaTray placedCards={tray} />
          <div className="tray opponent-tray">
            <h3>Other Players’ Trays 👀</h3>
            {Object.entries(allTrays).map(([id, data]) => (
              <div key={id}><strong>{id}:</strong> {data.tray?.length || 0} cards</div>
            ))}
          </div>

          <button className="draw" onClick={drawCard}>🎴 Draw Card</button>
          <button className="discard" onClick={() => setShowDiscardModal(true)}>🗑️ Discard Card</button>

          <div className="deck-debug">
            <h3>Deck Debug</h3>
            <p>{deck.length} cards left</p>
            <p>{deck.join(', ')}</p>
          </div>
          <div className="log"><h3>Game Log</h3>{log.map((entry, i) => <div key={i}>{entry}</div>)}</div>

          {showReplaceModal && <CardSelectorModal hand={hand} onSelect={onCardReplace} onCancel={cancelModal} title="Your hand is full — select a card to replace:" />}
          {showDiscardModal && <CardSelectorModal hand={hand} onSelect={onDiscardCard} onCancel={cancelModal} title="Select a card to discard:" />}
          {specialActionMessage && showSpecialAction && <SpecialActionModal message={specialActionMessage} onClose={() => setShowSpecialAction(false)} />}
        </>
      )}
    </div>
  );
};

export default App;
