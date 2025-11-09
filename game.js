// game.js — samotná logika minové hry
const GAME = (() => {
  const SIZE = 25; // 5x5 grid
  let minesCount = 3;
  let mines = new Set();
  let revealed = new Set();
  let picks = [];

  // Nastavení počtu min
  function setMines(count) {
    minesCount = count;
    reset();
  }

  // Reset hry a generování nových min
  function reset() {
    mines.clear();
    revealed.clear();
    picks = [];
    while (mines.size < minesCount) {
      mines.add(Math.floor(Math.random() * SIZE));
    }
  }

  // Kontrola, zda je na poli mina
  function isMine(index) {
    return mines.has(index);
  }

  // Odkrytí pole
  function reveal(index) {
    if (revealed.has(index)) return { status: "already" };
    revealed.add(index);
    picks.push(index);

    if (isMine(index)) {
      return { status: "mine" };
    } else {
      const safeCount = picks.filter(i => !mines.has(i)).length;
      return { status: "safe", safeCount };
    }
  }

  // Vrátí všechny miny
  function revealAll() {
    return Array.from(mines);
  }

  // Získání stavu hry
  function getState() {
    return { minesCount, mines: Array.from(mines), picks: [...picks] };
  }

  // Výpočet multiplikátoru (čím víc safe, tím větší)
  function calcMultiplier(mines, safeCount) {
    const mult = 1 + (safeCount * (1 / (25 - mines)) * 2.5);
    return Math.max(1, mult);
  }

  return { SIZE, setMines, reset, reveal, revealAll, getState, calcMultiplier };
})();
