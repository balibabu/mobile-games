import { useState, useCallback, useRef, useEffect } from 'react';
import {
    getInitialState,
    makeMove,
    isGameOver,
    finalizeGame,
    getWinner,
    findBestMove,
    getValidMoves,
    isPlayerPit,
    isBotPit,
} from './gameLogic';
import { computeSowSteps } from './useAnimatedMove';
import { TIMING } from './constants';

export default function useBantumiGame() {
    const [pits, setPits] = useState(getInitialState());
    const [isBotTurn, setIsBotTurn] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [animating, setAnimating] = useState(false);
    const [highlightPit, setHighlightPit] = useState(-1);
    const [gameMode, setGameMode] = useState('bot');
    const [lastLoser, setLastLoser] = useState(null);
    const timeoutsRef = useRef([]);

    const clearTimeouts = useCallback(() => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
    }, []);

    const addTimeout = useCallback((fn, delay) => {
        const t = setTimeout(fn, delay);
        timeoutsRef.current.push(t);
        return t;
    }, []);

    useEffect(() => {
        return () => clearTimeouts();
    }, [clearTimeouts]);

    const humanMode = gameMode === 'human';

    const resetGame = useCallback(() => {
        clearTimeouts();
        setPits(getInitialState());
        setGameOver(false);
        setWinner(null);
        setAnimating(false);
        setHighlightPit(-1);
        if (lastLoser === 'Bot') {
            setIsBotTurn(true);
        } else {
            setIsBotTurn(false);
        }
    }, [clearTimeouts, lastLoser]);

    const toggleGameMode = useCallback((mode) => {
        setGameMode(mode);
        setLastLoser(null);
        clearTimeouts();
        setPits(getInitialState());
        setIsBotTurn(false);
        setGameOver(false);
        setWinner(null);
        setAnimating(false);
        setHighlightPit(-1);
    }, [clearTimeouts]);

    const canPressPit = useCallback(
        (pitIndex, currentPits) => {
            if (gameOver || animating) return false;
            if (humanMode) {
                if (isBotTurn) {
                    if (!isBotPit(pitIndex)) return false;
                } else {
                    if (!isPlayerPit(pitIndex)) return false;
                }
            } else {
                if (isBotTurn) return false;
                if (!isPlayerPit(pitIndex)) return false;
            }
            if (currentPits[pitIndex] === 0) return false;
            return true;
        },
        [isBotTurn, gameOver, animating, humanMode],
    );

    const executeAnimatedMove = useCallback(
        (startingPits, pitIndex, isBot) => {
            const { newPits, extraTurn } = makeMove(startingPits, pitIndex);
            const sowSteps = computeSowSteps(startingPits, pitIndex);
            setAnimating(true);

            sowSteps.forEach((step, idx) => {
                addTimeout(() => {
                    setPits(step.pits);
                    setHighlightPit(step.highlight);
                }, idx * TIMING.sowStepDelay);
            });

            const afterSowDelay = sowSteps.length * TIMING.sowStepDelay + TIMING.afterSowBuffer;

            addTimeout(() => {
                setHighlightPit(-1);
                setPits(newPits);

                if (isGameOver(newPits)) {
                    const finalSteps = [];
                    const finalWorking = [...newPits];

                    for (let i = 0; i < 6; i++) {
                        if (finalWorking[i] > 0) {
                            finalWorking[6] += finalWorking[i];
                            finalWorking[i] = 0;
                            finalSteps.push({ pits: [...finalWorking], highlight: i });
                        }
                    }

                    for (let i = 7; i < 13; i++) {
                        if (finalWorking[i] > 0) {
                            finalWorking[13] += finalWorking[i];
                            finalWorking[i] = 0;
                            finalSteps.push({ pits: [...finalWorking], highlight: i });
                        }
                    }

                    const finishGame = () => {
                        setHighlightPit(-1);
                        const resolved = finalizeGame(newPits);
                        setPits(resolved);
                        setGameOver(true);
                        const result = getWinner(resolved);
                        setWinner(result);
                        setAnimating(false);
                        setLastLoser(result === 'Player' ? 'Bot' : result === 'Bot' ? 'Player' : null);
                    };

                    if (finalSteps.length > 0) {
                        finalSteps.forEach((step, idx) => {
                            addTimeout(() => {
                                setPits(step.pits);
                                setHighlightPit(step.highlight);
                            }, idx * TIMING.finalSweepDelay);
                        });

                        const finalSweepDelay = finalSteps.length * TIMING.finalSweepDelay + TIMING.finalSweepBuffer;
                        addTimeout(finishGame, finalSweepDelay);
                    } else {
                        finishGame();
                    }
                    return;
                }

                setAnimating(false);

                if (extraTurn) {
                    const moves = getValidMoves(newPits, isBot);
                    if (moves.length === 0) {
                        setIsBotTurn(!isBot);
                    }
                } else {
                    setIsBotTurn(!isBot);
                }
            }, afterSowDelay);
        },
        [addTimeout],
    );

    const handlePitPress = useCallback(
        (pitIndex) => {
            if (!canPressPit(pitIndex, pits)) return;
            executeAnimatedMove([...pits], pitIndex, isBotTurn);
        },
        [canPressPit, pits, isBotTurn, executeAnimatedMove],
    );

    useEffect(() => {
        if (!humanMode && isBotTurn && !gameOver && !animating) {
            const timer = setTimeout(() => {
                const move = findBestMove(pits);
                if (move !== null && move !== undefined) {
                    executeAnimatedMove([...pits], move, true);
                }
            }, TIMING.botMoveDelay);
            return () => clearTimeout(timer);
        }
    }, [isBotTurn, gameOver, animating, pits, executeAnimatedMove, humanMode]);

    return {
        pits,
        isBotTurn,
        gameOver,
        winner,
        animating,
        highlightPit,
        gameMode,
        humanMode,
        resetGame,
        toggleGameMode,
        handlePitPress,
    };
}
