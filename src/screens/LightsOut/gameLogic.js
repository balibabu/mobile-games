export function createBoard() {
    const board = [];
    for (let r = 0; r < 5; r++) {
        const row = [];
        for (let c = 0; c < 5; c++) {
            row.push(Math.random() < 0.5);
        }
        board.push(row);
    }

    if (isSolved(board)) {
        return createBoard();
    }

    return board;
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

export function calculateMoveLimit(level) {
    return 10 + Math.floor((level - 1) / 2) * 5;
}
