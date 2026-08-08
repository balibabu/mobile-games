// src/screens/SlidePuzzle/gameLogic.js
// Pure logic for the classic 15-puzzle (n x n grid, one empty slot).
// All functions are pure and never mutate their inputs.

export const SIZE = 4;
export const EMPTY = 0;

// The "solved" board: tiles 1..N in order, blank in the bottom-right.
export const createSolvedBoard = () => {
    const board = [];
    for (let r = 0; r < SIZE; r++) {
        const row = [];
        for (let c = 0; c < SIZE; c++) {
            const index = r * SIZE + c;
            row.push(index === SIZE * SIZE - 1 ? EMPTY : index + 1);
        }
        board.push(row);
    }
    return board;
};

export const cloneBoard = (board) => board.map((row) => [...row]);

// Find the {row, col} of the empty slot.
export const findEmpty = (board) => {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === EMPTY) return { row: r, col: c };
        }
    }
    return { row: -1, col: -1 };
};

// Can the tile at (row, col) slide into the empty slot?
export const canMove = (board, row, col) => {
    const { row: er, col: ec } = findEmpty(board);
    return (
        (Math.abs(er - row) === 1 && ec === col) || (Math.abs(ec - col) === 1 && er === row)
    );
};

// Which tiles are currently adjacent to the blank (i.e. movable)?
export const getMovableNeighbors = (board) => {
    const { row, col } = findEmpty(board);
    const neighbors = [];
    if (row > 0) neighbors.push({ row: row - 1, col });
    if (row < SIZE - 1) neighbors.push({ row: row + 1, col });
    if (col > 0) neighbors.push({ row, col: col - 1 });
    if (col < SIZE - 1) neighbors.push({ row, col: col + 1 });
    return neighbors;
};

// Slide the tile at (row, col) into the empty slot. Returns a NEW board.
// If the move is illegal, returns the board unchanged.
export const moveTile = (board, row, col) => {
    if (!canMove(board, row, col)) return board;
    const next = cloneBoard(board);
    const { row: er, col: ec } = findEmpty(board);
    next[er][ec] = next[row][col];
    next[row][col] = EMPTY;
    return next;
};

// Move a tile by a direction relative to the blank (the blank effectively
// moves the opposite way). Used for swipe controls.
//   UP    -> the tile below the blank slides up
//   DOWN  -> the tile above the blank slides down
//   LEFT  -> the tile to the right of the blank slides left
//   RIGHT -> the tile to the left of the blank slides right
export const DIRECTIONS = {
    UP: { dr: 1, dc: 0 },
    DOWN: { dr: -1, dc: 0 },
    LEFT: { dr: 0, dc: 1 },
    RIGHT: { dr: 0, dc: -1 },
};

export const moveByDirection = (board, direction) => {
    const { row, col } = findEmpty(board);
    const { dr, dc } = direction;
    const targetRow = row + dr;
    const targetCol = col + dc;
    if (targetRow < 0 || targetRow >= SIZE || targetCol < 0 || targetCol >= SIZE) {
        return { board, moved: false };
    }
    return { board: moveTile(board, targetRow, targetCol), moved: true };
};

// Is the board in the solved arrangement?
export const isSolved = (board) => {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const expected = r * SIZE + c + 1;
            if (r === SIZE - 1 && c === SIZE - 1) {
                if (board[r][c] !== EMPTY) return false;
            } else if (board[r][c] !== expected) {
                return false;
            }
        }
    }
    return true;
};

// Produce a shuffled board that is guaranteed solvable.
// Starting from the solved state, perform many random legal moves so the
// puzzle can never reach an unsolvable parity.
export const shuffleBoard = (steps = 200) => {
    let board = createSolvedBoard();
    let lastMoved = null; // avoid immediately undoing the previous move
    for (let i = 0; i < steps; i++) {
        const neighbors = getMovableNeighbors(board).filter((n) => {
            if (!lastMoved) return true;
            return !(n.row === lastMoved.row && n.col === lastMoved.col);
        });
        const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
        board = moveTile(board, pick.row, pick.col);
        lastMoved = findEmpty(board);
    }
    // Extremely unlikely, but never hand back a pre-solved board.
    if (isSolved(board)) return shuffleBoard(steps);
    return board;
};
