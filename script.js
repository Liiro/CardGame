// Audio files for game sounds
const next = new Audio("./Assets/card_flip.mp3"); // Sound for flipping a card
const win = new Audio("./Assets/victory.mp3"); // Sound for winning the game
const fail = new Audio("./Assets/fail.mp3"); // Sound for losing the game

// Array of card objects representing the game cards
const allCards = [
  {
    name: "rope",
    image: "./Assets/rope.png",
    imagePlayer: "./Assets/ropePlayer.png",
    start: true,
    to: ["portal1"],
  },
  {
    name: "ladder",
    image: "./Assets/ladder.png",
    imagePlayer: "./Assets/ladderplayer.png",
    start: true,
    to: ["gap", "bridge"],
  },
  {
    name: "bridge",
    image: "./Assets/bridge.png",
    imagePlayer: "./Assets/bridge_player.png",
    from: ["ladder"],
    to: ["hole", "portal2"],
  },
  {
    name: "cliff",
    image: "./Assets/cliff.png",
    imagePlayer: "./Assets/cliff_player.png",
    from: ["portal2"],
    lose: true,
  },
  {
    name: "hole",
    image: "./Assets/hole.png",
    imagePlayer: "./Assets/holePlayer.png",
    from: ["bridge"],
    lose: true,
  },
  {
    name: "gap",
    image: "./Assets/gap.png",
    imagePlayer: "./Assets/Broken_Road.png",
    from: ["ladder", "portal2"],
    lose: true,
  },
  {
    name: "portal2",
    image: "./Assets/Portal2.png",
    imagePlayer: "./Assets/portal2Player.png",
    from: ["bridge", "portal1"],
    to: ["cliff", "gap"],
  },
  {
    name: "slope",
    image: "./Assets/slope.png",
    imagePlayer: "./Assets/SlopePlayer.png",
    from: ["ropeBridge"],
    win: true,
  },
  {
    name: "portal1",
    image: "./Assets/portal1.png",
    imagePlayer: "./Assets/portalplayer.png",
    from: ["rope"],
    to: ["ropeBridge", "portal2"],
  },
  {
    name: "ropeBridge",
    image: "./Assets/rope_bridge.png",
    imagePlayer: "./Assets/rope_bridge_player.png",
    from: ["portal1"],
    to: ["slope"],
  },
];

// Start and end cards
const startCard = {
  name: "start",
  image: "./Assets/Start.png",
  imagePlayer: "./Assets/startPlayer.png",
  start: true,
  isStartEnd: true,
};
const endCard = {
  name: "end",
  image: "./Assets/Goal.png",
  ImagePlayer: "./Assets/goal_player.png",
  isStartEnd: true,
};

// Game state variables
let currentCard = null; // Currently selected card
let currentPosition = 0; // Current position in the game
const stepHeight = 100; // Height for positioning cards (not used in this code)
let shuffledCards = []; // Array to hold shuffled cards

// DOM elements
const dialogP = document.getElementById("dialog-content"); // Dialog content
const dialogElement = document.getElementById("dialog"); // Dialog element

// Initialize the game
function initGame() {
  currentCard = null;
  currentPosition = 0;
  renderCards(); // Render the cards on the screen
  enableCards(allCards.filter((card) => card.start)); // Enable starting cards
}

// Render all cards on the screen
function renderCards() {
  const rows = document.getElementById("cards-rows");
  rows.innerHTML = "";

  // Render the start card
  const startRow = document.createElement("div");
  startRow.className = "cards-row start-row";
  const startCardElement = document.createElement("div");
  startCardElement.id = "startId";
  startCardElement.className = "card start-card";
  startCardElement.innerText = "Start"; // Visual representation of the start card
  startCardElement.classList.add("start-card-player");
  startRow.appendChild(startCardElement);
  rows.appendChild(startRow);

  // Group cards by their level (based on their position in the game)
  const cardLevels = groupCardsByLevel(allCards);

  // Render each level as a row
  cardLevels.forEach((cards, level) => {
    const row = document.createElement("div");
    row.className = "cards-row";

    // Shuffle the cards in the row
    shuffledCards = shuffleArray(cards);

    // Render each card in the row
    shuffledCards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = `card`;
      cardElement.dataset.name = card.name;

      const cardInner = document.createElement("div");
      cardInner.className = "card-inner";

      const cardFront = document.createElement("div");
      cardFront.className = "card-front";

      const cardBack = document.createElement("div");
      cardBack.className = "card-back";
      cardBack.innerHTML = `<img src="${card.image}" alt="${card.name}"><p>${card.name}</p>`;

      cardInner.appendChild(cardFront);
      cardInner.appendChild(cardBack);
      cardElement.appendChild(cardInner);

      // Add click event to handle card selection
      cardElement.onclick = () => handleCardClick(card, cardElement);
      row.appendChild(cardElement);
    });

    rows.appendChild(row);
  });

  // Render the end card
  const endRow = document.createElement("div");
  endRow.className = "cards-row end-row";
  const endCardElement = document.createElement("div");
  endCardElement.className = "card end-card";
  endCardElement.innerText = "End"; // Visual representation of the end card
  endCardElement.id = "endId";
  endRow.appendChild(endCardElement);
  rows.appendChild(endRow);
}

