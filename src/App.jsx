// Sadya Sabotage - Web Multiplayer Prototype

import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, set, remove, get } from 'firebase/database';
import { getDeckForPlayers } from './decklists';
import { getSpecialCardHandlers } from './cardhandlers';
import './App.css';

const GAME_ID = 'game123';

const dishCards = [
  '🍃 Banana Leaf', '🍚 Rice', '🥣 Sambar', '🥦 Aviyal', '🍌 Kaalan',
  '🥬 Thoran', '🥒 Pachadi', '🍘 Pappadam', '🍌 Banana Chips', '🌶 Pickle', '🍮 Payasam'
];

const Card = ({ card, onPlay }) => (
  <div className="card" onClick={() => onPlay(card)}>
    {card}
  </div>
);

const SadyaTray = ({ placedCards }) => (
  <div className="tray">
    <h3>Your Sadya Tray 🍽️</h3>
    <div className="tray-cards">
      {placedCards.map((c, i) => <div key={i} className="tray-card">{c}</div>)}
    </div>
  </div>
);

const App = () => {
  const [deck, setDeck] = useState([]);
  const [playerId, setPlayerId] = useState('');
  const [hand, setHand] = useState([]);
  const [tray, setTray] = useState([]);
  const [opponentTray, setOpponentTray] = useState([]);
  const [turn, setTurn] = useState(null);
  const [log, setLog] = useState([]);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [pendingDrawReason, setPendingDrawReason] = useState(null);

  useEffect(() => {
    if (!playerId) return;
    const handRef = ref(db, `/games/${GAME_ID}/players/${playerId}/hand`);
    const playersRef = ref(db, `/games/${GAME_ID}/players`);
    const turnRef = ref(db, `/games/${GAME_ID}/currentTurn`);
    const logRef = ref(db, `/games/${GAME_ID}/log`);
    const deckRef = ref(db, `/games/${GAME_ID}/deck`);

    onValue(deckRef, snapshot => setDeck(snapshot.val() || []));
    onValue(handRef, snapshot => setHand(snapshot.val() || []));
    onValue(playersRef, snapshot => {
      const players = snapshot.val() || {};
      const myTray = players[playerId]?.tray || [];
      const opponentId = playerId === 'player1' ? 'player2' : 'player1';
      const theirTray = players[opponentId]?.tray || [];
      setTray(myTray);
      setOpponentTray(theirTray);
    });
    onValue(turnRef, snapshot => setTurn(snapshot.val()));
    onValue(logRef, snapshot => setLog(snapshot.val() || []));
  }, [playerId]);

  const CardSelectorModal = ({ hand, onSelect, onCancel }) => (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Your hand is full — select a card to replace:</h3>
        <div className="hand modal-hand">
          {hand.map((card, i) => (
            <div key={i} className="card" onClick={() => onSelect(card)}>
              {card}
            </div>
          ))}
        </div>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );

  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

  
  const startGame = async () => {
    await remove(ref(db, `/games/${GAME_ID}`));
    const deck = shuffleArray([...getDeckForPlayers(2)]);
    const player1Hand = deck.splice(0, 7);
    const player2Hand = deck.splice(0, 7);

    const gameState = {
      deck,
      currentTurn: 'player1',
      players: {
        player1: { hand: player1Hand, tray: [] },
        player2: { hand: player2Hand, tray: [] }
      },
      log: ['Game started.']
    };

    set(ref(db, `/games/${GAME_ID}`), gameState);
  };

  const resetGame = () => {
    remove(ref(db, `/games/${GAME_ID}`));
    setHand([]);
    setTray([]);
    setOpponentTray([]);
    setTurn(null);
    setLog([]);
  };

  const drawCard = () => {
    if (turn !== playerId) return alert("Not your turn!");
    if (hand.length >= 7) {
      setShowReplaceModal(true);
      setPendingDrawReason('replaceToDraw');
      return;
    }

    const newDeck = [...deck];
    const newCard = newDeck.pop();
    const newHand = [...hand, newCard];

    set(ref(db, `/games/${GAME_ID}/deck`), newDeck);
    set(ref(db, `/games/${GAME_ID}/players/${playerId}/hand`), newHand);
    set(ref(db, `/games/${GAME_ID}/log`), [...log, `${playerId} drew ${newCard}`]);
    set(ref(db, `/games/${GAME_ID}/currentTurn`), playerId === 'player1' ? 'player2' : 'player1');
  };

const placeCard = async (card) => {
  const playerRef = ref(db, `/games/${GAME_ID}/players/${playerId}`);
  const playerSnap = await get(playerRef);
  const playerData = playerSnap.val();
  const extraDishPlays = playerData?.extraDishPlays || 0;

  if (turn !== playerId) return alert("Not your turn!");
  const lastMove = log[log.length - 1] || '';
  const madeMove = lastMove.startsWith(`${playerId} placed`) || lastMove.startsWith(`${playerId} drew`);

  if (madeMove && extraDishPlays === 0) {
    return alert("You already made a move this turn!");
  }

  const newHand = removeOneCard(hand, card);

  const specialCardHandlers = getSpecialCardHandlers(db, GAME_ID, playerId, hand, deck, log, setDeck, setHand, setLog);

  if (specialCardHandlers[card]) {
    await Promise.all([
      set(ref(db, `/games/${GAME_ID}/players/${playerId}/hand`), newHand),
      set(ref(db, `/games/${GAME_ID}/log`), [...log, `${playerId} played ${card}`])
    ]);
    specialCardHandlers[card]();
    return; // Special cards don't auto switch turn anymore — they're responsible for their logic
  }

  if (tray.length === 0 && card !== '🍃 Banana Leaf') {
    return alert("Your first card must be 🍃 Banana Leaf!");
  }

  if (!dishCards.includes(card)) {
    return alert("You can't place power or sabotage cards on your tray!");
  }

  if (tray.includes(card)) {
    return alert(`You've already placed ${card} on your tray.`);
  }

  const updatedTray = [...tray, card];
  const uniqueDishes = [...new Set(updatedTray.filter(c => dishCards.includes(c)))];

  const finalLog = [...log, `${playerId} placed ${card} on tray`];
  if (uniqueDishes.length === 11) {
    alert("🎉 You completed the Sadya and won!");
    finalLog.push(`${playerId} completed the Sadya and won! 🎉`);
  }

  await Promise.all([
    set(ref(db, `/games/${GAME_ID}/players/${playerId}/hand`), newHand),
    set(ref(db, `/games/${GAME_ID}/players/${playerId}/tray`), updatedTray),
    set(ref(db, `/games/${GAME_ID}/log`), finalLog),
  ]);

  if (extraDishPlays > 0) {
    const newPlays = extraDishPlays - 1;
    await set(ref(db, `/games/${GAME_ID}/players/${playerId}/extraDishPlays`), newPlays);
    if (newPlays === 0) {
      set(ref(db, `/games/${GAME_ID}/currentTurn`), playerId === 'player1' ? 'player2' : 'player1');
    }
  } else {
    set(ref(db, `/games/${GAME_ID}/currentTurn`), playerId === 'player1' ? 'player2' : 'player1');
  }
};


function removeOneCard(handArray, cardToRemove) {
  const index = handArray.indexOf(cardToRemove);
  if (index === -1) return handArray;
  return [...handArray.slice(0, index), ...handArray.slice(index + 1)];
}

const onCardReplace = async (replaceCard) => {
  const deckRef = ref(db, `/games/${GAME_ID}/deck`);
  const handRef = ref(db, `/games/${GAME_ID}/players/${playerId}/hand`);
  const logRef = ref(db, `/games/${GAME_ID}/log`);

  try {
    const [deckSnap, handSnap] = await Promise.all([get(deckRef), get(handRef)]);
    const currentDeck = deckSnap.val() || [];
    const currentHand = handSnap.val() || [];

    if (currentDeck.length === 0) {
      alert("Deck is empty. Cannot draw a replacement card.");
      setShowReplaceModal(false);
      setPendingDrawReason(null);
      return;
    }

    const updatedHand = removeOneCard(currentHand, replaceCard);
    const shuffledDeck = shuffleArray([...currentDeck, replaceCard]);
    const newCard = shuffledDeck.pop();

    if (!newCard) {
      alert("No replacement card available.");
      return;
    }

    const finalHand = [...updatedHand, newCard];

    await Promise.all([
      set(deckRef, shuffledDeck),
      set(handRef, finalHand),
      set(logRef, [...log, `${playerId} replaced ${replaceCard} and drew ${newCard}`])
    ]);

    setDeck(shuffledDeck);
    setHand(finalHand);
    setShowReplaceModal(false);
    setPendingDrawReason(null);

    setTimeout(() => {
      set(ref(db, `/games/${GAME_ID}/currentTurn`),
        playerId === 'player1' ? 'player2' : 'player1');
    }, 100);
  } catch (err) {
    console.error("Error replacing card:", err);
    alert("An error occurred while replacing the card.");
  }
};

  const cancelReplace = () => {
    setShowReplaceModal(false);
    setPendingDrawReason(null);
  };

  return (
    <div className={`app ${turn === playerId ? 'your-turn' : 'not-your-turn'}`}>
      <h1>Sadya Sabotage 🥳</h1>
      {showReplaceModal && (
        <CardSelectorModal
          hand={hand}
          onSelect={onCardReplace}
          onCancel={cancelReplace}
        />
      )}

      {!playerId && (
        <div className="select-player">
          <h3>Select your player:</h3>
          <button onClick={() => setPlayerId('player1')}>Play as Player 1</button>
          <button onClick={() => setPlayerId('player2')}>Play as Player 2</button>
        </div>
      )}
      {playerId && (
        <>
          <p className="player-label">🎮 You are <strong>{playerId === 'player1' ? 'Player 1' : 'Player 2'}</strong></p>
          <button className="start" onClick={startGame}>Reset and Start Game</button>

          <p><strong>Your Hand ({hand.length} cards):</strong></p>
          <div className="hand">
            {hand.map((card, i) => <Card key={i} card={card} onPlay={placeCard} />)}
          </div>

          <SadyaTray placedCards={tray} />
          
          {/* 
          <div className="tray opponent-tray">
            <h3>Opponent’s Sadya Tray 👀</h3>
            <div className="tray-cards">
              {opponentTray.map((c, i) => <div key={i} className="tray-card">{c}</div>)}
            </div>
          </div>
          */}

          <div className="tray opponent-tray">
          <h3>Opponent’s Sadya Tray 👀 ({opponentTray.length} cards)</h3>
          <div className="tray-cards">
            {opponentTray.map((_, i) => (
              <div key={i} className="tray-card">❓</div> // hidden content
            ))}
          </div>
          </div>


          <button className="draw" onClick={drawCard}>🎴 Draw Card</button>
          <p><strong>Current Turn:</strong> {turn}</p>

          <div className="deck-debug">
            <h3>Deck Debug (Current Deck)</h3>
            <p>{deck.length} cards left</p>
            <p>{deck.join(', ')}</p>
          </div>

          <div className="log">
            <h3>Game Log</h3>
            {log.map((entry, i) => <div key={i}>{entry}</div>)}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
