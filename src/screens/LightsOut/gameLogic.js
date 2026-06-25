export function createBoard(level = 1) {
    let board = Array.from({ length: 5 }, () => Array(5).fill(false));
    const numToggles = Math.min(15, level);
    const cells = Array.from({ length: 25 }, (_, i) => [Math.floor(i / 5), i % 5]);
    for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    for (let i = 0; i < numToggles; i++) {
        board = toggleCell(board, cells[i][0], cells[i][1]);
    }
    return isSolved(board) ? createBoard(level) : board;
}

export function toggleCell(board, row, col) {
    const newBoard = board.map(r => [...r]);
    const directions = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dr, dc] of directions) {
        const r = row + dr, c = col + dc;
        if (r >= 0 && r < 5 && c >= 0 && c < 5) {
            newBoard[r][c] = !newBoard[r][c];
        }
    }
    return newBoard;
}

export function isSolved(board) {
    return board.every(row => row.every(cell => !cell));
}

export function calculateTimeLimit(level) {
    return 300 + (level - 1) * 60;
}