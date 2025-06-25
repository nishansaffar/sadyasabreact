// src/deckLists.js

//52 cards for 2 players
export const slimDeckForTwo = [
  // Dish Cards
  '🍃 Banana Leaf', '🍃 Banana Leaf', '🍃 Banana Leaf', '🍃 Banana Leaf',
  '🍚 Rice', '🍚 Rice', '🍚 Rice',
  '🥣 Sambar', '🥣 Sambar', '🥣 Sambar',
  '🥦 Aviyal', '🥦 Aviyal', '🥦 Aviyal',
  '🍌 Kaalan', '🍌 Kaalan', '🍌 Kaalan',
  '🥬 Thoran', '🥬 Thoran', '🥬 Thoran',
  '🥒 Pachadi', '🥒 Pachadi', '🥒 Pachadi',
  '🍘 Pappadam', '🍘 Pappadam', '🍘 Pappadam',
  '🍌 Banana Chips', '🍌 Banana Chips', '🍌 Banana Chips', '🍌 Banana Chips',
  '🌶 Pickle', '🌶 Pickle', '🌶 Pickle',
  '🍮 Payasam',

  // Power Cards
  '🚀 Thiruvonam Rush', '🚀 Thiruvonam Rush',
  '🍽 Double Pappadam', '🍽 Double Pappadam',
  '🧓 Muthassi’s Blessing', '🧓 Muthassi’s Blessing',

  // Sabotage Cards
  '🎧 Sadya Disaster BGM', '🎧 Sadya Disaster BGM',
  '🥄 Sambar Spilled', '🥄 Sambar Spilled',
  '🍯 Payasam Overflow', '🍯 Payasam Overflow',
  '🧻 Pappadam Crushed', '🧻 Pappadam Crushed'
];

//68 cards for 3 to 4 players
export const standardDeck = [
  // Dish Cards
  '🍃 Banana Leaf', '🍃 Banana Leaf', '🍃 Banana Leaf', '🍃 Banana Leaf', '🍃 Banana Leaf',
  '🍚 Rice', '🍚 Rice', '🍚 Rice', '🍚 Rice',
  '🥣 Sambar', '🥣 Sambar', '🥣 Sambar', '🥣 Sambar',
  '🥦 Aviyal', '🥦 Aviyal', '🥦 Aviyal', '🥦 Aviyal',
  '🍌 Kaalan', '🍌 Kaalan', '🍌 Kaalan', '🍌 Kaalan',
  '🥬 Thoran', '🥬 Thoran', '🥬 Thoran', '🥬 Thoran',
  '🥒 Pachadi', '🥒 Pachadi', '🥒 Pachadi', '🥒 Pachadi',
  '🍘 Pappadam', '🍘 Pappadam', '🍘 Pappadam', '🍘 Pappadam',
  '🍌 Banana Chips', '🍌 Banana Chips', '🍌 Banana Chips', '🍌 Banana Chips',
  '🌶 Pickle', '🌶 Pickle', '🌶 Pickle', '🌶 Pickle',
  '🍮 Payasam', '🍮 Payasam',

  // Power Cards
  '🚀 Thiruvonam Rush', '🚀 Thiruvonam Rush', '🚀 Thiruvonam Rush',
  '🍽 Double Pappadam', '🍽 Double Pappadam', '🍽 Double Pappadam',
  '🧓 Muthassi’s Blessing', '🧓 Muthassi’s Blessing', '🧓 Muthassi’s Blessing',

  // Sabotage Cards
  '🎧 Sadya Disaster BGM', '🎧 Sadya Disaster BGM', '🎧 Sadya Disaster BGM',
  '🥄 Sambar Spilled', '🥄 Sambar Spilled', '🥄 Sambar Spilled',
  '🍯 Payasam Overflow', '🍯 Payasam Overflow', '🍯 Payasam Overflow',
  '🧻 Pappadam Crushed', '🧻 Pappadam Crushed', '🧻 Pappadam Crushed'
];

//5 to 8 players, 84 cards
export const extendedDeck = [
  // Dish Cards
  '🍃 Banana Leaf', '🍃 Banana Leaf', '🍃 Banana Leaf', '🍃 Banana Leaf', '🍃 Banana Leaf', '🍃 Banana Leaf',
  '🍚 Rice', '🍚 Rice', '🍚 Rice', '🍚 Rice',
  '🥣 Sambar', '🥣 Sambar', '🥣 Sambar', '🥣 Sambar',
  '🥦 Aviyal', '🥦 Aviyal', '🥦 Aviyal', '🥦 Aviyal',
  '🍌 Kaalan', '🍌 Kaalan', '🍌 Kaalan', '🍌 Kaalan',
  '🥬 Thoran', '🥬 Thoran', '🥬 Thoran', '🥬 Thoran',
  '🥒 Pachadi', '🥒 Pachadi', '🥒 Pachadi', '🥒 Pachadi',
  '🍘 Pappadam', '🍘 Pappadam', '🍘 Pappadam', '🍘 Pappadam',
  '🍌 Banana Chips', '🍌 Banana Chips', '🍌 Banana Chips', '🍌 Banana Chips',
  '🌶 Pickle', '🌶 Pickle', '🌶 Pickle', '🌶 Pickle',
  '🍮 Payasam', '🍮 Payasam',

  // Power Cards
  '🚀 Thiruvonam Rush', '🚀 Thiruvonam Rush', '🚀 Thiruvonam Rush',
  '🍽 Double Pappadam', '🍽 Double Pappadam', '🍽 Double Pappadam',
  '🧓 Muthassi’s Blessing', '🧓 Muthassi’s Blessing', '🧓 Muthassi’s Blessing',

  // Sabotage Cards
  '🎧 Sadya Disaster BGM', '🎧 Sadya Disaster BGM', '🎧 Sadya Disaster BGM',
  '🥄 Sambar Spilled', '🥄 Sambar Spilled', '🥄 Sambar Spilled',
  '🍯 Payasam Overflow', '🍯 Payasam Overflow', '🍯 Payasam Overflow',
  '🧻 Pappadam Crushed', '🧻 Pappadam Crushed', '🧻 Pappadam Crushed'
];

export function getDeckForPlayers(playerCount) {
  if (playerCount <= 2) return slimDeckForTwo;
  if (playerCount <= 4) return standardDeck;
  return extendedDeck;
}
