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
    const topOk = !checkCollision(grid, pair.topRow, pair.topCol);
    const botOk = !checkCollision(grid, pair.bottomRow, pair.bottomCol);
    return topOk && botOk;
}

export function rotatePairCW(pair, grid) {
    const pivotRow = pair.bottomRow;
    const pivotCol = pair.bottomCol;
    const newRotation = (pair.rotation + 1) % 4;

    let newTopRow, newTopCol;
    switch (newRotation) {
        case 0:
            newTopRow = pivotRow - 1;
            newTopCol = pivotCol;
            break;
        case 1:
            newTopRow = pivotRow;
            newTopCol = pivotCol + 1;
            break;
        case 2:
            newTopRow = pivotRow + 1;
            newTopCol = pivotCol;
            break;
        case 3:
            newTopRow = pivotRow;
            newTopCol = pivotCol - 1;
            break;
    }

    if (
        newTopCol < 0 || newTopCol >= BOARD_COLS ||
        newTopRow < 0 || newTopRow >= BOARD_ROWS ||
        grid[newTopRow][newTopCol] !== null
    ) {
        let kickCol = pivotCol;
        if (newTopCol < 0) kickCol = pivotCol + 1;
        else if (newTopCol >= BOARD_COLS) kickCol = pivotCol - 1;

        if (kickCol !== pivotCol) {
            let kickTopCol = newTopCol + (kickCol - pivotCol);
            if (
                kickCol >= 0 && kickCol < BOARD_COLS &&
                kickTopCol >= 0 && kickTopCol < BOARD_COLS &&
                newTopRow >= 0 && newTopRow < BOARD_ROWS &&
                grid[newTopRow][kickTopCol] === null &&
                grid[pivotRow][kickCol] === null
            ) {
                return {
                    ...pair,
                    rotation: newRotation,
                    topRow: newTopRow,
                    topCol: kickTopCol,
                    bottomRow: pivotRow,
                    bottomCol: kickCol,
                };
            }
        }
        return { ...pair, rotation: pair.rotation };
    }

    return {
        ...pair,
        rotation: newRotation,
        topRow: newTopRow,
        topCol: newTopCol,
        bottomRow: pivotRow,
        bottomCol: pivotCol,
    };
}

export function mergePair(grid, pair) {
    const newGrid = grid.map((row) => [...row]);
    if (pair.topRow >= 0 && pair.topRow < BOARD_ROWS && pair.topCol >= 0 && pair.topCol < BOARD_COLS) {
        newGrid[pair.topRow][pair.topCol] = pair.top;
    }
    if (pair.bottomRow >= 0 && pair.bottomRow < BOARD_ROWS && pair.bottomCol >= 0 && pair.bottomCol < BOARD_COLS) {
        newGrid[pair.bottomRow][pair.bottomCol] = pair.bottom;
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

export function findGroupsAndRemove(grid) {
    const groups = findConnectedGroups(grid);
    if (groups.length === 0) {
        return { grid, chainCount: 0, totalCleared: 0 };
    }
    const totalCleared = groups.reduce((sum, g) => sum + g.length, 0);
    const newGrid = removeGroups(grid, groups);
    return { grid: newGrid, chainCount: 1, totalCleared };
}

export function isGameOver(grid) {
    for (let c = 0; c < BOARD_COLS; c++) {
        if (grid[2][c] !== null) return true;
    }
    return false;
}