// Group cards by their level in the game hierarchy
function groupCardsByLevel(cards) {
  const levels = new Map();
  const addedCards = new Set(); // Track added cards to avoid duplicates

  // Starting cards are at level 0
  const startingCards = cards.filter((card) => card.start);
  levels.set(0, startingCards);
  startingCards.forEach((card) => addedCards.add(card.name));

  let currentLevel = 0;

  // Traverse the hierarchy to assign levels
  while (true) {
    const nextLevelCards = [];
    const currentLevelCards = levels.get(currentLevel);

    currentLevelCards.forEach((card) => {
      if (card.to) {
        card.to.forEach((nextCardName) => {
          const nextCard = cards.find((c) => c.name === nextCardName);
          if (nextCard && !addedCards.has(nextCard.name)) {
            nextLevelCards.push(nextCard);
            addedCards.add(nextCard.name); // Mark as added
          }
        });
      }
    });

    if (nextLevelCards.length === 0) break;
    levels.set(currentLevel + 1, nextLevelCards);
    currentLevel++;
  }

  return levels;
}

// Shuffle an array randomly
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

// Enable or disable cards based on their availability
function enableCards(cards) {
  const allCardElements = document.querySelectorAll(".card");
  allCardElements.forEach((cardElement) => {
    const cardName = cardElement.dataset.name;
    const isEnabled = cards.some((card) => card.name === cardName);
    cardElement.classList.toggle("inactive", !isEnabled);
    cardElement.style.cursor = isEnabled ? "pointer" : "not-allowed";
  });
}

// Utility function to create a delay
function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Utility function to sleep and then execute a function
async function sleep(fn, ...args) {
  await timeout(500);
  return fn(...args);
}

// Play a sound and wait for it to finish
function playSoundAndWait(sound) {
  return new Promise((resolve) => {
    sound.onended = resolve; // Resolve the promise when the sound ends
    sound.play(); // Play the sound
  });
}

// Handle card click events
async function handleCardClick(card, cardElement) {
  if (cardElement.classList.contains("inactive")) return; // Ignore inactive cards
  document.getElementById("startId").classList.remove("start-card-player");

  next.play(); // Play the card flip sound

  // Revert the previously revealed card to its original state
  if (currentCard && currentCard !== card) {
    const prevCardElement = document.querySelector(
      `.card[data-name="${currentCard.name}"]`
    );
    const prevCardBack = prevCardElement.querySelector(".card-back");
    prevCardBack.innerHTML = `<img src="${currentCard.image}" alt="${currentCard.name}">`;
  }

  // Reveal the current card and update its image
  cardElement.classList.add("revealed");
  const cardBack = cardElement.querySelector(".card-back");
  cardBack.innerHTML = `<img src="${card.imagePlayer}" alt="${card.name}">`;

  // Save the current card as the most recently revealed
  currentCard = card;

  const handleCard = async () => {
    if (card.lose) {
      // Handle losing the game
      dialogElement.classList.add("loseDialog");
      fail.play();
      const randomMessage = generateLossMessage(card);
      dialogP.innerText = randomMessage;
      dialog.showModal();
      return;
    }

    if (card.win) {
      // Handle winning the game
      dialogElement.classList.remove("loseDialog");
      dialogElement.classList.add("winDialog");
      win.play();
      dialog.showModal();
      dialogP.innerText = "Good job! you made it safely!";
      cardBack.innerHTML = `<img src="${card.image}" alt="${card.name}">`;
      document.getElementById("endId").classList.add("end-card-player");
      return;
    }

    currentPosition++;

    // Enable the next valid cards
    const nextCards = allCards.filter(
      (nextCard) =>
        currentCard.to.includes(nextCard.name) &&
        nextCard.from.includes(currentCard.name)
    );
    enableCards(nextCards);
  };

  await sleep(handleCard); // Wait before handling the card
}

// Generate a loss message based on the card
function generateLossMessage(card) {
  switch (card.name) {
    case "hole":
      return "Oh no.. you fell into the hole!";
    case "cliff":
      return "Watch out! You fell off the cliff!";
    case "gap":
      return "Oops, you fell into the gap!";
    default:
      return "You lost!";
  }
}

// Start the game
initGame();

// Add event listener for the retry button
document.getElementById("retryBtn").addEventListener("click", initGame);
