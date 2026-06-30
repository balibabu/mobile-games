import { PITS_COUNT, isPlayerPit } from './gameLogic';

export function computeSowSteps(pits, pitIndex) {
    const steps = [];
    const working = [...pits];
    let stones = working[pitIndex];
    working[pitIndex] = 0;
    steps.push({ pits: [...working], highlight: pitIndex });

    const playerMoved = isPlayerPit(pitIndex);
    const opponentStore = playerMoved ? 13 : 6;
    let current = pitIndex;

    while (stones > 0) {
        current = (current + 1) % PITS_COUNT;
        if (current === opponentStore) continue;
        working[current] += 1;
        steps.push({ pits: [...working], highlight: current });
        stones -= 1;
    }

    return steps;
}
