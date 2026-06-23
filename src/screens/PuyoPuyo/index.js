import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { BOARD_COLS, useInterval, getRandomPairForLevel } from './constants';
import {
    createEmptyGrid,
    checkCollision,
    rotatePairCW,
    mergePair,
    applyGravity,
    processChain,
    isGameOver,
} from './gameLogic';
import StatsRow from './StatsRow';
import GameBoard from './GameBoard';
import Controls from './Controls';

const PAIR_START_COL = Math.floor(BOARD_COLS / 2);

const createPair = (pairColors, rotation = 0) => {
    const topRow = 0;
    const bottomRow = 1;
    return {
        top: pairColors.top,
        bottom: pairColors.bottom,
        topRow,
        bottomRow,
        col: PAIR_START_COL,
        rotation,
    };
};

const PuyoPuyo = () => {
    const [grid, setGrid] = useState(() => createEmptyGrid());
    const [currentPair, setCurrentPair] = useState(null);
    const [nextPairColors, setNextPairColors] = useState(() => getRandomPairForLevel(1));
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [totalChains, setTotalChains] = useState(0);
    const [chainPop, setChainPop] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [settling, setSettling] = useState(false);

    const gameSpeed = isPaused || gameOver || !currentPair || settling ? null : Math.max(200, 800 - (level - 1) * 80);

    const settleBoard = useCallback((currentGrid) => {
        const gravResult = applyGravity(currentGrid);
        if (!gravResult.moved) {
            const chainResult = processChain(currentGrid);
            if (chainResult.chainCount > 0) {
                const addedScore = chainResult.chainCount * chainResult.chainCount * 50 + chainResult.totalCleared * 10;
                setScore((prev) => prev + addedScore);
                setChainPop(chainResult.chainCount);
                setTotalChains((prev) => prev + chainResult.chainCount);
                setLevel((prev) => {
                    const newLevel = Math.min(10, prev + 1);
                    return newLevel;
                });
                setTimeout(() => setChainPop(0), 1000);
                setSettling(true);
                setTimeout(() => settleBoard(chainResult.grid), 300);
            } else {
                setSettling(false);
                if (isGameOver(currentGrid)) {
                    setGameOver(true);
                } else {
                    const colors = getRandomPairForLevel(level);
                    setNextPairColors(colors);
                    const newPair = createPair(colors);
                    setCurrentPair(newPair);
                }
            }
            return;
        }
        setSettling(true);
        setGrid(gravResult.grid);
        setTimeout(() => settleBoard(gravResult.grid), 150);
    }, [level]);

    const tryMoveDown = useCallback(() => {
        if (gameOver || isPaused || !currentPair || settling) return;
        const newBottom = currentPair.bottomRow + 1;
        const newTop = currentPair.topRow + 1;

        const topBlocked = checkCollision(grid, newTop, currentPair.col);
        const bottomBlocked = newBottom >= 0 && checkCollision(grid, newBottom, currentPair.col);

        if (!topBlocked && !bottomBlocked) {
            setCurrentPair((prev) => ({
                ...prev,
                topRow: prev.topRow + 1,
                bottomRow: prev.bottomRow + 1,
            }));
        } else {
            const mergedGrid = mergePair(grid, currentPair);
            setGrid(mergedGrid);
            setCurrentPair(null);
            settleBoard(mergedGrid);
        }
    }, [gameOver, isPaused, currentPair, grid, settling, settleBoard]);

    const hardDrop = useCallback(() => {
        if (gameOver || isPaused || !currentPair || settling) return;
        let pair = { ...currentPair };
        while (true) {
            const newBottom = pair.bottomRow + 1;
            const newTop = pair.topRow + 1;
            const topBlocked = checkCollision(grid, newTop, pair.col);
            const bottomBlocked = newBottom >= 0 && checkCollision(grid, newBottom, pair.col);
            if (topBlocked || bottomBlocked) break;
            pair = { ...pair, topRow: newTop, bottomRow: newBottom };
        }
        const mergedGrid = mergePair(grid, pair);
        setGrid(mergedGrid);
        setCurrentPair(null);
        settleBoard(mergedGrid);
    }, [gameOver, isPaused, currentPair, grid, settling, settleBoard]);

    const moveLeft = useCallback(() => {
        if (gameOver || isPaused || !currentPair || settling) return;
        const newCol = currentPair.col - 1;
        if (newCol < 0) return;
        const topBlocked = currentPair.topRow >= 0 && checkCollision(grid, currentPair.topRow, newCol);
        const bottomBlocked = currentPair.bottomRow >= 0 && checkCollision(grid, currentPair.bottomRow, newCol);
        if (!topBlocked && !bottomBlocked) {
            setCurrentPair((prev) => ({ ...prev, col: newCol }));
        }
    }, [gameOver, isPaused, currentPair, grid, settling]);

    const moveRight = useCallback(() => {
        if (gameOver || isPaused || !currentPair || settling) return;
        const newCol = currentPair.col + 1;
        if (newCol >= BOARD_COLS) return;
        const topBlocked = currentPair.topRow >= 0 && checkCollision(grid, currentPair.topRow, newCol);
        const bottomBlocked = currentPair.bottomRow >= 0 && checkCollision(grid, currentPair.bottomRow, newCol);
        if (!topBlocked && !bottomBlocked) {
            setCurrentPair((prev) => ({ ...prev, col: newCol }));
        }
    }, [gameOver, isPaused, currentPair, grid, settling]);

    const rotate = useCallback(() => {
        if (gameOver || isPaused || !currentPair || settling) return;
        const rotated = rotatePairCW(currentPair, grid);
        setCurrentPair(rotated);
    }, [gameOver, isPaused, currentPair, grid, settling]);

    const resetGame = useCallback(() => {
        const emptyGrid = createEmptyGrid();
        setGrid(emptyGrid);
        setScore(0);
        setLevel(1);
        setTotalChains(0);
        setChainPop(0);
        setGameOver(false);
        setIsPaused(false);
        setSettling(false);
        const colors = getRandomPairForLevel(1);
        const newPair = createPair(colors);
        setCurrentPair(newPair);
        const nextColors = getRandomPairForLevel(1);
        setNextPairColors(nextColors);
    }, []);

    useInterval(tryMoveDown, gameSpeed);

    useEffect(() => {
        resetGame();
    }, []);

    const displayGrid = grid.map((row) => [...row]);
    if (currentPair && !gameOver && !settling) {
        if (currentPair.topRow >= 0 && currentPair.topRow < displayGrid.length) {
            displayGrid[currentPair.topRow][currentPair.col] = currentPair.top;
        }
        if (currentPair.bottomRow >= 0 && currentPair.bottomRow < displayGrid.length) {
            displayGrid[currentPair.bottomRow][currentPair.col] = currentPair.bottom;
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <Header title="Puyo Puyo" />
            <View style={styles.container}>
                <StatsRow score={score} level={level} chains={totalChains} nextPair={nextPairColors} />
                <GameBoard
                    displayGrid={displayGrid}
                    currentPair={currentPair}
                    isPaused={isPaused}
                    gameOver={gameOver}
                    score={score}
                    chainPop={chainPop}
                    togglePause={() => setIsPaused(!isPaused)}
                    resetGame={resetGame}
                />
                <Controls
                    isPaused={isPaused}
                    gameOver={gameOver}
                    togglePause={() => setIsPaused(!isPaused)}
                    resetGame={resetGame}
                    rotate={rotate}
                    moveLeft={moveLeft}
                    moveDown={tryMoveDown}
                    moveRight={moveRight}
                    hardDrop={hardDrop}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#09090b',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        backgroundColor: '#09090b',
    },
});

export default PuyoPuyo;
