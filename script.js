const GRID = document.getElementById('grid');
const balanceEl = document.getElementById('balance');
const betAmountEl = document.getElementById('betAmount');
const minesSelect = document.getElementById('minesSelect');
const randomBtn = document.getElementById('randomBtn');
const pickedEl = document.getElementById('picked');
const profitEl = document.getElementById('profit');
const betBtn = document.getElementById('betBtn');

let tiles = [];
let playing = false;
let currentBet = 1;
let balance = 100;
let safePicked = 0;
const GRID_SIZE = 5;

// ---------- 💰 BALANCE ----------
function loadBalance() {
  const saved = parseFloat(localStorage.getItem('demo_balance'));
  if (!saved || saved < 1) {
    balance = 100;
    localStorage.setItem('demo_balance', balance);
  } else {
    balance = saved;
  }
  renderBalance();
}

function updateBalance(v) {
  balance = Math.max(0, Math.round(v * 100) / 100);
  localStorage.setItem('demo_balance', balance);
  renderBalance();
}

function renderBalance() {
  balanceEl.textContent = balance.toFixed(2);
}

// ---------- 🎮 HRA ----------
function createGrid() {
  GRID.innerHTML = '';
  tiles = [];

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.index = i;
    tile.innerHTML = '<div class="glow"></div><div class="content"></div>';
    tile.addEventListener('click', () => handleTileClick(i));
    GRID.appendChild(tile);
    tiles.push(tile);
  }
}

function startGame() {
  currentBet = parseFloat(betAmountEl.value);
  if (isNaN(currentBet) || currentBet <= 0 || currentBet > balance) {
    alert('Neplatná sázka!');
    return;
  }

  balance -= currentBet;
  safePicked = 0;
  playing = true;
  updateBalance(balance);
  pickedEl.textContent = '0';
  profitEl.textContent = '0.00';

  // Vygenerujeme miny
  const mineCount = parseInt(minesSelect.value);
  const allIndexes = [...Array(GRID_SIZE * GRID_SIZE).keys()];
  mines = [];
  for (let i = 0; i < mineCount; i++) {
    const index = Math.floor(Math.random() * allIndexes.length);
    mines.push(allIndexes.splice(index, 1)[0]);
  }

  tiles.forEach(tile => {
    tile.className = 'tile';
    const content = tile.querySelector('.content');
    content.textContent = '';
  });

  betBtn.textContent = 'CASHOUT';
  betBtn.className = 'btn yellow';
}

function handleTileClick(index) {
  if (!playing) return;

  const tile = tiles[index];
  if (tile.classList.contains('revealed')) return;

  if (mines.includes(index)) {
    showBomb(tile);
    loseGame();
    revealAllTiles();
  } else {
    showDiamond(tile);
    safePicked++;
    pickedEl.textContent = safePicked;
    profitEl.textContent = (safePicked * 0.3 * currentBet).toFixed(2);
  }
}

function showBomb(tile) {
  tile.classList.add('revealed', 'mine');
  const content = tile.querySelector('.content');
  content.textContent = '💣';
  const size = Math.min(tile.offsetWidth, tile.offsetHeight) * 0.9;
  content.style.fontSize = size + 'px';
  content.style.display = 'flex';
  content.style.alignItems = 'center';
  content.style.justifyContent = 'center';
  content.style.width = '100%';
  content.style.height = '100%';
}

function showDiamond(tile) {
  tile.classList.add('revealed', 'safe');
  const content = tile.querySelector('.content');
  content.textContent = '💎';
  const size = Math.min(tile.offsetWidth, tile.offsetHeight) * 0.9;
  content.style.fontSize = size + 'px';
  content.style.display = 'flex';
  content.style.alignItems = 'center';
  content.style.justifyContent = 'center';
  content.style.width = '100%';
  content.style.height = '100%';

  tile.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
    { duration: 300 }
  );
}

function revealAllTiles() {
  tiles.forEach((tile, index) => {
    if (tile.classList.contains('revealed')) return;
    if (mines.includes(index)) {
      showBomb(tile);
    } else {
      showDiamond(tile);
    }
  });
}

function loseGame() {
  playing = false;
  betBtn.textContent = 'BET';
  betBtn.className = 'btn green';
  profitEl.textContent = '-' + currentBet.toFixed(2);
}

function cashout() {
  if (!playing) return;
  balance += parseFloat(profitEl.textContent);
  updateBalance(balance);
  resetGame();
}

function resetGame() {
  playing = false;
  safePicked = 0;
  createGrid();
  pickedEl.textContent = '0';
  profitEl.textContent = '0.00';
  betBtn.textContent = 'BET';
  betBtn.className = 'btn green';
}

// ---------- 🎲 RANDOM ----------
randomBtn.addEventListener('click', () => {
  if (!playing) return;
  const available = tiles.filter(t => !t.classList.contains('revealed'));
  if (!available.length) return;
  const randomTile = available[Math.floor(Math.random() * available.length)];
  randomTile.click();
});

// ---------- 🔘 EVENT ----------
betBtn.addEventListener('click', () => {
  if (playing) {
    cashout();
  } else {
    startGame();
  }
});

// ---------- 🔄 INIT ----------
loadBalance();
createGrid();
