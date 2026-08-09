// src/screens/MemoryGrid/gameLogic.js
// Pure logic for the Memory Grid game.
//
// Gameplay: a pattern of cells lights up on the grid for a few seconds,
// then the player must tap the same cells to reproduce it. Each round the
// pattern grows, ramping the difficulty.
//
// All functions are pure and never mutate their inputs.

export const SIZE = 5; // 5x5 = 25 cells
export const TOTAL_CELLS = SIZE * SIZE;

// How long (ms) the pattern stays visible for a given level.
// Starts generous, gets a little faster as the grid fills up.
export const showDurationFor = (level) => {
    const base = 2200;
    const perTile = 600;
    return base + level * perTile;
};

// Encode (row, col) as a single stable id 0..TOTAL_CELLS-1.
export const cellId = (row, col) => row * SIZE + col;
export const idToCell = (id) => ({ row: Math.floor(id / SIZE), col: id % SIZE });

// Build a random pattern of `count` unique cells for a level.
// Returns a Set of cell ids.
export const generatePattern = (count) => {
    const all = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
    // Fisher–Yates shuffle (we own this array).
    for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
    }
    return new Set(all.slice(0, count));
};

// Does the player's current set of tapped cells exactly match the pattern?
export const matchesPattern = (tappedIds, patternIds) => {
    if (tappedIds.size !== patternIds.size) return false;
    for (const id of tappedIds) {
        if (!patternIds.has(id)) return false;
    }
    return true;
};
