import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { BOARD_COLS, useInterval, getRandomPairForLevel } from './constants';
import {
    createEmptyGrid,
    checkCollision,
    canPlacePair,
    rotatePairCW,
    mergePair,
    applyGravity,
    findGroupsAndRemove,
    isGameOver,
} from './gameLogic';
import StatsPanel from './StatsPanel';
import GameBoard from './GameBoard';
import Controls from './Controls';

const PAIR_START_COL = Math.floor(BOARD_COLS / 2);

const createPair = (pairColors, rotation = 0) => {
    return {
        top: pairColors.top,
        bottom: pairColors.bottom,
        topRow: 0,
        topCol: PAIR_START_COL,
        bottomRow: 1,
        bottomCol: PAIR_START_COL,
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

    const gridRef = useRef(grid);
    gridRef.current = grid;
    const currentPairRef = useRef(currentPair);
    currentPairRef.current = currentPair;
    const levelRef = useRef(level);
    levelRef.current = level;
    const nextPairColorsRef = useRef(nextPairColors);
    nextPairColorsRef.current = nextPairColors;
    const settlingRef = useRef(settling);
    settlingRef.current = settling;

    const gameSpeed = isPaused || gameOver || !currentPair || settling ? null : Math.max(200, 800 - (level - 1) * 20);

    const spawnNewPair = useCallback((currentLevel, currentNextPairColors) => {
        const pairColors = currentNextPairColors;
        const newNextColors = getRandomPairForLevel(currentLevel);
        const newPair = createPair(pairColors);

        setGrid((prevGrid) => {
            if (canPlacePair(prevGrid, newPair)) {
                setNextPairColors(newNextColors);
                setCurrentPair(newPair);
                setSettling(false);
            } else {
                const mergedGrid = mergePair(prevGrid, newPair);
                setGrid(mergedGrid);
                setGameOver(true);
                setCurrentPair(null);
                setSettling(false);
            }
            return prevGrid;
        });
    }, []);

    const settleBoard = useCallback((currentGrid, chainCount = 0, totalCleared = 0) => {
        const gravResult = applyGravity(currentGrid);
        if (gravResult.moved) {
            setSettling(true);
            setGrid(gravResult.grid);
            setTimeout(() => settleBoard(gravResult.grid, chainCount, totalCleared), 150);
            return;
        }

        const clearResult = findGroupsAndRemove(currentGrid);
        if (clearResult.chainCount > 0) {
            const newChainCount = chainCount + 1;
            const newTotalCleared = totalCleared + clearResult.totalCleared;
            const addedScore = newChainCount * newChainCount * 50 + newTotalCleared * 10;
            setScore((prev) => prev + addedScore);
            setChainPop(newChainCount);
            setTotalChains((prev) => prev + 1);
            setLevel((prev) => Math.min(10, prev + 1));
            setTimeout(() => setChainPop(0), 1000);
            setSettling(true);
            setGrid(clearResult.grid);
            setTimeout(() => settleBoard(clearResult.grid, newChainCount, newTotalCleared), 300);
            return;
        }

        if (chainCount > 0) {
            setGrid(currentGrid);
        }

        if (isGameOver(currentGrid)) {
            setGameOver(true);
            setSettling(false);
            setCurrentPair(null);
            return;
        }

        const lv = levelRef.current;
        const npc = nextPairColorsRef.current;
        spawnNewPair(lv, npc);
    }, [spawnNewPair]);

    const tryMoveDown = useCallback(() => {
        if (gameOver || isPaused || !currentPair || settling) return;

        let newTopRow = currentPair.topRow + 1;
        let newTopCol = currentPair.topCol;
        let newBottomRow = currentPair.bottomRow + 1;
        let newBottomCol = currentPair.bottomCol;

        const topBlocked = checkCollision(grid, newTopRow, newTopCol);
        const bottomBlocked = checkCollision(grid, newBottomRow, newBottomCol);

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
            const newTopRow = pair.topRow + 1;
            const newTopCol = pair.topCol;
            const newBottomRow = pair.bottomRow + 1;
            const newBottomCol = pair.bottomCol;

            const topBlocked = checkCollision(grid, newTopRow, newTopCol);
            const bottomBlocked = checkCollision(grid, newBottomRow, newBottomCol);
            if (topBlocked || bottomBlocked) break;
            pair = { ...pair, topRow: newTopRow, bottomRow: newBottomRow };
        }
        const mergedGrid = mergePair(grid, pair);
        setGrid(mergedGrid);
        setCurrentPair(null);
        settleBoard(mergedGrid);
    }, [gameOver, isPaused, currentPair, grid, settling, settleBoard]);

    const moveLeft = useCallback(() => {
        if (gameOver || isPaused || !currentPair || settling) return;
        const newTopCol = currentPair.topCol - 1;
        const newBottomCol = currentPair.bottomCol - 1;
        const topBlocked = currentPair.topRow >= 0 && checkCollision(grid, currentPair.topRow, newTopCol);
        const bottomBlocked = currentPair.bottomRow >= 0 && checkCollision(grid, currentPair.bottomRow, newBottomCol);
        if (!topBlocked && !bottomBlocked) {
            setCurrentPair((prev) => ({ ...prev, topCol: prev.topCol - 1, bottomCol: prev.bottomCol - 1 }));
        }
    }, [gameOver, isPaused, currentPair, grid, settling]);

    const moveRight = useCallback(() => {
        if (gameOver || isPaused || !currentPair || settling) return;
        const newTopCol = currentPair.topCol + 1;
        const newBottomCol = currentPair.bottomCol + 1;
        const topBlocked = currentPair.topRow >= 0 && checkCollision(grid, currentPair.topRow, newTopCol);
        const bottomBlocked = currentPair.bottomRow >= 0 && checkCollision(grid, currentPair.bottomRow, newBottomCol);
        if (!topBlocked && !bottomBlocked) {
            setCurrentPair((prev) => ({ ...prev, topCol: prev.topCol + 1, bottomCol: prev.bottomCol + 1 }));
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
        const initialNextColors = getRandomPairForLevel(1);
        const initialPairColors = getRandomPairForLevel(1);
        setNextPairColors(initialNextColors);
        const newPair = createPair(initialPairColors);
        setCurrentPair(newPair);
    }, []);

    useInterval(tryMoveDown, gameSpeed);

    useEffect(() => {
        resetGame();
    }, []);

    const displayGrid = grid.map((row) => [...row]);
    if (currentPair && !gameOver) {
        if (currentPair.topRow >= 0 && currentPair.topRow < displayGrid.length &&
            currentPair.topCol >= 0 && currentPair.topCol < BOARD_COLS) {
            displayGrid[currentPair.topRow][currentPair.topCol] = currentPair.top;
        }
        if (currentPair.bottomRow >= 0 && currentPair.bottomRow < displayGrid.length &&
            currentPair.bottomCol >= 0 && currentPair.bottomCol < BOARD_COLS) {
            displayGrid[currentPair.bottomRow][currentPair.bottomCol] = currentPair.bottom;
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <Header title="Puyo Puyo" pause={{ isPaused, setIsPaused }} />
            <View style={styles.gameArea}>
                <GameBoard
                    displayGrid={displayGrid}
                    isPaused={isPaused}
                    gameOver={gameOver}
                    score={score}
                    togglePause={() => setIsPaused(!isPaused)}
                    resetGame={resetGame}
                />
                <StatsPanel score={score} level={level} chains={totalChains} nextPair={nextPairColors} />
            </View>
            <Controls
                rotate={rotate}
                moveLeft={moveLeft}
                moveDown={tryMoveDown}
                moveRight={moveRight}
                hardDrop={hardDrop}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#09090b',
    },
    gameArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '2%',
        paddingVertical: '1%',
        backgroundColor: '#09090b',
    },
});

export default PuyoPuyo;
