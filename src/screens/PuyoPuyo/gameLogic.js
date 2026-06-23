import { BOARD_ROWS, BOARD_COLS, MIN_CHAIN } from './constants';

export function createEmptyGrid() {
    return Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
}

export function checkCollision(grid, row, col) {
    return (
        row < 0 ||
        row >= BOARD_ROWS ||
        col < 0 ||
        col >= BOARD_COLS ||
        grid[row][col] !== null
    );
}

export function canPlacePair(grid, pair) {
    const topOk = !checkCollision(grid, pair.topRow, pair.col);
    const botOk = !checkCollision(grid, pair.bottomRow, pair.col);
    return topOk && botOk;
}

export function rotatePairCW(pair, grid) {
    const { top, bottom, topRow, bottomRow, col } = pair;
    const newRotation = (pair.rotation + 1) % 4;
    let newTopRow = topRow;
    let newBottomRow = bottomRow;
    let newCol = col;

    switch (newRotation) {
        case 0:
            newTopRow = pair.bottomRow - 1;
            newBottomRow = pair.bottomRow;
            break;
        case 1:
            newTopRow = pair.bottomRow;
            newBottomRow = pair.bottomRow;
            newCol = col + 1;
            break;
        case 2:
            newTopRow = pair.bottomRow;
            newBottomRow = pair.bottomRow + 1;
            break;
        case 3:
            newTopRow = pair.bottomRow;
            newBottomRow = pair.bottomRow;
            newCol = col - 1;
            break;
    }

    if (
        newCol < 0 || newCol >= BOARD_COLS ||
        newTopRow < 0 || newTopRow >= BOARD_ROWS ||
        newBottomRow < 0 || newBottomRow >= BOARD_ROWS ||
        (newTopRow >= 0 && grid[newTopRow][newCol] !== null) ||
        (newBottomRow >= 0 && grid[newBottomRow][newCol] !== null)
    ) {
        return { ...pair, rotation: pair.rotation };
    }

    return {
        ...pair,
        rotation: newRotation,
        topRow: newTopRow,
        bottomRow: newBottomRow,
        col: newCol,
    };
}

export function mergePair(grid, pair) {
    const newGrid = grid.map((row) => [...row]);
    if (pair.topRow >= 0 && pair.topRow < BOARD_ROWS) {
        newGrid[pair.topRow][pair.col] = pair.top;
    }
    if (pair.bottomRow >= 0 && pair.bottomRow < BOARD_ROWS) {
        newGrid[pair.bottomRow][pair.col] = pair.bottom;
    }
    return newGrid;
}

export function applyGravity(grid) {
    const newGrid = grid.map((row) => [...row]);
    let moved = false;
    for (let r = BOARD_ROWS - 2; r >= 0; r--) {
        for (let c = 0; c < BOARD_COLS; c++) {
            if (newGrid[r][c] !== null && newGrid[r + 1][c] === null) {
                let fallRow = r;
                while (fallRow + 1 < BOARD_ROWS && newGrid[fallRow + 1][c] === null) {
                    newGrid[fallRow + 1][c] = newGrid[fallRow][c];
                    newGrid[fallRow][c] = null;
                    fallRow++;
                    moved = true;
                }
            }
        }
    }
    return { grid: newGrid, moved };
}

export function findConnectedGroups(grid) {
    const visited = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(false));
    const groups = [];

    const dfs = (r, c, color, group) => {
        if (
            r < 0 || r >= BOARD_ROWS ||
            c < 0 || c >= BOARD_COLS ||
            visited[r][c] ||
            grid[r][c] !== color
        ) return;
        visited[r][c] = true;
        group.push({ r, c });
        dfs(r - 1, c, color, group);
        dfs(r + 1, c, color, group);
        dfs(r, c - 1, color, group);
        dfs(r, c + 1, color, group);
    };

    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            if (grid[r][c] !== null && !visited[r][c]) {
                const group = [];
                dfs(r, c, grid[r][c], group);
                if (group.length >= MIN_CHAIN) {
                    groups.push(group);
                }
            }
        }
    }
    return groups;
}

export function removeGroups(grid, groups) {
    const newGrid = grid.map((row) => [...row]);
    for (const group of groups) {
        for (const { r, c } of group) {
            newGrid[r][c] = null;
        }
    }
    return newGrid;
}

export function processChain(grid) {
    let currentGrid = grid;
    let chainCount = 0;
    let totalCleared = 0;

    while (true) {
        const groups = findConnectedGroups(currentGrid);
        if (groups.length === 0) break;

        totalCleared += groups.reduce((sum, g) => sum + g.length, 0);
        currentGrid = removeGroups(currentGrid, groups);
        chainCount++;

        const result = applyGravity(currentGrid);
        currentGrid = result.grid;
    }

    return { grid: currentGrid, chainCount, totalCleared };
}

export function calculateScore(chainCount, totalCleared) {
    const chainBonus = chainCount * chainCount * 50;
    const puyoBonus = totalCleared * 10;
    return chainBonus + puyoBonus;
}

export function isGameOver(grid) {
    return grid[0].some((cell) => cell !== null) || grid[1].some((cell) => cell !== null);
}
