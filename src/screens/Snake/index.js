// src/screens/Snake/index.js
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Dimensions,
    PanResponder,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RotateCcw, Trophy } from 'lucide-react-native';
import Header from '../../components/Header';
import {
    createInitialState,
    step,
    DIRECTIONS,
    GRID_SIZE,
} from './gameLogic';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 32, 380);
const CELL_SIZE = BOARD_SIZE / GRID_SIZE;

const BASE_SPEED = 200; // ms per step at score 0
const MIN_SPEED = 80; // fastest tick
const speedFor = (length) => Math.max(MIN_SPEED, BASE_SPEED - (length - 3) * 6);

const Snake = () => {
    const [state, setState] = useState(createInitialState);
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const directionRef = useRef(state.direction);
    const intervalRef = useRef(null);

    const gameOver = state.gameOver;
    const won = state.won;
    const isRunning = hasStarted && !gameOver && !won;

    // Single source of truth for the direction the next tick should use.
    const setDirection = useCallback((next) => {
        directionRef.current = next;
    }, []);

    const resetGame = useCallback(() => {
        const fresh = createInitialState();
        directionRef.current = fresh.direction;
        setState(fresh);
        setScore(0);
        setHasStarted(false);
    }, []);

    const startGame = useCallback(() => {
        resetGame();
        setHasStarted(true);
    }, [resetGame]);

    // Game loop: tick on an interval that speeds up as the snake grows.
    useEffect(() => {
        if (!isRunning) return undefined;
        intervalRef.current = setInterval(() => {
            setState((prev) => {
                const next = step(prev, directionRef.current);
                if (next.snake.length > prev.snake.length) {
                    setScore(next.snake.length - 3);
                    setBest((b) => Math.max(b, next.snake.length - 3));
                }
                return next;
            });
        }, speedFor(state.snake.length));

        return () => clearInterval(intervalRef.current);
    }, [isRunning, state.snake.length]);

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: (_, gestureState) => {
                    const { dx, dy } = gestureState;
                    return Math.abs(dx) > 6 || Math.abs(dy) > 6;
                },
                onPanResponderRelease: (_, gestureState) => {
                    const { dx, dy } = gestureState;
                    const absX = Math.abs(dx);
                    const absY = Math.abs(dy);
                    if (Math.max(absX, absY) < 16) return; // ignore taps
                    if (absX > absY) {
                        setDirection(dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
                    } else {
                        setDirection(dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
                    }
                    if (!hasStarted) setHasStarted(true);
                },
            }),
        [hasStarted, setDirection]
    );

    // Precompute cell occupancy for fast rendering each frame.
    const occupied = useMemo(() => {
        const map = {};
        for (let i = 0; i < state.snake.length; i++) {
            const { x, y } = state.snake[i];
            map[`${x},${y}`] = i === 0 ? 'head' : 'body';
        }
        if (state.food) map[`${state.food.x},${state.food.y}`] = 'food';
        return map;
    }, [state.snake, state.food]);

    const renderCells = () => {
        const cells = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            const row = [];
            for (let x = 0; x < GRID_SIZE; x++) {
                const type = occupied[`${x},${y}`];
                row.push(
                    <View
                        key={`${x}-${y}`}
                        style={[
                            styles.cell,
                            type === 'head' && styles.head,
                            type === 'body' && styles.body,
                            type === 'food' && styles.food,
                        ]}
                    />
                );
            }
            cells.push(
                <View key={y} style={styles.row}>
                    {row}
                </View>
            );
        }
        return cells;
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <Header title="Snake" />
            <View style={styles.container}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>SCORE</Text>
                        <Text style={styles.statValue}>{score}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>LENGTH</Text>
                        <Text style={styles.statValue}>{state.snake.length}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>BEST</Text>
                        <Text style={[styles.statValue, styles.bestValue]}>{best}</Text>
                    </View>
                </View>

                <Text style={styles.hint}>
                    {hasStarted ? 'Swipe to steer' : 'Swipe to start'}
                </Text>

                <View style={styles.boardOuter} {...panResponder.panHandlers}>
                    <View style={styles.board}>{renderCells()}</View>

                    {(gameOver || won) && (
                        <View style={styles.overlay}>
                            <View style={styles.overlayContent}>
                                <Trophy size={34} color={won ? '#22c55e' : '#71717a'} strokeWidth={2.5} />
                                <Text
                                    style={[
                                        styles.overlayTitle,
                                        { color: won ? '#22c55e' : '#f4f4f5' },
                                    ]}
                                >
                                    {won ? 'You Win!' : 'Game Over'}
                                </Text>
                                <Text style={styles.overlaySubtitle}>
                                    {won ? 'You filled the board!' : `Final score: ${score}`}
                                </Text>
                                <TouchableOpacity
                                    style={styles.overlayButton}
                                    onPress={startGame}
                                    activeOpacity={0.8}
                                >
                                    <RotateCcw size={16} color="#f4f4f5" strokeWidth={2.5} />
                                    <Text style={styles.overlayButtonText}>PLAY AGAIN</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {!hasStarted && !gameOver && !won && (
                    <TouchableOpacity style={styles.startButton} onPress={startGame} activeOpacity={0.8}>
                        <Text style={styles.startButtonText}>START GAME</Text>
                    </TouchableOpacity>
                )}
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
        backgroundColor: '#09090b',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        maxWidth: 380,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: '#18181b',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 18,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 28,
        backgroundColor: '#27272a',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#71717a',
        letterSpacing: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#f4f4f5',
        marginTop: 4,
        fontVariant: ['tabular-nums'],
    },
    bestValue: {
        color: '#fbbf24',
    },
    hint: {
        fontSize: 13,
        fontWeight: '600',
        color: '#52525b',
        letterSpacing: 0.3,
        marginBottom: 18,
    },
    boardOuter: {
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        position: 'relative',
    },
    board: {
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        backgroundColor: '#18181b',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#27272a',
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        height: CELL_SIZE,
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
    },
    head: {
        backgroundColor: '#22c55e',
        borderTopLeftRadius: 4,
        borderBottomRightRadius: 4,
    },
    body: {
        backgroundColor: '#16a34a',
    },
    food: {
        backgroundColor: '#ef4444',
        borderRadius: CELL_SIZE / 2,
        margin: CELL_SIZE * 0.15,
        width: CELL_SIZE * 0.7,
        height: CELL_SIZE * 0.7,
        shadowColor: '#ef4444',
        shadowOpacity: 0.7,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(9, 9, 11, 0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        zIndex: 10,
    },
    overlayContent: {
        alignItems: 'center',
        gap: 14,
        padding: 24,
    },
    overlayTitle: {
        fontSize: 30,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    overlaySubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#a1a1aa',
        marginBottom: 6,
    },
    overlayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#18181b',
        borderWidth: 1.5,
        borderColor: '#27272a',
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 10,
    },
    overlayButtonText: {
        color: '#f4f4f5',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    startButton: {
        backgroundColor: '#22c55e',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: 26,
        elevation: 6,
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    startButtonText: {
        color: '#09090b',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
});

export default Snake;
