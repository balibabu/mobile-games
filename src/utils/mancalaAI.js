const EXTRA_TURN_BONUS = 5;
const CAPTURE_BONUS = 8;
const SEED_DIFF_WEIGHT = 1;

function getOpponentStore(player) {
  return player === 0 ? 13 : 6;
}

function getOpponentPits(player) {
  return player === 0 ? [7, 8, 9, 10, 11, 12] : [0, 1, 2, 3, 4, 5];
}

function getPlayerPits(player) {
  return player === 0 ? [0, 1, 2, 3, 4, 5] : [7, 8, 9, 10, 11, 12];
}

function getPlayerStore(player) {
  return player === 0 ? 6 : 13;
}

export function isValidMove(board, pitIndex, player) {
  if (player === 0 && pitIndex >= 0 && pitIndex <= 5 && board[pitIndex] > 0) return true;
  if (player === 1 && pitIndex >= 7 && pitIndex <= 12 && board[pitIndex] > 0) return true;
  return false;
}

export function sowSeeds(board, pitIndex, player) {
  const newBoard = [...board];
  let seeds = newBoard[pitIndex];
  newBoard[pitIndex] = 0;
  let current = pitIndex;

  while (seeds > 0) {
    current = (current + 1) % 14;
    if (current === getOpponentStore(player)) continue;
    newBoard[current]++;
    seeds--;
  }

  let extraTurn = false;
  if (current === getPlayerStore(player)) {
    extraTurn = true;
  }

  let captured = 0;
  if (!extraTurn && getPlayerPits(player).includes(current) && newBoard[current] === 1) {
    const opposite = 12 - current;
    if (newBoard[opposite] > 0) {
      captured = newBoard[opposite] + 1;
      newBoard[getPlayerStore(player)] += newBoard[opposite] + 1;
      newBoard[opposite] = 0;
      newBoard[current] = 0;
    }
  }

  return { board: newBoard, extraTurn, captured };
}

export function getValidMoves(board, player) {
  const pits = getPlayerPits(player);
  return pits.filter((i) => board[i] > 0);
}

export function isGameOver(board) {
  const p0Seeds = [0, 1, 2, 3, 4, 5].reduce((s, i) => s + board[i], 0);
  const p1Seeds = [7, 8, 9, 10, 11, 12].reduce((s, i) => s + board[i], 0);
  return p0Seeds === 0 || p1Seeds === 0;
}

export function collectRemaining(board, player) {
  const newBoard = [...board];
  const pits = getPlayerPits(player);
  let total = 0;
  pits.forEach((i) => {
    total += newBoard[i];
    newBoard[i] = 0;
  });
  newBoard[getPlayerStore(player)] += total;
  return newBoard;
}

export function getWinner(board) {
  if (board[6] > board[13]) return 0;
  if (board[13] > board[6]) return 1;
  return -1;
}

function evaluate(board, aiPlayer) {
  const opponent = 1 - aiPlayer;
  const myStore = board[getPlayerStore(aiPlayer)];
  const oppStore = board[getPlayerStore(opponent)];
  let score = (myStore - oppStore) * SEED_DIFF_WEIGHT;

  const myPits = getPlayerPits(aiPlayer);
  let emptyCount = 0;
  myPits.forEach((i) => {
    if (board[i] === 0) emptyCount++;
  });
  score -= emptyCount * 2;

  const oppPits = getPlayerPits(opponent);
  let oppEmpty = 0;
  oppPits.forEach((i) => {
    if (board[i] === 0) oppEmpty++;
  });
  score += oppEmpty * 2;

  return score;
}

function simulateMove(board, pitIndex, player) {
  const result = sowSeeds(board, pitIndex, player);
  let score = 0;
  if (result.extraTurn) score += EXTRA_TURN_BONUS;
  if (result.captured > 0) score += CAPTURE_BONUS + result.captured;
  return { board: result.board, extraTurn: result.extraTurn, score };
}

function minimax(board, depth, isMaximizing, aiPlayer, alpha, beta) {
  if (depth === 0 || isGameOver(board)) {
    return evaluate(board, aiPlayer);
  }

  const currentPlayer = isMaximizing ? aiPlayer : 1 - aiPlayer;
  const moves = getValidMoves(board, currentPlayer);

  if (moves.length === 0) return evaluate(board, aiPlayer);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const { board: newBoard, extraTurn } = simulateMove(board, move, currentPlayer);
      const val = minimax(newBoard, depth - (extraTurn ? 0 : 1), extraTurn ? true : false, aiPlayer, alpha, beta);
      maxEval = Math.max(maxEval, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const { board: newBoard, extraTurn } = simulateMove(board, move, currentPlayer);
      const val = minimax(newBoard, depth - (extraTurn ? 0 : 1), extraTurn ? false : true, aiPlayer, alpha, beta);
      minEval = Math.min(minEval, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getCPUMove(board, aiPlayer = 1, difficulty = 'medium') {
  const moves = getValidMoves(board, aiPlayer);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  const depths = { easy: 2, medium: 4, hard: 6 };
  const randomChance = { easy: 0.4, medium: 0.15, hard: 0.03 };
  const depth = depths[difficulty] || 4;

  if (Math.random() < (randomChance[difficulty] || 0.15)) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const { board: newBoard, extraTurn } = simulateMove(board, move, aiPlayer);
    const score = minimax(newBoard, depth - 1, extraTurn ? true : false, aiPlayer, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
