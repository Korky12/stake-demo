// script.js: UI + propojení s game.js (balance v localStorage, grid, ovládání)
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

// ---- balance persistence and refill ----
function loadBalance() {
  const v = parseFloat(localStorage.getItem('demo_balance'));
  if (!v || v < 1) {
    balance = 100; // výchozí demo částka
    localStorage.setItem('demo_balance', balance);
  } else {
    balance = v;
  }
  renderBalance();
}
function updateBalance(v) {
  balance = Math.max(0, Math.round(v * 100) / 100);
  localStorage.setItem('demo_balance', balance);
  renderBalance();
}
function renderBalance() {
  balanceEl.textContent = balance.toFixed(2) + ' €';
}

// ---- grid build ----
function buildGrid() {
  GRID.innerHTML = '';
  tiles = [];
  for (let i = 0; i < 25; i++) {
    const t = document.createElement('div');
    t.className = 'tile';
    t.dataset.index = i;
    t.style.position = 'relative';
    t.innerHTML = '<div class="glow"></div><div class="content"></div>';
    t.addEventListener('click', onTileClick);
    GRID.appendChild(t);
    tiles.push(t);
  }
}

function onTileClick(e) {
  const idx = parseInt(e.currentTarget.dataset.index);
  if (!playing) return;
  if (e.currentTarget.classList.contains('revealed')) return;
  const res = GAME.reveal(idx);
  if (res.status === 'mine') {
    // explodovalo
    e.currentTarget.classList.add('revealed', 'mine');
    e.currentTarget.querySelector('.content').textContent = '💣';
    e.currentTarget.querySelector('.glow').classList.add('explode');
    loseAnimation(idx);
  } else if (res.status === 'safe') {
    e.currentTarget.classList.add('revealed', 'safe');
    safePicked = res.safeCount;
    e.currentTarget.querySelector('.content').textContent = safePicked;
    updateProfit();
    animateWin(e.currentTarget);
    cashoutBtn.disabled = false;
    pickedEl.textContent = safePicked;
  }
}

function animateWin(tile) {
  tile.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }],
    { duration: 300 }
  );
}

function loseAnimation(idx) {
  playing = false;
  cashoutBtn.disabled = true;
  // reveal all mines
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

// jednoduchý multiplier (můžeš upravit podle potřeby)
function calcMultiplier(mines, safe) {
  // základní rostoucí multiplikátor: čím víc safe polí vybereš, tím roste
  const mult = 1 + (safe * (1 / (25 - mines)) * 2.5);
  return Math.max(1, mult);
}

function updateProfit() {
  const mult = calcMultiplier(GAME.getState().minesCount, safePicked);
  const profit = currentBet * mult - currentBet;
  profitEl.textContent = profit.toFixed(2);
}

// ---- controls ----
betBtn.addEventListener('click', () => {
  currentBet = parseFloat(betAmountEl.value) || 0;
  if (currentBet <= 0) return alert('Zadej částku betu.');
  if (currentBet > balance) return alert('Nedostatečný zůstatek.');
  const mines = parseInt(minesSelect.value);
  GAME.setMines(mines);
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
  const pick = available[Math.floor(Math.random() * available.length)];
  pick.click();
});

cashoutBtn.addEventListener('click', () => {
  if (!playing) return;
  const mult = calcMultiplier(GAME.getState().minesCount, safePicked);
  const payout = currentBet * mult;
  updateBalance(balance + payout);
  profitEl.textContent = (payout - currentBet).toFixed(2);
  playing = false;
  cashoutBtn.disabled = true;
  // zvýraznit nasbírané bezpečné dlaždice
  tiles.forEach(t => {
    if (t.classList.contains('safe')) t.classList.add('collected');
  });
});

// init
loadBalance();
buildGrid();
// expose for debugging
window.__GAME = GAME;
