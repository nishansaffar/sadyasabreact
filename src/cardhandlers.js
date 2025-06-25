// cardHandlers.js

import { ref, set, onValue } from 'firebase/database';

export const getSpecialCardHandlers = (db, GAME_ID, playerId, hand, deck, log, setDeck, setHand, setLog) => {
  const opponentId = playerId === 'player1' ? 'player2' : 'player1';

  return {
    '🚀 Thiruvonam Rush': () => {
      // Give player 2 dish placements for this turn
      set(ref(db, `/games/${GAME_ID}/players/${playerId}/extraDishPlays`), 2);

      // Add to the log
      set(ref(db, `/games/${GAME_ID}/log`), [
        ...log,
        `${playerId} played 🚀 Thiruvonam Rush: can place 2 dish cards this turn`
      ]);
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
      const trayRef = ref(db, `/games/${GAME_ID}/players/${opponentId}/tray`);
      const handRef = ref(db, `/games/${GAME_ID}/players/${opponentId}/hand`);

      // Step 1: Try removing from tray
      onValue(trayRef, traySnap => {
        let tray = traySnap.val() || [];

        if (tray.includes('🥣 Sambar')) {
          tray = tray.filter((c, i, arr) => {
            // remove only one
            const idx = arr.indexOf('🥣 Sambar');
            return i !== idx;
          });

          set(trayRef, tray);
          set(ref(db, `/games/${GAME_ID}/log`), [
            ...log,
            `${playerId} played 🥄 Sambar Spilled: removed 🥣 Sambar from ${opponentId}'s tray`
          ]);
          return;
        }

        // Step 2: Try removing from hand
        onValue(handRef, handSnap => {
          let hand = handSnap.val() || [];

          if (hand.includes('🥣 Sambar')) {
            hand = hand.filter((c, i, arr) => {
              const idx = arr.indexOf('🥣 Sambar');
              return i !== idx;
            });

            set(handRef, hand);
            set(ref(db, `/games/${GAME_ID}/log`), [
              ...log,
              `${playerId} played 🥄 Sambar Spilled: removed 🥣 Sambar from ${opponentId}'s hand`
            ]);
          } else {
            set(ref(db, `/games/${GAME_ID}/log`), [
              ...log,
              `${playerId} played 🥄 Sambar Spilled: but ${opponentId} had no 🥣 Sambar`
            ]);
          }
        }, { onlyOnce: true });
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
