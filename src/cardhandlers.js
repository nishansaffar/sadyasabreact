import { ref, set, onValue } from 'firebase/database';

export const getSpecialCardHandlers = (
  db,
  GAME_ID,
  playerId,
  hand,
  deck,
  log,
  setDeck,
  setHand,
  setLog,
  setSpecialActionMessage
) => {
  const opponentId = playerId === 'player1' ? 'player2' : 'player1';

  const endTurn = () =>
    set(ref(db, `/games/${GAME_ID}/currentTurn`), opponentId);

  return {
    '🚀 Thiruvonam Rush': () => {
      set(ref(db, `/games/${GAME_ID}/players/${playerId}/extraDishPlays`), 2);
      set(ref(db, `/games/${GAME_ID}/log`), [
        ...log,
        `${playerId} played 🚀 Thiruvonam Rush: can place 2 dish cards this turn`
      ]);
      setSpecialActionMessage(`${playerId} activated 🚀 Thiruvonam Rush and can place 2 dish cards this turn`);
    },

    '🍽 Double Pappadam': () => {
      const updatedDeck = [...deck];
      const drawnCard1 = updatedDeck.pop();
      const newHand = hand.filter(c => c !== '🍽 Double Pappadam');
      newHand.push(drawnCard1);

      const proceedToSecondDraw = async () => {
        const drawnCard2 = updatedDeck.pop();
        const finalHand = [...newHand, drawnCard2];

        setDeck(updatedDeck);
        setHand(finalHand);

        await Promise.all([
          set(ref(db, `/games/${GAME_ID}/deck`), updatedDeck),
          set(ref(db, `/games/${GAME_ID}/players/${playerId}/hand`), finalHand),
          set(ref(db, `/games/${GAME_ID}/log`), [
            ...log,
            `${playerId} played 🍽 Double Pappadam: drew ${drawnCard1} and ${drawnCard2}`
          ])
        ]);

        setSpecialActionMessage(`${playerId} used 🍽 Double Pappadam and drew 2 cards`);
        endTurn();
      };

      if (newHand.length >= 7) {
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
      Promise.all([
        set(ref(db, `/games/${GAME_ID}/deck`), updatedDeck),
        set(ref(db, `/games/${GAME_ID}/players/${playerId}/hand`), newHand),
        set(ref(db, `/games/${GAME_ID}/log`), [
          ...log,
          `${playerId} got 🧓 Muthassi’s Blessing: drew ${extraCards.join(', ')}`
        ])
      ]).then(() => {
        setSpecialActionMessage(`${playerId} used 🧓 Muthassi’s Blessing and drew 2 secret cards`);
        endTurn();
      });
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
        setSpecialActionMessage(`${playerId} shuffled ${opponentId}'s tray using 🎧 Sadya Disaster BGM`);
        endTurn();
      }, { onlyOnce: true });
    },

    '🥄 Sambar Spilled': () => {
      const trayRef = ref(db, `/games/${GAME_ID}/players/${opponentId}/tray`);
      const handRef = ref(db, `/games/${GAME_ID}/players/${opponentId}/hand`);

      onValue(trayRef, traySnap => {
        let tray = traySnap.val() || [];

        if (tray.includes('🥣 Sambar')) {
          tray = tray.filter((c, i, arr) => i !== arr.indexOf('🥣 Sambar'));
          set(trayRef, tray);
          set(ref(db, `/games/${GAME_ID}/log`), [
            ...log,
            `${playerId} played 🥄 Sambar Spilled: removed 🥣 Sambar from ${opponentId}'s tray`
          ]);
          setSpecialActionMessage(`${playerId} removed 🥣 Sambar from ${opponentId}'s tray using 🥄 Sambar Spilled`);
          endTurn();
        } else {
          onValue(handRef, handSnap => {
            let oppHand = handSnap.val() || [];

            if (oppHand.includes('🥣 Sambar')) {
              oppHand = oppHand.filter((c, i, arr) => i !== arr.indexOf('🥣 Sambar'));
              set(handRef, oppHand);
              set(ref(db, `/games/${GAME_ID}/log`), [
                ...log,
                `${playerId} played 🥄 Sambar Spilled: removed 🥣 Sambar from ${opponentId}'s hand`
              ]);
              setSpecialActionMessage(`${playerId} removed 🥣 Sambar from ${opponentId}'s hand using 🥄 Sambar Spilled`);
            } else {
              set(ref(db, `/games/${GAME_ID}/log`), [
                ...log,
                `${playerId} played 🥄 Sambar Spilled: but ${opponentId} had no 🥣 Sambar`
              ]);
              setSpecialActionMessage(`${playerId} played 🥄 Sambar Spilled, but ${opponentId} had no 🥣 Sambar`);
            }

            endTurn();
          }, { onlyOnce: true });
        }
      }, { onlyOnce: true });
    },

    '🍯 Payasam Overflow': () => {
      const trayRef = ref(db, `/games/${GAME_ID}/players/${opponentId}/tray`);
      const handRef = ref(db, `/games/${GAME_ID}/players/${opponentId}/hand`);

      onValue(trayRef, traySnap => {
        let tray = traySnap.val() || [];

        if (tray.includes('🍮 Payasam')) {
          tray = tray.filter((c, i, arr) => i !== arr.indexOf('🍮 Payasam'));
          set(trayRef, tray);
          set(ref(db, `/games/${GAME_ID}/log`), [
            ...log,
            `${playerId} played 🍯 Payasam Overflow: removed 🍮 Payasam from ${opponentId}'s tray`
          ]);
          setSpecialActionMessage(`${playerId} removed 🍮 Payasam from ${opponentId}'s tray using 🍯 Payasam Overflow`);
          endTurn();
        } else {
          onValue(handRef, handSnap => {
            let oppHand = handSnap.val() || [];

            if (oppHand.includes('🍮 Payasam')) {
              oppHand = oppHand.filter((c, i, arr) => i !== arr.indexOf('🍮 Payasam'));
              set(handRef, oppHand);
              set(ref(db, `/games/${GAME_ID}/log`), [
                ...log,
                `${playerId} played 🍯 Payasam Overflow: removed 🍮 Payasam from ${opponentId}'s hand`
              ]);
              setSpecialActionMessage(`${playerId} removed 🍮 Payasam from ${opponentId}'s hand using 🍯 Payasam Overflow`);
            } else {
              set(ref(db, `/games/${GAME_ID}/log`), [
                ...log,
                `${playerId} played 🍯 Payasam Overflow: but ${opponentId} had no 🍮 Payasam`
              ]);
              setSpecialActionMessage(`${playerId} played 🍯 Payasam Overflow, but ${opponentId} had no 🍮 Payasam`);
            }

            endTurn();
          }, { onlyOnce: true });
        }
      }, { onlyOnce: true });
    }
  };
};
