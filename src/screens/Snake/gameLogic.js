// src/screens/Snake/gameLogic.js
// Pure logic for Snake on a GRID_SIZE x GRID_SIZE board.
// A snake is an array of { x, y } cells where index 0 is the head.

export const GRID_SIZE = 17;

export const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
};

export const isOpposite = (a, b) => a.x === -b.x && a.y === -b.y;

const randomInt = (max) => Math.floor(Math.random() * max);

/**
 * Place food on a random cell not occupied by the snake.
 */
export const spawnFood = (snake) => {
    const occupied = new Set(snake.map((c) => `${c.x},${c.y}`));
    const free = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (!occupied.has(`${x},${y}`)) free.push({ x, y });
        }
    }
    if (free.length === 0) return null;
    return free[randomInt(free.length)];
};

export const createInitialState = () => {
    const mid = Math.floor(GRID_SIZE / 2);
    const snake = [
        { x: mid - 1, y: mid },
        { x: mid - 2, y: mid },
        { x: mid - 3, y: mid },
    ];
    return {
        snake,
        direction: DIRECTIONS.RIGHT,
        food: spawnFood(snake),
        gameOver: false,
        won: false,
    };
};

/**
 * Advance the snake one step. Honors a requestedDirection only if it isn't a
 * 180-degree reversal of the current direction.
 *
 * Returns the new state. The input is never mutated.
 */
export const step = (state, requestedDirection) => {
    if (state.gameOver || state.won) return state;

    const direction = requestedDirection && !isOpposite(requestedDirection, state.direction)
        ? requestedDirection
        : state.direction;

    const head = state.snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    // Wall collision.
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        return { ...state, gameOver: true };
    }

    const willEat = state.food && newHead.x === state.food.x && newHead.y === state.food.y;
    // When not eating, the tail vacates before the collision check.
    const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);

    // Self collision.
    if (bodyToCheck.some((c) => c.x === newHead.x && c.y === newHead.y)) {
        return { ...state, gameOver: true };
    }

    const newSnake = [newHead, ...(willEat ? state.snake : state.snake.slice(0, -1))];

    let food = state.food;
    if (willEat) {
        food = spawnFood(newSnake);
    }

    // Win condition: snake fills the board.
    const won = newSnake.length === GRID_SIZE * GRID_SIZE;

    return {
        ...state,
        snake: newSnake,
        direction,
        food,
        won,
    };
};
