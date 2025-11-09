// script.js — propojení hry s UI a ovládáním
const GRID = document.getElementById('grid');
const balanceEl = document.getElementById('balance');
const betAmountEl = document.getElementById('betAmount');
const minesSelect = document.getElementById('minesSelect');
const betBtn = document.getElementById('betBtn');
const randomBtn = document.getElementById('randomBtn');
const pickedEl = document.getElementById('picked');
const profitEl = document.getElementById('profit');
const cashoutBtn = document.getElementById('cashoutBtn');

let tiles = [];
let playing = false;
let currentBet = 1;
let balance = 0;
let safePicked = 0;

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
  balanceEl.textContent = balance.toFixed(2) + " €";
}

// ---------- 🎮 HRA ----------
function buildGrid() {
  GRID.innerHTML = '';
  tiles = [];

  for (let i = 0; i < GAME.SIZE; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.index = i;
    tile.innerHTML = '<div class="glow"></div><div class="content"></div>';
    tile.addEventListener('click', onTileClick);
    GRID.appendChild(tile);
    tiles.push(tile);
  }
}

function onTileClick(e) {
  if (!playing) return;

  const tile = e.currentTarget;
  const index = parseInt(tile.dataset.index);
  if (tile.classList.contains('revealed')) return;

  const res = GAME.reveal(index);

  if (res.status === 'mine') {
    showMine(tile);
    loseGame();
  } else if (res.status === 'safe') {
    showDiamond(tile);
    safePicked = res.safeCount;
    updateProfit();
    pickedEl.textContent = safePicked;
    cashoutBtn.disabled = false;
  }
}

function showMine(tile) {
  tile.classList.add('revealed', 'mine');
  tile.querySelector('.content').textContent = '💣';
}

function showDiamond(tile) {
  tile.classList.add('revealed', 'safe');
  tile.querySelector('.content').textContent = '💎';
  tile.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
    { duration: 300 }
  );
}

function loseGame() {
  playing = false;
  cashoutBtn.disabled = true;

  const mines = GAME.revealAll();
  mines.forEach(i => {
    if (!tiles[i].classList.contains('revealed')) {
      tiles[i].classList.add('revealed', 'mine');
      tiles[i].querySelector('.content').textContent = '💣';
    }
  });

  profitEl.textContent = '-' + currentBet.toFixed(2);
  updateBalance(balance - currentBet);
}

// ---------- 🧮 PROFIT ----------
function updateProfit() {
  const mult = GAME.calcMultiplier(GAME.getState().minesCount, safePicked);
  const profit = currentBet * mult - currentBet;
  profitEl.textContent = profit.toFixed(2);
}

// ---------- 🎛️ OVLÁDÁNÍ ----------
betBtn.addEventListener('click', () => {
  currentBet = parseFloat(betAmountEl.value) || 0;
  if (currentBet <= 0) return alert('Zadej částku betu.');
  if (currentBet > balance) return alert('Nedostatečný zůstatek.');

  GAME.setMines(parseInt(minesSelect.value));
  GAME.reset();
  buildGrid();
  playing = true;
  safePicked = 0;
  pickedEl.textContent = '0';
  profitEl.textContent = '0.00';
  updateBalance(balance - currentBet);
  cashoutBtn.disabled = true;
});

randomBtn.addEventListener('click', () => {
  if (!playing) return;
  const available = tiles.filter(t => !t.classList.contains('revealed'));
  if (available.length === 0) return;
  const randomTile = available[Math.floor(Math.random() * available.length)];
  randomTile.click();
});

cashoutBtn.addEventListener('click', () => {
  if (!playing) return;

  const mult = GAME.calcMultiplier(GAME.getState().minesCount, safePicked);
  const payout = currentBet * mult;

  updateBalance(balance + payout);
  profitEl.textContent = (payout - currentBet).toFixed(2);

  // ukázání všech bezpečných polí jako "collected"
  tiles.forEach(t => {
    if (t.classList.contains('safe')) {
      t.classList.add('collected');
      t.querySelector('.content').textContent = '💎';
    }
  });

  playing = false;
  cashoutBtn.disabled = true;

  // ---------- OKAMŽITÝ RESET GRIDU ----------
  setTimeout(() => {
    GAME.reset();
    buildGrid();
    safePicked = 0;
    pickedEl.textContent = '0';
    profitEl.textContent = '0.00';
  }, 100); // malý timeout, aby se diamanty stihly zobrazit
});

// ---------- 🔄 INIT ----------
loadBalance();
buildGrid();
