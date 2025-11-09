// game.js: herní logika (5x5 pole, náhodné rozmístění min)
const GAME = (() => {
  const size = 25; // 5x5
  let minesCount = 3;
  let mines = new Set();
  let revealed = new Set();
  let picks = [];

  function setMines(count) {
    minesCount = count;
    reset();
  }

  function reset() {
    mines.clear();
    revealed.clear();
    picks = [];
    while (mines.size < minesCount) {
      mines.add(Math.floor(Math.random() * size));
    }
  }

  function isMine(idx) {
    return mines.has(idx);
  }

  function reveal(idx) {
    if (revealed.has(idx)) return { status: 'already' };
    revealed.add(idx);
    picks.push(idx);
    if (isMine(idx)) return { status: 'mine' };
    return { status: 'safe', safeCount: picks.filter(i => !mines.has(i)).length };
  }

  function revealAll() {
    return Array.from(mines);
  }

  function getState() {
    return { minesCount, mines: Array.from(mines), picks: [...picks] };
  }

  return { setMines, reset, reveal, isMine, revealAll, getState, size };
})();
