// src/screens/Sudoku/gameLogic.js
// Pure Sudoku logic: board generation, puzzle carving, validation, and conflict detection.
// All functions are pure and never mutate their inputs.

export const SIZE = 9;
export const BOX = 3;

// Fisher–Yates style in-place shuffle for arrays we own.
const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const createEmptyBoard = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

// Does placing `num` at (row, col) break any rule, given the current board?
export const isValidPlacement = (board, row, col, num) => {
    for (let i = 0; i < SIZE; i++) {
        if (board[row][i] === num) return false;
        if (board[i][col] === num) return false;
    }
    const boxRow = Math.floor(row / BOX) * BOX;
    const boxCol = Math.floor(col / BOX) * BOX;
    for (let r = boxRow; r < boxRow + BOX; r++) {
        for (let c = boxCol; c < boxCol + BOX; c++) {
            if (board[r][c] === num) return false;
        }
    }
    return true;
};

// Fill an empty board with a valid randomized solution using backtracking.
const fillBoard = (board) => {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] === 0) {
                const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (const num of nums) {
                    if (isValidPlacement(board, row, col, num)) {
                        board[row][col] = num;
                        if (fillBoard(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
};

export const generateSolution = () => {
    const board = createEmptyBoard();
    fillBoard(board);
    return board;
};

// Count how many solutions exist for the board (capped at 2 for performance).
// Used to confirm a carved puzzle still has a unique solution.
const countSolutions = (board, limit = 2) => {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] === 0) {
                let count = 0;
                for (let num = 1; num <= SIZE; num++) {
                    if (isValidPlacement(board, row, col, num)) {
                        board[row][col] = num;
                        count += countSolutions(board, limit - count);
                        board[row][col] = 0;
                        if (count >= limit) return count;
                    }
                }
                return count;
            }
        }
    }
    return 1; // board is full and valid
};

// Carve a puzzle out of a solved board, leaving `clues` cells visible.
// Tries to keep the solution unique by verifying the count stays at 1.
const carvePuzzle = (solution, clues) => {
    const puzzle = solution.map((row) => [...row]);
    const positions = shuffle(
        Array.from({ length: SIZE * SIZE }, (_, i) => [Math.floor(i / SIZE), i % SIZE])
    );

    let remaining = SIZE * SIZE;
    for (const [row, col] of positions) {
        if (remaining <= clues) break;
        const backup = puzzle[row][col];
        puzzle[row][col] = 0;

        // Only accept the removal if the puzzle still has a unique solution.
        const testBoard = puzzle.map((r) => [...r]);
        if (countSolutions(testBoard) === 1) {
            remaining--;
        } else {
            puzzle[row][col] = backup;
        }
    }
    return puzzle;
};

// Difficulty -> number of clues left on the board.
const CLUE_COUNTS = {
    easy: 45,
    medium: 38,
    hard: 31,
};

export const DIFFICULTIES = Object.keys(CLUE_COUNTS);

export const createPuzzle = (difficulty = 'medium') => {
    const solution = generateSolution();
    const clues = CLUE_COUNTS[difficulty] || CLUE_COUNTS.medium;
    const puzzle = carvePuzzle(solution, clues);
    return { puzzle, solution };
};

// Build a 9x9 boolean grid marking which cells are part of the original puzzle
// (and therefore fixed / non-editable).
export const buildFixedMask = (puzzle) => puzzle.map((row) => row.map((v) => v !== 0));

// Which cells (other than (row,col) itself) share a value with (row,col)?
export const findConflicts = (board, row, col) => {
    const value = board[row][col];
    if (!value) return [];
    const conflicts = [];
    for (let i = 0; i < SIZE; i++) {
        if (i !== col && board[row][i] === value) conflicts.push([row, i]);
        if (i !== row && board[i][col] === value) conflicts.push([i, col]);
    }
    const boxRow = Math.floor(row / BOX) * BOX;
    const boxCol = Math.floor(col / BOX) * BOX;
    for (let r = boxRow; r < boxRow + BOX; r++) {
        for (let c = boxCol; c < boxCol + BOX; c++) {
            if ((r !== row || c !== col) && board[r][c] === value) {
                conflicts.push([r, c]);
            }
        }
    }
    return conflicts;
};

// Does a value at (row,col) clash with any peers?
export const hasConflict = (board, row, col) => {
    const value = board[row][col];
    if (!value) return false;
    return findConflicts(board, row, col).length > 0;
};

// Is every cell filled?
export const isComplete = (board) =>
    board.every((row) => row.every((cell) => cell !== 0));

// Is the board completely filled with no conflicts anywhere?
export const isSolved = (board) => {
    if (!isComplete(board)) return false;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (hasConflict(board, r, c)) return false;
        }
    }
    return true;
};
