// src/screens/Game2048/index.js
import React, { useState, useMemo, useRef } from 'react';
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
    createInitialBoard,
    move,
    spawnTile,
    hasWon,
    canMove,
    DIRECTIONS,
    SIZE,
} from './gameLogic';

const { width } = Dimensions.get('window');
// Keep the board comfortably within horizontal margins.
const BOARD_PADDING = 10;
const BOARD_GAP = 10;
const BOARD_SIZE = Math.min(width - 32, 380);
const CELL_SIZE = (BOARD_SIZE - BOARD_PADDING * 2 - BOARD_GAP * (SIZE - 1)) / SIZE;

// Tile palette tuned to match the app's zinc/emerald aesthetic.
const TILE_STYLES = {
    0: { bg: '#18181b', color: 'transparent', fontSize: 0 },
    2: { bg: '#27272a', color: '#e4e4e7', fontSize: 30 },
    4: { bg: '#3f3f46', color: '#f4f4f5', fontSize: 30 },
    8: { bg: '#0d9488', color: '#f0fdfa', fontSize: 28 },
    16: { bg: '#14b8a6', color: '#f0fdfa', fontSize: 28 },
    32: { bg: '#10b981', color: '#ecfdf5', fontSize: 28 },
    64: { bg: '#22c55e', color: '#f0fdf4', fontSize: 28 },
    128: { bg: '#84cc16', color: '#1a2e05', fontSize: 24 },
    256: { bg: '#eab308', color: '#422006', fontSize: 24 },
    512: { bg: '#f59e0b', color: '#451a03', fontSize: 24 },
    1024: { bg: '#f97316', color: '#431407', fontSize: 20 },
    2048: { bg: '#a855f7', color: '#fdf4ff', fontSize: 20 },
};
const tileStyleFor = (value) => TILE_STYLES[value] || TILE_STYLES[2048];

const Game2048 = () => {
    const [board, setBoard] = useState(() => createInitialBoard());
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [status, setStatus] = useState('playing'); // 'playing' | 'won' | 'lost'
    const [keepPlaying, setKeepPlaying] = useState(false);
    // Tracks whether the player has already seen the 2048 tile, to avoid re-prompting.
    const winShownRef = useRef(false);

    // Locks input while a move resolves, so a swipe can't fire twice mid-gesture.
    const lockedRef = useRef(false);

    const handleMove = (direction) => {
        if (lockedRef.current) return;
        if (status !== 'playing') return;

        const result = move(board, direction);
        if (!result.moved) return;

        lockedRef.current = true;
        const withTile = spawnTile(result.board);
        const gained = result.gained;
        const newScore = score + gained;

        setBoard(withTile);
        setScore(newScore);
        setBest((prev) => Math.max(prev, newScore));

        if (hasWon(withTile) && !winShownRef.current && !keepPlaying) {
            winShownRef.current = true;
            setStatus('won');
        } else if (!canMove(withTile)) {
            setStatus('lost');
        }

        // Release the lock on the next frame so the gesture can continue.
        requestAnimationFrame(() => {
            lockedRef.current = false;
        });
    };

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
                        handleMove(dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
                    } else {
                        handleMove(dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
                    }
                },
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [board, score, status, keepPlaying]
    );

    const resetGame = () => {
        winShownRef.current = false;
        setKeepPlaying(false);
        setStatus('playing');
        setScore(0);
        setBoard(createInitialBoard());
    };

    const continueAfterWin = () => {
        setKeepPlaying(true);
        setStatus('playing');
    };

    const renderCell = (value, r, c) => {
        const style = tileStyleFor(value);
        return (
            <View
                key={`${r}-${c}`}
                style={[
                    styles.cell,
                    {
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: style.bg,
                        shadowColor: value >= 128 ? style.bg : 'transparent',
                        shadowOpacity: value >= 128 ? 0.35 : 0,
                    },
                ]}
            >
                {value > 0 && (
                    <Text style={[styles.cellText, { color: style.color, fontSize: style.fontSize }]}>
                        {value}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <Header title="2048" />
            <View style={styles.container}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>SCORE</Text>
                        <Text style={styles.statValue}>{score}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>BEST</Text>
                        <Text style={[styles.statValue, styles.bestValue]}>{best}</Text>
                    </View>
                </View>

                <Text style={styles.hint}>Swipe to combine tiles. Reach 2048!</Text>

                <View style={styles.boardOuter} {...panResponder.panHandlers}>
                    <View style={styles.board}>
                        {board.map((row, r) => (
                            <View key={r} style={styles.row}>
                                {row.map((value, c) => renderCell(value, r, c))}
                            </View>
                        ))}
                    </View>

                    {status !== 'playing' && (
                        <View style={styles.overlay}>
                            <View style={styles.overlayContent}>
                                <Trophy size={34} color={status === 'won' ? '#a855f7' : '#71717a'} strokeWidth={2.5} />
                                <Text
                                    style={[
                                        styles.overlayTitle,
                                        { color: status === 'won' ? '#a855f7' : '#f4f4f5' },
                                    ]}
                                >
                                    {status === 'won' ? 'You Win!' : 'Game Over'}
                                </Text>
                                <Text style={styles.overlaySubtitle}>
                                    {status === 'won' ? 'You reached 2048!' : `Final score: ${score}`}
                                </Text>

                                {status === 'won' && (
                                    <TouchableOpacity
                                        style={[styles.overlayButton, styles.overlayButtonPrimary]}
                                        onPress={continueAfterWin}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.overlayButtonTextPrimary}>KEEP GOING</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={styles.overlayButton}
                                    onPress={resetGame}
                                    activeOpacity={0.8}
                                >
                                    <RotateCcw size={16} color="#f4f4f5" strokeWidth={2.5} />
                                    <Text style={styles.overlayButtonText}>NEW GAME</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.newGameButton} onPress={resetGame} activeOpacity={0.8}>
                    <RotateCcw size={16} color="#f4f4f5" strokeWidth={2.5} />
                    <Text style={styles.newGameButtonText}>NEW GAME</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// TouchableOpacity imported above from react-native.

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
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },
    cellText: {
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
        backgroundColor: '#a855f7',
        borderColor: '#a855f7',
    },
    overlayButtonText: {
        color: '#f4f4f5',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    overlayButtonTextPrimary: {
        color: '#f4f4f5',
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

export default Game2048;
