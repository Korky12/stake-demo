const GRID = document.getElementById('grid');
const balanceEl = document.getElementById('balance');
const betAmountEl = document.getElementById('betAmount');
const minesSelect = document.getElementById('minesSelect');
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

function startGame() {
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
  // Odečtení sázky PŘED startem hry (což je správně)
  updateBalance(balance - currentBet); 
  cashoutBtn.disabled = true;
}

// Spustí hru automaticky po zadání betu
betAmountEl.addEventListener('change', () => { startGame(); });
minesSelect.addEventListener('change', () => {
  if (parseFloat(betAmountEl.value) > 0) startGame();
});

function onTileClick(e) {
  if (!playing) return;

  const tile = e.currentTarget;
  const index = parseInt(tile.dataset.index);
  if (tile.classList.contains('revealed')) return;

  const res = GAME.reveal(index);

  if (res.status === 'mine') {
    showBomb(tile); // Zobrazí kliknutou bombu
    loseGame();
    // !!! Odhalení celého pole ihned po prohře
    revealAllTiles(); 
  } else if (res.status === 'safe') {
    showDiamond(tile);
    safePicked = res.safeCount;
    updateProfit();
    pickedEl.textContent = safePicked;
    cashoutBtn.disabled = false;
  }
}

// Emoji přes celý tile pro bombu
function showBomb(tile) {
  tile.classList.add('revealed', 'mine');
  const content = tile.querySelector('.content');
  content.textContent = '💣';
  content.style.fontSize = tile.offsetHeight + 'px';
  content.style.lineHeight = tile.offsetHeight + 'px';
}

function showDiamond(tile) {
  tile.classList.add('revealed', 'safe');
  const content = tile.querySelector('.content');
  content.textContent = '💎';
  content.style.fontSize = tile.offsetHeight + 'px';
  content.style.lineHeight = tile.offsetHeight + 'px';
  tile.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
    { duration: 300 }
  );
}

/**
 * Odhalí všechny políčka, která ještě nebyla odhalena, 
 * zobrazí buď zbývající bomby, nebo diamanty.
 */
function revealAllTiles() {
  const gameState = GAME.getState();
  tiles.forEach((tile, index) => {
    // Políčko, které již bylo odhaleno, přeskočíme
    if (tile.classList.contains('revealed')) return;

    const isMine = gameState.mines.includes(index);

    if (isMine) {
      // Zobrazí ostatní (nekliknuté) bomby
      showBomb(tile);
    } else {
      // Zobrazí zbývající diamanty
      showDiamond(tile);
    }
  });
}


function loseGame() {
  playing = false;
  cashoutBtn.disabled = true;

  // Nastaví profit na mínus sázku (zůstatek byl odečten už při startGame)
  profitEl.textContent = '-' + currentBet.toFixed(2);
}

// ---------- 🧮 PROFIT ----------
function updateProfit() {
  const mult = GAME.calcMultiplier(GAME.getState().minesCount, safePicked);
  const profit = currentBet * mult - currentBet;
  profitEl.textContent = profit.toFixed(2);
}

// ---------- 🎛️ OVLÁDÁNÍ ----------
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

  tiles.forEach(t => {
    if (t.classList.contains('safe')) {
      t.classList.add('collected');
      const content = t.querySelector('.content');
      content.textContent = '💎';
      content.style.fontSize = t.offsetHeight + 'px';
      content.style.lineHeight = t.offsetHeight + 'px';
    }
  });

  playing = false;
  cashoutBtn.disabled = true;

  // automatický reset po krátké animaci
  setTimeout(() => {
    GAME.reset();
    buildGrid();
    pickedEl.textContent = '0';
    profitEl.textContent = '0.00';
  }, 1200);
});

// ---------- 🔄 INIT ----------
loadBalance();
buildGrid();