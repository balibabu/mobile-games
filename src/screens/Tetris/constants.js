import { useEffect, useRef } from 'react';
import { Dimensions } from 'react-native';

// Abramov's useInterval hook to prevent stale closures and handle game loop smoothly
export function useInterval(callback, delay) {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay !== null) {
            const id = setInterval(() => savedCallback.current(), delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const BOARD_ROWS = 20;
export const BOARD_COLS = 10;
export const BOARD_WIDTH_PCT = 47;
export const BOARD_HEIGHT_PCT = 50;
export const CELL_WIDTH_PCT = (100 / BOARD_COLS);
export const CELL_HEIGHT_PCT = (100 / BOARD_ROWS);

export const SHAPES = {
    I: {
        matrix: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        color: '#06b6d4', // Cyan (modern)
    },
    O: {
        matrix: [
            [1, 1],
            [1, 1],
        ],
        color: '#eab308', // Yellow (modern)
    },
    T: {
        matrix: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: '#a855f7', // Purple (modern)
    },
    S: {
        matrix: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ],
        color: '#22c55e', // Green (modern)
    },
    Z: {
        matrix: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ],
        color: '#ef4444', // Red (modern)
    },
    J: {
        matrix: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: '#3b82f6', // Blue (modern)
    },
    L: {
        matrix: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: '#f97316', // Orange (modern)
    },
};

export const PIECES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
