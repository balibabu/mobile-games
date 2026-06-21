import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Header from '../../components/Header';
import { BOARD_ROWS, BOARD_COLS, SHAPES, PIECES, useInterval } from './constants';
import {
    checkCollision,
    spawnPiece,
    mergePieceToGrid,
    clearLines,
    getScoreAddition,
    rotateMatrix
} from './gameLogic';
import StatsRow from './StatsRow';
import GameBoard from './GameBoard';
import Controls from './Controls';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tetris = () => {
    const [grid, setGrid] = useState(() =>
        Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null))
    );
    const [currentPiece, setCurrentPiece] = useState(null);
    const [nextPieceKey, setNextPieceKey] = useState(() =>
        PIECES[Math.floor(Math.random() * PIECES.length)]
    );
    const [score, setScore] = useState(0);
    const [lines, setLines] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const gameSpeed = isPaused || gameOver || !currentPiece ? null : Math.max(100, 1000 - (level - 1) * 100);

    const spawnNewPiece = (currentGrid) => {
        const result = spawnPiece(nextPieceKey, currentGrid, setNextPieceKey);
        if (result.collision) {
            setGameOver(true);
            return null;
        }
        return result.piece;
    };

    const moveDown = () => {
        if (gameOver || isPaused || !currentPiece) return;
        const nextY = currentPiece.y + 1;
        if (!checkCollision(currentPiece.matrix, currentPiece.x, nextY, grid)) {
            setCurrentPiece((prev) => ({ ...prev, y: nextY }));
        } else {
            const mergedGrid = mergePieceToGrid(currentPiece, grid);
            const { newGrid, clearedCount } = clearLines(mergedGrid);
            let newScore = score, newLines = lines, newLevel = level;
            if (clearedCount > 0) {
                newScore += getScoreAddition(clearedCount, level);
                newLines += clearedCount;
                newLevel = Math.floor(newLines / 10) + 1;
            }
            setGrid(newGrid);
            setScore(newScore);
            setLines(newLines);
            setLevel(newLevel);
            const spawned = spawnNewPiece(newGrid);
            if (spawned) setCurrentPiece(spawned);
        }
    };

    const hardDrop = () => {
        if (gameOver || isPaused || !currentPiece) return;
        let targetY = currentPiece.y;
        while (!checkCollision(currentPiece.matrix, currentPiece.x, targetY + 1, grid)) {
            targetY++;
        }
        const droppedPiece = { ...currentPiece, y: targetY };
        const mergedGrid = mergePieceToGrid(droppedPiece, grid);
        const { newGrid, clearedCount } = clearLines(mergedGrid);
        let newScore = score + (targetY - currentPiece.y) * 2;
        let newLines = lines, newLevel = level;
        if (clearedCount > 0) {
            newScore += getScoreAddition(clearedCount, level);
            newLines += clearedCount;
            newLevel = Math.floor(newLines / 10) + 1;
        }
        setGrid(newGrid);
        setScore(newScore);
        setLines(newLines);
        setLevel(newLevel);
        const spawned = spawnNewPiece(newGrid);
        if (spawned) setCurrentPiece(spawned);
    };

    const moveLeft = () => {
        if (gameOver || isPaused || !currentPiece) return;
        const nextX = currentPiece.x - 1;
        if (!checkCollision(currentPiece.matrix, nextX, currentPiece.y, grid)) {
            setCurrentPiece((prev) => ({ ...prev, x: nextX }));
        }
    };

    const moveRight = () => {
        if (gameOver || isPaused || !currentPiece) return;
        const nextX = currentPiece.x + 1;
        if (!checkCollision(currentPiece.matrix, nextX, currentPiece.y, grid)) {
            setCurrentPiece((prev) => ({ ...prev, x: nextX }));
        }
    };

    const rotate = () => {
        if (gameOver || isPaused || !currentPiece) return;
        const rotated = rotateMatrix(currentPiece.matrix);
        const kicks = [0, -1, 1, -2, 2];
        for (const kick of kicks) {
            const nextX = currentPiece.x + kick;
            if (!checkCollision(rotated, nextX, currentPiece.y, grid)) {
                setCurrentPiece((prev) => ({ ...prev, matrix: rotated, x: nextX }));
                return;
            }
        }
    };

    const resetGame = () => {
        const emptyGrid = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
        setGrid(emptyGrid);
        setScore(0);
        setLines(0);
        setLevel(1);
        setGameOver(false);
        setIsPaused(false);
        const initialKey = PIECES[Math.floor(Math.random() * PIECES.length)];
        const initialPiece = SHAPES[initialKey];
        const startX = Math.floor((BOARD_COLS - initialPiece.matrix[0].length) / 2);
        const startY = initialPiece.matrix.length === 4 ? -2 : -1;
        setCurrentPiece({
            matrix: initialPiece.matrix,
            color: initialPiece.color,
            x: startX,
            y: startY,
        });
        setNextPieceKey(PIECES[Math.floor(Math.random() * PIECES.length)]);
    };

    useInterval(moveDown, gameSpeed);

    useEffect(() => {
        resetGame();
    }, []);

    const displayGrid = grid.map((row) => [...row]);
    if (currentPiece && !gameOver) {
        for (let r = 0; r < currentPiece.matrix.length; r++) {
            for (let c = 0; c < currentPiece.matrix[r].length; c++) {
                if (currentPiece.matrix[r][c]) {
                    const targetY = currentPiece.y + r;
                    const targetX = currentPiece.x + c;
                    if (targetY >= 0 && targetY < BOARD_ROWS && targetX >= 0 && targetX < BOARD_COLS) {
                        displayGrid[targetY][targetX] = currentPiece.color;
                    }
                }
            }
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <Header title="Tetris Arcade" />
            <View style={styles.container}>
                <StatsRow score={score} level={level} lines={lines} nextPieceKey={nextPieceKey} />
                <GameBoard
                    displayGrid={displayGrid}
                    isPaused={isPaused}
                    gameOver={gameOver}
                    score={score}
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
                    moveDown={moveDown}
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

export default Tetris;
