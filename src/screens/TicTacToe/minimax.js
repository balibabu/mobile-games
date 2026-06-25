const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],           // diagonals
];

export const checkWinner = (currentBoard) => {
    for (const line of winningLines) {
        const [a, b, c] = line;
        if (
            currentBoard[a] &&
            currentBoard[a] === currentBoard[b] &&
            currentBoard[a] === currentBoard[c]
        ) {
            return currentBoard[a];
        }
    }
    return null;
};

export const isBoardFull = (currentBoard) => currentBoard.every((cell) => cell !== null);

const minimax = (currentBoard, depth, isMaximizing) => {
    const result = checkWinner(currentBoard);

    if (result === 'O') return 10 - depth;     // Bot win
    if (result === 'X') return -10 + depth;    // Human win (delay loss)
    if (isBoardFull(currentBoard)) return 0;  // Draw

    if (isMaximizing) { // Bot (O) maximizing
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === null) {
                currentBoard[i] = 'O';
                const score = minimax(currentBoard, depth + 1, false);
                currentBoard[i] = null;
                bestScore = Math.max(bestScore, score);
            }
        }
        return bestScore;
    } else { // Human (X) minimizing
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === null) {
                currentBoard[i] = 'X';
                const score = minimax(currentBoard, depth + 1, true);
                currentBoard[i] = null;
                bestScore = Math.min(bestScore, score);
            }
        }
        return bestScore;
    }
};

export const getBestMove = (currentBoard) => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
            currentBoard[i] = 'O';
            const score = minimax(currentBoard, 0, false);
            currentBoard[i] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
};

export const getRandomMove = (currentBoard) => {
    const availableMoves = [];
    for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
            availableMoves.push(i);
        }
    }
    if (availableMoves.length === 0) return -1;
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
};
