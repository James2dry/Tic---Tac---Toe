document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu");
  const gameContainer = document.getElementById("gameContainer");
  const board = document.getElementById("board");
  const message = document.getElementById("message");
  const status = document.getElementById("status");
  const restart = document.getElementById("restart");
  const mainMenu = document.getElementById("mainMenu");
  const scoreX = document.getElementById("scoreX");
  const scoreO = document.getElementById("scoreO");
  const twoPlayerBtn = document.getElementById("twoPlayerBtn");
  const aiModeBtn = document.getElementById("aiModeBtn");
  const difficultyMenu = document.getElementById("difficulty");

  let cells = Array(9).fill(null);
  const winningCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  let isPlayerTurn = true;
  let isTwoPlayer = false;
  let aiDifficulty = "easy";
  let scores = { X: 0, O: 0 };

  twoPlayerBtn.addEventListener("click", () => {
      isTwoPlayer = true;
      startGame("Two-Player Mode");
  });

  aiModeBtn.addEventListener("click", () => {
      difficultyMenu.classList.remove("hidden");
  });

  difficultyMenu.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") {
          aiDifficulty = e.target.dataset.difficulty;
          isTwoPlayer = false;
          startGame(`Player vs AI (${aiDifficulty.toUpperCase()})`);
      }
  });

  function startGame(title) {
      menu.classList.add("hidden");
      gameContainer.classList.remove("hidden");
      document.getElementById("gameTitle").textContent = title;
      resetBoard();
  }

  function resetBoard() {
      cells.fill(null);
      isPlayerTurn = true;
      board.innerHTML = '';
      message.classList.add("hidden");

      cells.forEach((_, index) => {
          const cell = document.createElement("div");
          cell.classList.add("cell");
          cell.dataset.index = index;
          cell.addEventListener("click", handleMove);
          board.appendChild(cell);
      });
  }

  function handleMove(e) {
      const index = e.target.dataset.index;
      if (cells[index] || checkWinner()) return;

      cells[index] = isPlayerTurn ? "X" : "O";
      e.target.textContent = cells[index];
      e.target.classList.add("taken");

      if (checkWinner()) {
          const winner = isPlayerTurn ? "X" : "O";
          endGame(winner);
      } else if (cells.every(cell => cell)) {
          endGame(null);
      } else {
          isPlayerTurn = !isPlayerTurn;

          if (!isTwoPlayer && !isPlayerTurn) {
              setTimeout(aiMove, 500);
          }
      }
  }

  function checkWinner() {
      for (const combo of winningCombos) {
          const [a, b, c] = combo;
          if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
              animateWinningCells(combo);
              return cells[a];
          }
      }
      return null;
  }

  function animateWinningCells(combo) {
      combo.forEach(index => {
          const cell = board.children[index];
          cell.classList.add("winner");
      });
  }

  function endGame(winner) {
      if (winner) {
          scores[winner]++;
          if (winner === "X") scoreX.textContent = scores.X;
          if (winner === "O") scoreO.textContent = scores.O;
          status.textContent = `Player ${winner} Wins!`;
      } else {
          status.textContent = "It's a Tie!";
      }
      message.classList.remove("hidden");
  }

  function aiMove() {
      let move;
      if (aiDifficulty === "easy") {
          move = findRandomMove();
      } else if (aiDifficulty === "normal") {
          move = findBlockingMove("O") || findRandomMove();
      } else {
          move = minimax("O").index;
      }
      
      if (move !== undefined) {
          cells[move] = "O";
          const cell = board.children[move];
          cell.textContent = "O";
          cell.classList.add("taken");
          if (checkWinner()) {
              endGame("O");
          } else if (cells.every(cell => cell)) {
              endGame(null);
          } else {
              isPlayerTurn = true;
          }
      }
  }

  function findRandomMove() {
      const availableMoves = cells.map((val, idx) => (val === null ? idx : null)).filter(idx => idx !== null);
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  function findBlockingMove(player) {
      for (const combo of winningCombos) {
          const [a, b, c] = combo;
          const values = [cells[a], cells[b], cells[c]];
          const playerCount = values.filter(val => val === player).length;
          const emptyCount = values.filter(val => val === null).length;

          if (playerCount === 2 && emptyCount === 1) {
              return combo[values.indexOf(null)];
          }
      }
      return null;
  }

  function minimax(player) {
      const opponent = player === "O" ? "X" : "O";
      const availableMoves = cells.map((val, idx) => (val === null ? idx : null)).filter(idx => idx !== null);

      // Check if game over
      const winner = checkWinner();
      if (winner === "O") return { score: 1 };
      if (winner === "X") return { score: -1 };
      if (availableMoves.length === 0) return { score: 0 };

      let bestMove = null;
      let bestScore = player === "O" ? -Infinity : Infinity;

      for (let move of availableMoves) {
          cells[move] = player;
          const result = minimax(opponent);
          cells[move] = null;

          const score = result.score;
          if (player === "O" && score > bestScore) {
              bestScore = score;
              bestMove = move;
          } else if (player === "X" && score < bestScore) {
              bestScore = score;
              bestMove = move;
          }
      }
      return { index: bestMove, score: bestScore };
  }

  restart.addEventListener("click", resetBoard);
  mainMenu.addEventListener("click", () => {
      scores = { X: 0, O: 0 };
      scoreX.textContent = scores.X;
      scoreO.textContent = scores.O;
      menu.classList.remove("hidden");
      gameContainer.classList.add("hidden");
      difficultyMenu.classList.add("hidden");
      message.classList.add("hidden");
  });
});
