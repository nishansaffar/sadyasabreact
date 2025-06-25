// cardHandlers.js

import { ref, set, onValue } from 'firebase/database';

export const getSpecialCardHandlers = (db, GAME_ID, playerId, hand, deck, log, setDeck, setHand, setLog) => {
  const opponentId = playerId === 'player1' ? 'player2' : 'player1';

  return {
    '🚀 Thiruvonam Rush': () => {
      set(ref(db, `/games/${GAME_ID}/currentTurn`), playerId); // skip opponent
      set(ref(db, `/games/${GAME_ID}/log`), [...log, `${playerId} skipped ${opponentId}'s turn 🚀`]);
    },

    '🍽 Double Pappadam': () => {
    const updatedDeck = [...deck];
    const drawnCard1 = updatedDeck.pop();
    const newHand = hand.filter(c => c !== '🍽 Double Pappadam');
    newHand.push(drawnCard1);

    const proceedToSecondDraw = () => {
        const drawnCard2 = updatedDeck.pop();
        const finalHand = [...newHand, drawnCard2];

        setDeck(updatedDeck);
        setHand(finalHand);
        set(ref(db, `/games/${GAME_ID}/deck`), updatedDeck);
        set(ref(db, `/games/${GAME_ID}/players/${playerId}/hand`), finalHand);
        set(ref(db, `/games/${GAME_ID}/log`), [
        ...log,
        `${playerId} played 🍽 Double Pappadam: drew ${drawnCard1} and ${drawnCard2}`
        ]);
    };

    if (newHand.length >= 7) {
        // Ask for card to discard before drawing second
        const discard = prompt(
        `You drew ${drawnCard1}. Your hand is full.\nChoose a card to discard before drawing the second one:`
        );

        if (!discard || !newHand.includes(discard)) {
        alert("Invalid choice. You must discard a valid card.");
        return;
        }

        const updatedHand = newHand.filter(c => c !== discard);
        setHand(updatedHand);
        set(ref(db, `/games/${GAME_ID}/players/${playerId}/hand`), updatedHand);

        // Continue to draw the second card
        newHand.splice(0, newHand.length, ...updatedHand);
        proceedToSecondDraw();
    } else {
        proceedToSecondDraw();
    }
    },


    '🧓 Muthassi’s Blessing': () => {
      const updatedDeck = [...deck];
      const extraCards = [updatedDeck.pop(), updatedDeck.pop()];
      const newHand = [...hand, ...extraCards];

      setDeck(updatedDeck);
      setHand(newHand);
      set(ref(db, `/games/${GAME_ID}/deck`), updatedDeck);
      set(ref(db, `/games/${GAME_ID}/players/${playerId}/hand`), newHand);
      set(ref(db, `/games/${GAME_ID}/log`), [
        ...log,
        `${playerId} got 🧓 Muthassi’s Blessing: drew ${extraCards.join(', ')}`
      ]);
    },

    '🎧 Sadya Disaster BGM': () => {
      const theirTrayRef = ref(db, `/games/${GAME_ID}/players/${opponentId}/tray`);
      onValue(theirTrayRef, snapshot => {
        const current = snapshot.val() || [];
        const shuffled = current.sort(() => Math.random() - 0.5);
        set(theirTrayRef, shuffled);
        set(ref(db, `/games/${GAME_ID}/log`), [
          ...log,
          `${playerId} played 🎧 Sadya Disaster BGM: shuffled ${opponentId}'s tray`
        ]);
      }, { onlyOnce: true });
    },

    '🥄 Sambar Spilled': () => {
      const theirTrayRef = ref(db, `/games/${GAME_ID}/players/${opponentId}/tray`);
      onValue(theirTrayRef, snapshot => {
        const tray = snapshot.val() || [];
        if (tray.length > 0) {
          const removed = tray.pop();
          set(theirTrayRef, tray);
          set(ref(db, `/games/${GAME_ID}/log`), [
            ...log,
            `${playerId} spilled 🥄 Sambar: removed ${removed} from ${opponentId}'s tray`
          ]);
        }
      }, { onlyOnce: true });
    },

    '🍯 Payasam Overflow': () => {
    const opponentHandRef = ref(db, `/games/${GAME_ID}/players/${opponentId}/hand`);
    const opponentTrayRef = ref(db, `/games/${GAME_ID}/players/${opponentId}/tray`);

    // Step 1: Check tray first
    onValue(opponentTrayRef, traySnap => {
        let tray = traySnap.val() || [];

        if (tray.includes('🍮 Payasam')) {
        tray = tray.filter(c => c !== '🍮 Payasam');

        set(opponentTrayRef, tray);
        set(ref(db, `/games/${GAME_ID}/log`), [
            ...log,
            `${playerId} played 🍯 Payasam Overflow: removed 🍮 Payasam from ${opponentId}'s tray`
        ]);
        return;
        }

        // Step 2: If not in tray, try removing from hand
        onValue(opponentHandRef, handSnap => {
        let hand = handSnap.val() || [];

        if (hand.includes('🍮 Payasam')) {
            hand = hand.filter(c => c !== '🍮 Payasam');

            set(opponentHandRef, hand);
            set(ref(db, `/games/${GAME_ID}/log`), [
            ...log,
            `${playerId} played 🍯 Payasam Overflow: removed 🍮 Payasam from ${opponentId}'s hand`
            ]);
        } else {
            set(ref(db, `/games/${GAME_ID}/log`), [
            ...log,
            `${playerId} played 🍯 Payasam Overflow: but ${opponentId} had no 🍮 Payasam`
            ]);
        }
        }, { onlyOnce: true });

    }, { onlyOnce: true });
    }
  };
};
