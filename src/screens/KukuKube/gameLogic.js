// src/screens/KukuKube/gameLogic.js
// Pure logic for the Kuku Kube ("find the odd-colored tile") game.
//
// Gameplay: a grid fills with one color except for a single tile that is a
// slightly different shade. The player must tap the odd tile before a
// per-round countdown expires. Each correct pick grows the grid and shrinks
// the color difference, making the odd tile progressively harder to spot.
//
// All functions are pure and never mutate their inputs.

// The grid grows one step per level, capped so it stays scannable.
export const MIN_SIZE = 2; // 2x2 to start
export const MAX_SIZE = 10; // 10x10 cap

// How many lightness-percent the odd tile differs from the base by.
// Starts obvious, narrows as levels rise, then freezes from level 10 onward
// (it stops getting harder beyond that point).
export const colorDeltaFor = (level) => {
    const start = 20;
    const step = 1.5;
    const cap = 10;
    const effectiveLevel = Math.min(level, cap);
    return start - (effectiveLevel - 1) * step;
};

// Per-round countdown (seconds). Fixed for every level.
export const timeFor = () => 20;

export const gridSizeFor = (level) => Math.min(MIN_SIZE + level - 1, MAX_SIZE);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// h,s,l (h: 0-360, s: 0-100, l: 0-100) -> #rrggbb
const hslToHex = (h, s, l) => {
    const sat = s / 100;
    const light = l / 100;
    const k = (n) => (n + h / 30) % 12;
    const a = sat * Math.min(light, 1 - light);
    const f = (n) => {
        const color = light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

// Build a round for the given level.
// Returns { size, oddIndex, baseColor, oddColor, time }.
export const generateRound = (level) => {
    const size = gridSizeFor(level);
    const total = size * size;
    const oddIndex = Math.floor(Math.random() * total);

    // Random pleasant base color: varied hue, solid saturation, mid lightness
    // kept away from the clamp edges so the delta is always fully visible.
    const hue = Math.floor(Math.random() * 360);
    const sat = 55 + Math.floor(Math.random() * 25); // 55-80
    const light = 48 + Math.floor(Math.random() * 12); // 48-60

    const delta = colorDeltaFor(level);
    const direction = Math.random() < 0.5 ? -1 : 1;
    const oddLight = clamp(light + direction * delta, 8, 90);

    return {
        size,
        oddIndex,
        baseColor: hslToHex(hue, sat, light),
        oddColor: hslToHex(hue, sat, oddLight),
        time: timeFor(level),
    };
};
