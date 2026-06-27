export const DIFFICULTY = {
    BEGINNER: { rows: 8, cols: 8, mines: 10 },
    INTERMEDIATE: { rows: 12, cols: 9, mines: 22 },
    EXPERT: { rows: 16, cols: 10, mines: 40 },
};

export function createBoard(rows, cols, mineCount) {
    const board = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push({
                row: r,
                col: c,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0,
            });
        }
        board.push(row);
    }
    return board;
}

export function placeMines(board, mineCount, safeRow, safeCol) {
    const rows = board.length;
    const cols = board[0].length;
    let placed = 0;

    while (placed < mineCount) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);

        if (!board[r][c].isMine && !(r === safeRow && c === safeCol)) {
            board[r][c].isMine = true;
            placed++;
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!board[r][c].isMine) {
                board[r][c].neighborMines = countNeighborMines(board, r, c);
            }
        }
    }

    return board;
}

function countNeighborMines(board, row, col) {
    let count = 0;
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
                if (board[r][c].isMine) count++;
            }
        }
    }
    return count;
}

export function revealCell(board, row, col) {
    const cell = board[row][col];
    if (cell.isRevealed || cell.isFlagged) return board;

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    const queue = [{ row, col }];
    const visited = new Set([`${row},${col}`]);

    while (queue.length > 0) {
        const { row: r, col: c } = queue.shift();
        const current = newBoard[r][c];

        if (current.isFlagged) continue;
        current.isRevealed = true;

        if (current.neighborMines === 0 && !current.isMine) {
            for (let nr = r - 1; nr <= r + 1; nr++) {
                for (let nc = c - 1; nc <= c + 1; nc++) {
                    if (nr >= 0 && nr < newBoard.length && nc >= 0 && nc < newBoard[0].length) {
                        const key = `${nr},${nc}`;
                        if (!visited.has(key) && !newBoard[nr][nc].isRevealed) {
                            visited.add(key);
                            queue.push({ row: nr, col: nc });
                        }
                    }
                }
            }
        }
    }

    return newBoard;
}

export function toggleFlag(board, row, col) {
    const cell = board[row][col];
    if (cell.isRevealed) return board;

    return board.map(r =>
        r.map(c =>
            c.row === row && c.col === col ? { ...c, isFlagged: !c.isFlagged } : c
        )
    );
}

export function checkWin(board) {
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[0].length; c++) {
            const cell = board[r][c];
            if (!cell.isMine && !cell.isRevealed) return false;
        }
    }
    return true;
}

export function revealAllMines(board) {
    return board.map(r =>
        r.map(c => (c.isMine ? { ...c, isRevealed: true } : c))
    );
}
