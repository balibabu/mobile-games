import { BOARD_ROWS, BOARD_COLS, SHAPES, PIECES } from './constants';

export const checkCollision = (pieceMatrix, offsetX, offsetY, currentGrid) => {
    for (let r = 0; r < pieceMatrix.length; r++) {
        for (let c = 0; c < pieceMatrix[r].length; c++) {
            if (pieceMatrix[r][c]) {
                const targetX = offsetX + c;
                const targetY = offsetY + r;

                if (targetX < 0 || targetX >= BOARD_COLS) {
                    return true;
                }
                if (targetY >= BOARD_ROWS) {
                    return true;
                }
                if (targetY >= 0 && currentGrid[targetY][targetX]) {
                    return true;
                }
            }
        }
    }
    return false;
};

export const spawnPiece = (nextPieceKey, currentGrid, setNextPieceKey) => {
    const shapeKey = nextPieceKey;
    const newNextKey = PIECES[Math.floor(Math.random() * PIECES.length)];
    setNextPieceKey(newNextKey);

    const piece = SHAPES[shapeKey];
    const startX = Math.floor((BOARD_COLS - piece.matrix[0].length) / 2);
    const startY = piece.matrix.length === 4 ? -2 : -1;

    if (checkCollision(piece.matrix, startX, startY, currentGrid)) {
        return { collision: true };
    }

    return {
        collision: false,
        piece: {
            matrix: piece.matrix,
            color: piece.color,
            x: startX,
            y: startY,
        }
    };
};

export const mergePieceToGrid = (piece, currentGrid) => {
    const newGrid = currentGrid.map((row) => [...row]);
    for (let r = 0; r < piece.matrix.length; r++) {
        for (let c = 0; c < piece.matrix[r].length; c++) {
            if (piece.matrix[r][c]) {
                const targetY = piece.y + r;
                const targetX = piece.x + c;
                if (targetY >= 0 && targetY < BOARD_ROWS && targetX >= 0 && targetX < BOARD_COLS) {
                    newGrid[targetY][targetX] = piece.color;
                }
            }
        }
    }
    return newGrid;
};

export const clearLines = (currentGrid) => {
    let clearedCount = 0;
    const filteredGrid = currentGrid.filter((row) => {
        const isRowFull = row.every((cell) => cell !== null);
        if (isRowFull) {
            clearedCount++;
            return false;
        }
        return true;
    });

    if (clearedCount > 0) {
        const newRows = Array(clearedCount).fill(null).map(() => Array(BOARD_COLS).fill(null));
        return {
            newGrid: [...newRows, ...filteredGrid],
            clearedCount,
        };
    }

    return {
        newGrid: currentGrid,
        clearedCount: 0,
    };
};

export const getScoreAddition = (cleared, lvl) => {
    const lineScores = [0, 100, 300, 500, 800];
    return (lineScores[cleared] || 800) * lvl;
};

export const rotateMatrix = (matrix) => {
    const n = matrix.length;
    let temp = Array(n).fill(null).map(() => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            temp[c][n - 1 - r] = matrix[r][c];
        }
    }
    return temp;
};
