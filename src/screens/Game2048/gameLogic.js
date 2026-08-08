// src/screens/Game2048/gameLogic.js
// Pure logic for the 2048 board. The board is a SIZE x SIZE grid where 0 = empty.

export const SIZE = 4;
export const WIN_VALUE = 2048;

export const DIRECTIONS = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
};

export const createEmptyBoard = () =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

export const cloneBoard = (board) => board.map((row) => [...row]);

export const boardsEqual = (a, b) => {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (a[r][c] !== b[r][c]) return false;
        }
    }
    return true;
};

export const getEmptyCells = (board) => {
    const cells = [];
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 0) cells.push([r, c]);
        }
    }
    return cells;
};

/**
 * Spawn a single tile (2 with 90% chance, 4 with 10% chance) on a random empty cell.
 * Returns the new board (does not mutate the input).
 */
export const spawnTile = (board) => {
    const empties = getEmptyCells(board);
    if (empties.length === 0) return board;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    const next = cloneBoard(board);
    next[r][c] = value;
    return next;
};

/**
 * Slide and merge a single row to the left.
 * Returns { row, gained }.
 */
const slideRow = (row) => {
    const tiles = row.filter((v) => v !== 0);
    let gained = 0;
    for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] === tiles[i + 1]) {
            tiles[i] *= 2;
            gained += tiles[i];
            tiles.splice(i + 1, 1);
        }
    }
    while (tiles.length < SIZE) tiles.push(0);
    return { row: tiles, gained };
};

const moveLeft = (board) => {
    let gained = 0;
    const next = board.map((row) => {
        const result = slideRow(row);
        gained += result.gained;
        return result.row;
    });
    return { board: next, gained };
};

const transpose = (board) => {
    const next = createEmptyBoard();
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            next[c][r] = board[r][c];
        }
    }
    return next;
};

const reverseRows = (board) => board.map((row) => [...row].reverse());

/**
 * Apply a move in the given direction.
 * Returns { board, moved, gained }. The input board is never mutated.
 */
export const move = (board, direction) => {
    let working = board;

    if (direction === DIRECTIONS.UP) {
        working = transpose(board);
    } else if (direction === DIRECTIONS.DOWN) {
        working = reverseRows(transpose(board));
    } else if (direction === DIRECTIONS.RIGHT) {
        working = reverseRows(board);
    }
    // LEFT needs no transform.

    const result = moveLeft(working);
    let finalBoard = result.board;

    if (direction === DIRECTIONS.UP) {
        finalBoard = transpose(finalBoard);
    } else if (direction === DIRECTIONS.DOWN) {
        finalBoard = transpose(reverseRows(finalBoard));
    } else if (direction === DIRECTIONS.RIGHT) {
        finalBoard = reverseRows(finalBoard);
    }

    return {
        board: finalBoard,
        moved: !boardsEqual(board, finalBoard),
        gained: result.gained,
    };
};

export const hasWon = (board) =>
    board.some((row) => row.some((v) => v >= WIN_VALUE));

/**
 * Whether any move is still possible (empty cells exist or a merge is available).
 */
export const canMove = (board) => {
    if (getEmptyCells(board).length > 0) return true;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const v = board[r][c];
            if (c < SIZE - 1 && v === board[r][c + 1]) return true;
            if (r < SIZE - 1 && v === board[r + 1][c]) return true;
        }
    }
    return false;
};

/**
 * Create a fresh board with two starting tiles.
 */
export const createInitialBoard = () => {
    let board = createEmptyBoard();
    board = spawnTile(board);
    board = spawnTile(board);
    return board;
};
