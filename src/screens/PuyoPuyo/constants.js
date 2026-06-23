import { useEffect, useRef } from 'react';
import { Dimensions } from 'react-native';

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

export const BOARD_ROWS = 12;
export const BOARD_COLS = 6;
const RAW_BOARD_HEIGHT = screenHeight * 0.5;
export const CELL_SIZE = Math.floor(RAW_BOARD_HEIGHT / BOARD_ROWS);
export const BOARD_WIDTH = CELL_SIZE * BOARD_COLS + 8;
export const BOARD_HEIGHT = CELL_SIZE * BOARD_ROWS + 8;
export const MIN_CHAIN = 4;

export const PUYO_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'];

export const PUYO_KEYS = ['R', 'G', 'B', 'Y', 'P'];

export const COLOR_MAP = {
    R: '#ef4444',
    G: '#22c55e',
    B: '#3b82f6',
    Y: '#eab308',
    P: '#a855f7',
};

export function getRandomPuyoKey() {
    return PUYO_KEYS[Math.floor(Math.random() * PUYO_KEYS.length)];
}

export function getRandomPair() {
    return { top: getRandomPuyoKey(), bottom: getRandomPuyoKey() };
}

export function getAvailableColors(level) {
    if (level >= 6) return PUYO_KEYS;
    if (level >= 4) return PUYO_KEYS.slice(0, 4);
    if (level >= 2) return PUYO_KEYS.slice(0, 3);
    return PUYO_KEYS.slice(0, 2);
}

export function getRandomPairForLevel(level) {
    const keys = getAvailableColors(level);
    const pick = () => keys[Math.floor(Math.random() * keys.length)];
    return { top: pick(), bottom: pick() };
}
