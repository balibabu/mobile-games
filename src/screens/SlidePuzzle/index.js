// src/screens/SlidePuzzle/index.js
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
    SIZE,
    EMPTY,
    shuffleBoard,
    moveTile,
    moveByDirection,
    canMove,
    isSolved,
    DIRECTIONS,
} from './gameLogic';

const { width } = Dimensions.get('window');
const BOARD_PADDING = 8;
const BOARD_GAP = 8;
const BOARD_SIZE = Math.min(width - 32, 380);
const CELL_SIZE = (BOARD_SIZE - BOARD_PADDING * 2 - BOARD_GAP * (SIZE - 1)) / SIZE;

const ACCENT = '#06b6d4'; // cyan, distinct from the other puzzle games

// Map tile numbers to a gradient-like palette so the board reads as a gradient
// when solved, and clearly shows progress while scrambling.
const TILE_COLORS = [
    '#27272a', '#3f3f46', '#52525b', '#71717a',
    '#0e7490', '#0891b2', '#06b6d4', '#22d3ee',
    '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4',
    '#7c3aed', '#8b5cf6', '#a855f7',
];

const SlidePuzzle = () => {
    const [board, setBoard] = useState(() => shuffleBoard());
    const [moves, setMoves] = useState(0);
    const [best, setBest] = useState(0);
    const [won, setWon] = useState(false);

    // Lock input while a swipe resolves to avoid double-firing.
    const lockedRef = useRef(false);

    const resetGame = useCallback(() => {
        setBoard(shuffleBoard());
        setMoves(0);
        setWon(false);
    }, []);

    const handleBoard = useCallback(
        (next, didMove) => {
            if (!didMove || next === board) return;
            if (lockedRef.current) return;
            lockedRef.current = true;

            setBoard(next);
            setMoves((m) => {
                const updated = m + 1;
                return updated;
            });

            if (isSolved(next)) {
                setWon(true);
                setBest((b) => (b === 0 ? moves + 1 : Math.min(b, moves + 1)));
            }

            requestAnimationFrame(() => {
                lockedRef.current = false;
            });
        },
        [board, moves]
    );

    const onTilePress = useCallback(
        (row, col) => {
            if (won) return;
            if (!canMove(board, row, col)) return;
            const next = moveTile(board, row, col);
            handleBoard(next, true);
        },
        [board, won, handleBoard]
    );

    const onSwipe = useCallback(
        (direction) => {
            if (won) return;
            const { board: next, moved } = moveByDirection(board, direction);
            handleBoard(next, moved);
        },
        [board, won, handleBoard]
    );

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: (_, gestureState) => {
                    const { dx, dy } = gestureState;
                    return Math.abs(dx) > 8 || Math.abs(dy) > 8;
                },
                onPanResponderRelease: (_, gestureState) => {
                    const { dx, dy } = gestureState;
                    const absX = Math.abs(dx);
                    const absY = Math.abs(dy);
                    if (Math.max(absX, absY) < 24) return; // ignore tiny taps
                    if (absX > absY) {
                        onSwipe(dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
                    } else {
                        onSwipe(dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
                    }
                },
            }),
        [onSwipe]
    );

    // Track best score on win.
    useEffect(() => {
        if (won && moves > 0) {
            setBest((b) => (b === 0 ? moves : Math.min(b, moves)));
        }
    }, [won, moves]);

    const renderCell = (value, r, c) => {
        const isEmpty = value === EMPTY;
        const movable = !isEmpty && canMove(board, r, c);
        const colorIndex = (value - 1) % TILE_COLORS.length;
        const tileColor = TILE_COLORS[colorIndex];

        return (
            <TouchableOpacity
                key={`${r}-${c}`}
                activeOpacity={movable ? 0.7 : 1}
                onPress={() => onTilePress(r, c)}
                style={[
                    styles.cell,
                    {
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: isEmpty ? 'transparent' : tileColor,
                        shadowColor: isEmpty ? 'transparent' : tileColor,
                        shadowOpacity: movable ? 0.4 : 0.15,
                        borderWidth: isEmpty ? 0 : 1,
                        borderColor: 'rgba(255,255,255,0.08)',
                    },
                ]}
            >
                {!isEmpty && (
                    <Text
                        style={[
                            styles.cellText,
                            { color: value <= 4 ? '#e4e4e7' : '#09090b' },
                        ]}
                    >
                        {value}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <Header title="Slide Puzzle" />
            <View style={styles.container}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>MOVES</Text>
                        <Text style={styles.statValue}>{moves}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>BEST</Text>
                        <Text style={[styles.statValue, styles.bestValue]}>{best || '—'}</Text>
                    </View>
                </View>

                <Text style={styles.hint}>Tap a tile or swipe to slide. Order them 1–15!</Text>

                <View style={styles.boardOuter} {...panResponder.panHandlers}>
                    <View style={styles.board}>
                        {board.map((row, r) => (
                            <View key={r} style={styles.row}>
                                {row.map((value, c) => renderCell(value, r, c))}
                            </View>
                        ))}
                    </View>

                    {won && (
                        <View style={styles.overlay}>
                            <View style={styles.overlayContent}>
                                <Trophy size={34} color={ACCENT} strokeWidth={2.5} />
                                <Text style={[styles.overlayTitle, { color: ACCENT }]}>Solved!</Text>
                                <Text style={styles.overlaySubtitle}>
                                    {moves} moves{best === moves ? ' — new best!' : ''}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.overlayButton, styles.overlayButtonPrimary]}
                                    onPress={resetGame}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.overlayButtonTextPrimary}>PLAY AGAIN</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.newGameButton} onPress={resetGame} activeOpacity={0.8}>
                    <RotateCcw size={16} color="#f4f4f5" strokeWidth={2.5} />
                    <Text style={styles.newGameButtonText}>SHUFFLE</Text>
                </TouchableOpacity>
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
        flex: 1,
        backgroundColor: '#18181b',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#27272a',
        padding: BOARD_PADDING,
    },
    row: {
        flexDirection: 'row',
        marginBottom: BOARD_GAP,
    },
    cell: {
        marginRight: BOARD_GAP,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
    },
    cellText: {
        fontSize: CELL_SIZE * 0.4,
        fontWeight: '900',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(9, 9, 11, 0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
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
    overlayButtonPrimary: {
        backgroundColor: ACCENT,
        borderColor: ACCENT,
    },
    overlayButtonTextPrimary: {
        color: '#09090b',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    newGameButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#18181b',
        borderWidth: 1.5,
        borderColor: '#27272a',
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 26,
    },
    newGameButtonText: {
        color: '#f4f4f5',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
});

export default SlidePuzzle;
