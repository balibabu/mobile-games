export const PITS_COUNT = 14;
export const BOT_START = 7;
export const BOT_STORE = 13;
export const PLAYER_STORE = 6;
export const INITIAL_GEMS = 4;

export const getInitialState = () => {
  const pits = new Array(PITS_COUNT).fill(0);
  for (let i = 0; i < 6; i++) {
    pits[i] = INITIAL_GEMS;
    pits[7 + i] = INITIAL_GEMS;
  }
  return pits;
};

export const getValidMoves = (pits, isBot) => {
  const start = isBot ? BOT_START : 0;
  const moves = [];
  for (let i = start; i < start + 6; i++) {
    if (pits[i] > 0) moves.push(i);
  }
  return moves;
};

export const makeMove = (pits, pitIndex) => {
  const newPits = [...pits];
  let stones = newPits[pitIndex];
  newPits[pitIndex] = 0;
  let current = pitIndex;

  while (stones > 0) {
    current = (current + 1) % PITS_COUNT;
    newPits[current] += 1;
    stones -= 1;
  }

  // Capture logic: if last stone lands in player's empty pit, capture both
  const isPlayerPit = current >= 0 && current <= 5;
  const isBotPit = current >= 7 && current <= 12;
  const playerMoved = pitIndex >= 0 && pitIndex <= 5;
  const botMoved = pitIndex >= 7 && pitIndex <= 12;

  if (playerMoved && isPlayerPit && newPits[current] === 1) {
    const opposite = 12 - current;
    if (newPits[opposite] > 0) {
      newPits[PLAYER_STORE] += newPits[opposite] + 1;
      newPits[opposite] = 0;
      newPits[current] = 0;
    }
  } else if (botMoved && isBotPit && newPits[current] === 1) {
    const opposite = 12 - (current - 7);
    if (newPits[opposite] > 0) {
      newPits[BOT_STORE] += newPits[opposite] + 1;
      newPits[opposite] = 0;
      newPits[current] = 0;
    }
  }

  const storeHit = current === PLAYER_STORE || current === BOT_STORE;

  return { newPits, storeHit };
};

export const isGameOver = (pits) => {
  const playerEmpty = pits.slice(0, 6).every((x) => x === 0);
  const botEmpty = pits.slice(7, 13).every((x) => x === 0);
  return playerEmpty || botEmpty;
};

export const finalizeGame = (pits) => {
  const newPits = [...pits];
  for (let i = 0; i < 6; i++) {
    newPits[PLAYER_STORE] += newPits[i];
    newPits[i] = 0;
    newPits[BOT_STORE] += newPits[7 + i];
    newPits[7 + i] = 0;
  }
  return newPits;
};

export const getWinner = (pits) => {
  if (pits[PLAYER_STORE] > pits[BOT_STORE]) return 'Player';
  if (pits[BOT_STORE] > pits[PLAYER_STORE]) return 'Bot';
  return 'Draw';
};

function evaluateState(pits) {
  return pits[BOT_STORE] - pits[PLAYER_STORE];
}

const minimax = (pits, depth, isMaximizing, alpha, beta) => {
  if (depth === 0) return { bestScore: evaluateState(pits), bestMove: null };

  const isBot = isMaximizing;
  const moves = getValidMoves(pits, isBot);
  if (moves.length === 0) {
    return { bestScore: evaluateState(pits), bestMove: null };
  }

  let bestScore = isMaximizing ? -Infinity : Infinity;
  let bestMove = null;

  for (const move of moves) {
    const { newPits } = makeMove(pits, move);
    const score = minimax(newPits, depth - 1, !isMaximizing, alpha, beta).bestScore;
    if (isMaximizing) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
    }
    if (beta <= alpha) break;
  }

  return { bestScore, bestMove };
};

export const findBestMove = (pits) => {
  const { bestMove } = minimax(pits, 6, true, -Infinity, Infinity);
  return bestMove ?? getValidMoves(pits, true)[0];
};
