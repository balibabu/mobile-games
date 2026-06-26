// src/screens/Simon/gameLogic.js

export const COLORS = ['red', 'green', 'blue', 'yellow'];

export const COLOR_MAP = {
    red: { bg: '#ef4444', active: '#fca5a5' },
    green: { bg: '#10b981', active: '#6ee7b7' },
    blue: { bg: '#3b82f6', active: '#93c5fd' },
    yellow: { bg: '#f59e0b', active: '#fde68a' },
};

export const extendSequence = (prevSequence) => {
    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    return [...prevSequence, nextColor];
};
