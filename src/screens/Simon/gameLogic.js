export const COLORS = ['red', 'green', 'blue', 'yellow'];

export const COLOR_MAP = {
    red: {
        normal: '#dc2626',
        active: '#f87171',
        border: '#991b1b',
    },
    green: {
        normal: '#16a34a',
        active: '#4ade80',
        border: '#166534',
    },
    blue: {
        normal: '#2563eb',
        active: '#60a5fa',
        border: '#1e3a8a',
    },
    yellow: {
        normal: '#ca8a04',
        active: '#facc15',
        border: '#854d0e',
    },
};

export const generateNextColor = () => {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
};

export const extendSequence = (sequence) => {
    return [...sequence, generateNextColor()];
};
