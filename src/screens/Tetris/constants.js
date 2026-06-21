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

const { height: screenHeight } = Dimensions.get('window');

// Responsive Board Sizing
export const BOARD_ROWS = 20;
export const BOARD_COLS = 10;
const RAW_BOARD_HEIGHT = screenHeight * 0.5;
export const CELL_SIZE = Math.floor(RAW_BOARD_HEIGHT / BOARD_ROWS);
export const BOARD_WIDTH = (CELL_SIZE * BOARD_COLS) + 8;
export const BOARD_HEIGHT = (CELL_SIZE * BOARD_ROWS) + 8;

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
