export function createBoard(level = 1) {
    const board = [];
    for (let r = 0; r < 5; r++) {
        const row = [];
        for (let c = 0; c < 5; c++) {
            row.push(false);
        }
        board.push(row);
    }

    const minLights = getMinLights(level);
    const maxLights = getMaxLights(level);
    const numLights = minLights + Math.floor(Math.random() * (maxLights - minLights + 1));

    const cells = [];
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            cells.push([r, c]);
        }
    }

    for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    for (let i = 0; i < numLights; i++) {
        const [r, c] = cells[i];
        board[r][c] = true;
    }

    if (isSolved(board)) {
        return createBoard(level);
    }

    return board;
}

function getMinLights(level) {
    if (level <= 1) return 3;
    if (level <= 3) return 4;
    if (level <= 5) return 5;
    if (level <= 7) return 6;
    if (level <= 9) return 8;
    return 10;
}

function getMaxLights(level) {
    if (level <= 1) return 4;
    if (level <= 3) return 6;
    if (level <= 5) return 8;
    if (level <= 7) return 10;
    if (level <= 9) return 12;
    return Math.min(15, 8 + level);
}

export function toggleCell(board, row, col) {
    const newBoard = board.map(r => [...r]);
    const directions = [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
            newBoard[newRow][newCol] = !newBoard[newRow][newCol];
        }
    }

    return newBoard;
}

export function isSolved(board) {
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (board[r][c]) {
                return false;
            }
        }
    }
    return true;
}

export function calculateTimeLimit(level) {
    return 60 + (level - 1) * 30;
}
