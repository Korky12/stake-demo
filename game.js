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

// Výpočet payoutu podle počtu odhalených safe políček
// ---------- Výpočet férového payoutu ----------
function calculatePayout(safePicked, currentBet, mineCount) {
    const GRID_SIZE = 5;               // velikost gridu 5x5
    const NUMBER_OF_TILES = GRID_SIZE * GRID_SIZE;
    const HOUSE_EDGE = 0.99;           // kasino si bere 1%

    const safeTilesLeft = NUMBER_OF_TILES - mineCount;

    let probability = 1;

    // vypočítáme pravděpodobnost přežití pro všechny safe políčka, které hráč už odhalil
    for (let k = 0; k < safePicked; k++) {
        probability *= (safeTilesLeft - k) / (NUMBER_OF_TILES - k);
    }

    const payout = HOUSE_EDGE / probability;

    return currentBet * payout;
}


// 🧨 Start hry
function startGame() {
  if (gameActive) {
    cashout();
    return;
  }

  const bet = parseFloat(betInput.value);
  if (isNaN(bet) || bet <= 0 || bet > balance) {
    alert("Neplatná sázka!");
    return;
  }

  balance -= bet;
  profit = 0;
  picked = 0;
  firstClickDone = false;
  gameActive = true;
  updateUI();

  // Miny
  const mineCount = parseInt(minesSelect.value);
  const allIndexes = [...Array(GRID_SIZE * GRID_SIZE).keys()];
  mines = [];
  for (let i = 0; i < mineCount; i++) {
    const index = Math.floor(Math.random() * allIndexes.length);
    mines.push(allIndexes.splice(index, 1)[0]);
  }

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

  const currentBet = parseFloat(betInput.value);

  if (mines.includes(index)) {
    // PROHRA
    tile.classList.add("revealed", "mine");
    tile.textContent = "💣";
    loseGame();
    revealAllTiles();
  } else {
    // SAFE políčko
    tile.classList.add("revealed", "safe");
    tile.textContent = "💎";
    tile.animate([{ transform: "scale(1)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }], { duration: 300 });
    picked++;
    profit = calculatePayout(picked, currentBet, mines.length);
    updateUI();
  }
}

// Odhalí všechna políčka
function revealAllTiles() {
  tiles.forEach((tile, index) => {
    if (tile.classList.contains("revealed")) return;
    if (mines.includes(index)) {
      tile.classList.add("revealed", "mine");
      tile.textContent = "💣";
    } else {
      tile.classList.add("revealed", "safe");
      tile.textContent = "💎";
    }
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

// 🎲 Random tile
function randomTile() {
  if (!gameActive) return;
  const unrevealed = tiles.map((t, i) => (!t.classList.contains("revealed") ? i : null)).filter((i) => i !== null);
  if (unrevealed.length === 0) return;
  const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
  handleTileClick(randomIndex);
}

// 🔘 Eventy
betBtn.addEventListener("click", startGame);
randomBtn.addEventListener("click", randomTile);
