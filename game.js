const grid = document.getElementById("grid");
const balanceDisplay = document.getElementById("balance");
const profitDisplay = document.getElementById("profit");
const pickedDisplay = document.getElementById("picked");
const betInput = document.getElementById("betAmount");
const minesSelect = document.getElementById("minesSelect");

const betBtn = document.getElementById("betBtn");
const randomBtn = document.getElementById("randomBtn");

let balance = 100;
let profit = 0;
let picked = 0;
let tiles = [];
let mines = [];
let gameActive = false;
let firstClickDone = false;

const GRID_SIZE = 5;

// 🎯 Vytvoření gridu
function createGrid() {
  grid.innerHTML = "";
  tiles = [];

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.addEventListener("click", () => handleTileClick(i));
    grid.appendChild(tile);
    tiles.push(tile);
  }
}

createGrid();
updateUI();

function updateUI() {
  balanceDisplay.textContent = balance.toFixed(2);
  profitDisplay.textContent = profit.toFixed(2);
  pickedDisplay.textContent = picked;
}

// 🧨 Start hry (po kliknutí na BET)
function startGame() {
  if (gameActive) {
    cashout();
    return;
  }

  const bet = parseFloat(betInput.value);
  if (isNaN(bet) || bet <= 0 || bet > balance) {
    alert("Neplatná sázka!");
    return;
  } // Odečteme sázku

  balance -= bet;
  profit = 0;
  picked = 0;
  firstClickDone = false;
  gameActive = true;
  updateUI(); // Vygenerujeme miny

  const mineCount = parseInt(minesSelect.value);
  const allIndexes = [...Array(GRID_SIZE * GRID_SIZE).keys()];
  mines = [];

  for (let i = 0; i < mineCount; i++) {
    const index = Math.floor(Math.random() * allIndexes.length);
    mines.push(allIndexes.splice(index, 1)[0]);
  } // Vyčistíme grid

  tiles.forEach((tile) => {
    tile.textContent = "";
    tile.className = "tile";
  });

  betBtn.textContent = "CASHOUT";
  betBtn.className = "btn yellow";
}

// 💎 Kliknutí na políčko
function handleTileClick(index) {
  if (!gameActive) return;

  const tile = tiles[index];
  if (tile.classList.contains("revealed")) return;

  if (!firstClickDone) firstClickDone = true;

  if (mines.includes(index)) {
    // PROHRA!
    tile.classList.add("revealed", "bomb");
    tile.textContent = "💣";
    loseGame(); // !!! Volání funkce s animovaným odhalováním
    revealAllTiles();
  } else {
    // VÝHRA TAHU
    tile.classList.add("revealed", "diamond");
    tile.textContent = "💎"; // Animace pro úspěšný klik
    tile.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.15)" },
        { transform: "scale(1)" },
      ],
      { duration: 300 }
    );
    picked++;
    profit += 0.3 * parseFloat(betInput.value);
    updateUI();
  }
}

/**
 * Odhalí všechna políčka po prohře s postupným efektem.
 */
function revealAllTiles() {
  tiles.forEach((tile, index) => {
    // Políčko, které již bylo odhaleno, přeskočíme
    if (tile.classList.contains("revealed")) return; // Postupné zpoždění: 30 ms na každé políčko pro kaskádový efekt

    const delay = index * 30;

    setTimeout(() => {
      if (mines.includes(index)) {
        // Zobrazit nekliknuté bomby
        tile.classList.add("revealed", "bomb");
        tile.textContent = "💣";
      } else {
        // Zobrazit zbývající diamanty
        tile.classList.add("revealed", "diamond-missed");
        tile.textContent = "💎";
      } // NOVÁ ANIMACE odhalení pro každé políčko

      tile.animate(
        [
          { opacity: 0, transform: "scale(0.5)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 200 } // Rychlá animace
      );
    }, delay); // Použití kaskádového zpoždění
  });
}

// 💰 Cashout
function cashout() {
  if (!gameActive) return;

  balance += profit;
  resetGame();
}

// 💥 Prohra
function loseGame() {
  gameActive = false;
  firstClickDone = false;
  profit = 0;
  betBtn.textContent = "BET";
  betBtn.className = "btn green";
  updateUI();
}

// 🔁 Reset
function resetGame() {
  gameActive = false;
  firstClickDone = false;
  profit = 0;
  picked = 0;
  betBtn.textContent = "BET";
  betBtn.className = "btn green";
  updateUI();
  createGrid();
}

// 🎲 Random tile (jen pokud hra běží)
function randomTile() {
  if (!gameActive) return;

  const unrevealed = tiles
    .map((t, i) => (!t.classList.contains("revealed") ? i : null))
    .filter((i) => i !== null);

  if (unrevealed.length === 0) return;

  const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
  handleTileClick(randomIndex);
}

// 🔘 Eventy
betBtn.addEventListener("click", startGame);
randomBtn.addEventListener("click", randomTile);
