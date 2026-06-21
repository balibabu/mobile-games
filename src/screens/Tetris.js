import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import Header from '../components/Header';

// Abramov's useInterval hook to prevent stale closures and handle game loop smoothly
function useInterval(callback, delay) {
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive Board Sizing
const BOARD_ROWS = 20;
const BOARD_COLS = 10;
const BOARD_HEIGHT = screenHeight * 0.44; // Fits perfectly on all screens
const CELL_SIZE = Math.floor(BOARD_HEIGHT / BOARD_ROWS);
const BOARD_WIDTH = CELL_SIZE * BOARD_COLS;

const SHAPES = {
    I: {
        matrix: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        color: '#00f0f0', // Cyan
    },
    O: {
        matrix: [
            [1, 1],
            [1, 1],
        ],
        color: '#f0f000', // Yellow
    },
    T: {
        matrix: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: '#a000f0', // Purple
    },
    S: {
        matrix: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ],
        color: '#00f000', // Green
    },
    Z: {
        matrix: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ],
        color: '#f00000', // Red
    },
    J: {
        matrix: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: '#0000f0', // Blue
    },
    L: {
        matrix: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: '#f0a000', // Orange
    },
};

const PIECES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

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

    // Dynamic speed based on level
    const gameSpeed = isPaused || gameOver || !currentPiece ? null : Math.max(100, 1000 - (level - 1) * 100);

    const checkCollision = (pieceMatrix, offsetX, offsetY, currentGrid) => {
        for (let r = 0; r < pieceMatrix.length; r++) {
            for (let c = 0; c < pieceMatrix[r].length; c++) {
                if (pieceMatrix[r][c]) {
                    const targetX = offsetX + c;
                    const targetY = offsetY + r;

                    if (targetX < 0 || targetX >= BOARD_COLS) {
                        return true;
                    }
                    if (targetY >= BOARD_ROWS) {
                        return true;
                    }
                    if (targetY >= 0 && currentGrid[targetY][targetX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const spawnPiece = (currentGrid) => {
        const shapeKey = nextPieceKey;
        const newNextKey = PIECES[Math.floor(Math.random() * PIECES.length)];
        setNextPieceKey(newNextKey);

        const piece = SHAPES[shapeKey];
        const startX = Math.floor((BOARD_COLS - piece.matrix[0].length) / 2);
        const startY = piece.matrix.length === 4 ? -2 : -1;

        if (checkCollision(piece.matrix, startX, startY, currentGrid)) {
            setGameOver(true);
            return null;
        }

        return {
            matrix: piece.matrix,
            color: piece.color,
            x: startX,
            y: startY,
        };
    };

    const mergePieceToGrid = (piece, currentGrid) => {
        const newGrid = currentGrid.map((row) => [...row]);
        for (let r = 0; r < piece.matrix.length; r++) {
            for (let c = 0; c < piece.matrix[r].length; c++) {
                if (piece.matrix[r][c]) {
                    const targetY = piece.y + r;
                    const targetX = piece.x + c;
                    if (targetY >= 0 && targetY < BOARD_ROWS && targetX >= 0 && targetX < BOARD_COLS) {
                        newGrid[targetY][targetX] = piece.color;
                    }
                }
            }
        }
        return newGrid;
    };

    const clearLines = (currentGrid) => {
        let clearedCount = 0;
        const filteredGrid = currentGrid.filter((row) => {
            const isRowFull = row.every((cell) => cell !== null);
            if (isRowFull) {
                clearedCount++;
                return false;
            }
            return true;
        });

        if (clearedCount > 0) {
            const newRows = Array(clearedCount).fill(null).map(() => Array(BOARD_COLS).fill(null));
            return {
                newGrid: [...newRows, ...filteredGrid],
                clearedCount,
            };
        }

        return {
            newGrid: currentGrid,
            clearedCount: 0,
        };
    };

    const getScoreAddition = (cleared, lvl) => {
        const lineScores = [0, 100, 300, 500, 800];
        return (lineScores[cleared] || 800) * lvl;
    };

    const moveDown = () => {
        if (gameOver || isPaused || !currentPiece) return;

        const nextY = currentPiece.y + 1;
        if (!checkCollision(currentPiece.matrix, currentPiece.x, nextY, grid)) {
            setCurrentPiece((prev) => ({ ...prev, y: nextY }));
        } else {
            // Collision detected, lock it in
            const mergedGrid = mergePieceToGrid(currentPiece, grid);
            const { newGrid, clearedCount } = clearLines(mergedGrid);

            let newScore = score;
            let newLines = lines;
            let newLevel = level;

            if (clearedCount > 0) {
                newScore += getScoreAddition(clearedCount, level);
                newLines += clearedCount;
                newLevel = Math.floor(newLines / 10) + 1;
            }

            setGrid(newGrid);
            setScore(newScore);
            setLines(newLines);
            setLevel(newLevel);

            const spawned = spawnPiece(newGrid);
            if (spawned) {
                setCurrentPiece(spawned);
            }
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

        // Score bonus for hard dropping
        let newScore = score + (targetY - currentPiece.y) * 2;
        let newLines = lines;
        let newLevel = level;

        if (clearedCount > 0) {
            newScore += getScoreAddition(clearedCount, level);
            newLines += clearedCount;
            newLevel = Math.floor(newLines / 10) + 1;
        }

        setGrid(newGrid);
        setScore(newScore);
        setLines(newLines);
        setLevel(newLevel);

        const spawned = spawnPiece(newGrid);
        if (spawned) {
            setCurrentPiece(spawned);
        }
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

    const rotateMatrix = (matrix) => {
        const n = matrix.length;
        let temp = Array(n).fill(null).map(() => Array(n).fill(0));
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                temp[c][n - 1 - r] = matrix[r][c];
            }
        }
        return temp;
    };

    const rotate = () => {
        if (gameOver || isPaused || !currentPiece) return;
        const rotated = rotateMatrix(currentPiece.matrix);

        // Wall kicks: try offset positions to rotate smoothly near borders
        const kicks = [0, -1, 1, -2, 2];
        for (const kick of kicks) {
            const nextX = currentPiece.x + kick;
            if (!checkCollision(rotated, nextX, currentPiece.y, grid)) {
                setCurrentPiece((prev) => ({
                    ...prev,
                    matrix: rotated,
                    x: nextX,
                }));
                return;
            }
        }
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
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

    // Game ticks based on speed
    useInterval(() => {
        moveDown();
    }, gameSpeed);

    // Initial game setup
    useEffect(() => {
        resetGame();
    }, []);

    // Helper to get active rendering grid
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
            <StatusBar barStyle="light-content" backgroundColor="#0e0e10" />
            <Header title="Tetris Arcade" />

            <View style={styles.container}>
                {/* Score and Next Piece Side Panel */}
                <View style={styles.topStatsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>SCORE</Text>
                        <Text style={styles.statValue}>{score}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>LEVEL</Text>
                        <Text style={styles.statValue}>{level}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>LINES</Text>
                        <Text style={styles.statValue}>{lines}</Text>
                    </View>
                    <View style={styles.nextPieceBox}>
                        <Text style={styles.nextPieceLabel}>NEXT</Text>
                        <View style={styles.nextPiecePreview}>
                            {SHAPES[nextPieceKey].matrix.map((row, rIdx) => (
                                <View key={rIdx} style={styles.previewRow}>
                                    {row.map((cell, cIdx) => (
                                        <View
                                            key={cIdx}
                                            style={[
                                                styles.previewCell,
                                                {
                                                    backgroundColor: cell
                                                        ? SHAPES[nextPieceKey].color
                                                        : 'transparent',
                                                    borderColor: cell ? '#fff' : 'transparent',
                                                },
                                            ]}
                                        />
                                    ))}
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Main Game Screen */}
                <View style={styles.gameContainer}>
                    <View style={styles.board}>
                        {displayGrid.map((row, rIdx) => (
                            <View key={rIdx} style={styles.row}>
                                {row.map((cellColor, cIdx) => (
                                    <View
                                        key={cIdx}
                                        style={[
                                            styles.cell,
                                            {
                                                backgroundColor: cellColor || '#18181b',
                                                borderColor: cellColor ? 'rgba(255, 255, 255, 0.4)' : '#09090b',
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                        ))}

                        {/* Pause Overlay */}
                        {isPaused && !gameOver && (
                            <View style={styles.overlay}>
                                <Text style={styles.overlayText}>PAUSED</Text>
                                <TouchableOpacity style={styles.overlayButton} onPress={togglePause}>
                                    <Text style={styles.overlayButtonText}>RESUME</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Game Over Overlay */}
                        {gameOver && (
                            <View style={styles.overlay}>
                                <Text style={[styles.overlayText, { color: '#ef4444' }]}>GAME OVER</Text>
                                <Text style={styles.finalScoreText}>Final Score: {score}</Text>
                                <TouchableOpacity style={styles.overlayButton} onPress={resetGame}>
                                    <Text style={styles.overlayButtonText}>PLAY AGAIN</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Controllers Block */}
                <View style={styles.controlsContainer}>
                    {/* Game State Actions */}
                    <View style={styles.gameActionsRow}>
                        <TouchableOpacity style={styles.gameActionButton} onPress={togglePause} disabled={gameOver}>
                            <Text style={styles.gameActionButtonText}>{isPaused ? 'RESUME' : 'PAUSE'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.gameActionButton} onPress={resetGame}>
                            <Text style={styles.gameActionButtonText}>RESET</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Joystick/GamePad layout */}
                    <View style={styles.gamePadRow}>
                        {/* D-PAD Left Side */}
                        <View style={styles.dPad}>
                            <View style={styles.dPadRow}>
                                <View style={styles.dPadSpacer} />
                                <TouchableOpacity
                                    style={styles.dPadButton}
                                    onPress={rotate}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.dPadArrow}>🔄</Text>
                                </TouchableOpacity>
                                <View style={styles.dPadSpacer} />
                            </View>
                            <View style={styles.dPadRow}>
                                <TouchableOpacity
                                    style={styles.dPadButton}
                                    onPress={moveLeft}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.dPadArrow}>⬅️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dPadButton}
                                    onPress={moveDown}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.dPadArrow}>⬇️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dPadButton}
                                    onPress={moveRight}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.dPadArrow}>➡️</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Drop Buttons Right Side */}
                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.hardDropBtn]}
                                onPress={hardDrop}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.actionButtonText}>⏬</Text>
                                <Text style={styles.actionButtonLabel}>HARD DROP</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
    topStatsRow: {
        flexDirection: 'row',
        width: '94%',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#18181b',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#a1a1aa',
        letterSpacing: 1,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#fff',
        marginTop: 2,
    },
    nextPieceBox: {
        alignItems: 'center',
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderLeftColor: '#27272a',
        width: 75,
    },
    nextPieceLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#a1a1aa',
        letterSpacing: 1,
        marginBottom: 4,
    },
    nextPiecePreview: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewRow: {
        flexDirection: 'row',
    },
    previewCell: {
        width: 10,
        height: 10,
        margin: 1,
        borderWidth: 0.5,
        borderRadius: 2,
    },
    gameContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    board: {
        width: BOARD_WIDTH,
        height: BOARD_HEIGHT,
        backgroundColor: '#09090b',
        borderWidth: 4,
        borderColor: '#27272a',
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderWidth: 0.5,
        borderRadius: 1.5,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(9, 9, 11, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
        marginBottom: 10,
    },
    finalScoreText: {
        fontSize: 18,
        color: '#a1a1aa',
        marginBottom: 20,
    },
    overlayButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    overlayButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
        letterSpacing: 1,
    },
    controlsContainer: {
        width: '94%',
        alignItems: 'center',
        paddingBottom: 5,
    },
    gameActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    gameActionButton: {
        backgroundColor: '#27272a',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 0.48,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3f3f46',
    },
    gameActionButtonText: {
        color: '#f4f4f5',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    gamePadRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dPad: {
        width: 160,
        alignItems: 'center',
    },
    dPadRow: {
        flexDirection: 'row',
    },
    dPadSpacer: {
        width: 48,
        height: 48,
    },
    dPadButton: {
        width: 48,
        height: 48,
        backgroundColor: '#18181b',
        borderWidth: 2,
        borderColor: '#27272a',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    dPadArrow: {
        fontSize: 20,
    },
    actionButtonsContainer: {
        flex: 1,
        alignItems: 'flex-end',
        paddingRight: 10,
    },
    actionButton: {
        backgroundColor: '#18181b',
        borderWidth: 2,
        borderColor: '#27272a',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    hardDropBtn: {
        borderColor: '#3b82f6',
        width: 110,
    },
    actionButtonText: {
        fontSize: 26,
    },
    actionButtonLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#a1a1aa',
        marginTop: 4,
        letterSpacing: 0.5,
    },
});

export default Tetris;
