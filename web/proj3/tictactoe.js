const cells = Array.from(document.querySelectorAll('.tic-cell'));
const statusEl = document.getElementById('game-status');
const resetBtn = document.getElementById('reset-game');
const wins = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let board = Array(9).fill('');
let player = 'X';

function updateStatus(text) {
  statusEl.textContent = text;
}

function resetGame() {
  board = Array(9).fill('');
  player = 'X';
  cells.forEach(cell => {
    cell.textContent = '';
    cell.disabled = false;
    cell.classList.remove('win');
  });
  updateStatus("Player X's turn");
}

function checkWinner() {
  for (const combo of wins) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      combo.forEach(index => cells[index].classList.add('win'));
      return board[a];
    }
  }
  return board.every(mark => mark) ? 'draw' : null;
}

function handleMove(event) {
  const cell = event.target;
  const index = Number(cell.dataset.cell);
  if (board[index]) return;

  board[index] = player;
  cell.textContent = player;

  const outcome = checkWinner();
  if (outcome) {
    if (outcome === 'draw') {
      updateStatus("It's a draw!");
    } else {
      updateStatus(`Player ${outcome} wins!`);
    }
    cells.forEach(btn => btn.disabled = true);
    return;
  }

  player = player === 'X' ? 'O' : 'X';
  updateStatus(`Player ${player}'s turn`);
}

cells.forEach(cell => cell.addEventListener('click', handleMove));
resetBtn.addEventListener('click', resetGame);
resetGame();
