// src/screens/MemoryGrid/index.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RotateCcw, Trophy, Play, Brain } from 'lucide-react-native';
import Header from '../../components/Header';
import {
    SIZE,
    cellId,
    generatePattern,
    matchesPattern,
    showDurationFor,
} from './gameLogic';

const { width } = Dimensions.get('window');
const BOARD_PADDING = 10;
const BOARD_GAP = 8;
const BOARD_SIZE = Math.min(width - 32, 360);
const CELL_SIZE = (BOARD_SIZE - BOARD_PADDING * 2 - BOARD_GAP * (SIZE - 1)) / SIZE;

const ACCENT = '#a855f7';
const SUCCESS = '#22c55e';
const DANGER = '#ef4444';

// Phases the screen cycles through.
//   idle     -> waiting at the start screen
//   showing  -> pattern is visible, player must memorize
//   input    -> player taps cells to reproduce the pattern
//   correct  -> round cleared, brief celebration before next round
//   gameover -> player tapped a wrong cell
const PHASE = {
    IDLE: 'idle',
    SHOWING: 'showing',
    INPUT: 'input',
    CORRECT: 'correct',
    GAMEOVER: 'gameover',
};

const MemoryGrid = () => {
    const [level, setLevel] = useState(1);
    const [best, setBest] = useState(0);
    const [phase, setPhase] = useState(PHASE.IDLE);
    const [pattern, setPattern] = useState(() => generatePattern(1)); // Set<number> of cell ids
    const [tapped, setTapped] = useState(() => new Set()); // player's current taps
    const [wrongCell, setWrongCell] = useState(null); // id of the wrongly-tapped cell (for red flash)

    // Keep the latest pattern in a ref so timeout callbacks read fresh values.
    const patternRef = useRef(pattern);
    useEffect(() => {
        patternRef.current = pattern;
    }, [pattern]);

    // Clear every pending timeout when the component unmounts or a new round starts.
    const timersRef = useRef([]);
    const clearTimers = useCallback(() => {
        timersRef.current.forEach((t) => clearTimeout(t));
        timersRef.current = [];
    }, []);

    useEffect(() => () => clearTimers(), [clearTimers]);

    // Begin a round: show the pattern for a while, then switch to input phase.
    const startRound = useCallback(
        (nextLevel, nextPattern) => {
            clearTimers();
            setTapped(new Set());
            setWrongCell(null);
            setPhase(PHASE.SHOWING);

            const duration = showDurationFor(nextLevel);
            const hideTimer = setTimeout(() => {
                setPhase(PHASE.INPUT);
            }, duration);
            timersRef.current.push(hideTimer);
        },
        [clearTimers]
    );

    const startGame = useCallback(() => {
        const firstLevel = 1;
        const firstPattern = generatePattern(firstLevel);
        setLevel(firstLevel);
        setPattern(firstPattern);
        startRound(firstLevel, firstPattern);
    }, [startRound]);

    // Handle a player tap during the input phase.
    const handlePress = useCallback(
        (id) => {
            if (phase !== PHASE.INPUT) return;

            // Already-tapped cell: ignore (no penalty for re-tapping).
            if (tapped.has(id)) return;

            // Correct tap: it's part of the pattern and not yet tapped.
            if (patternRef.current.has(id)) {
                const nextTapped = new Set(tapped);
                nextTapped.add(id);
                setTapped(nextTapped);

                // Round cleared once every pattern cell is tapped.
                if (matchesPattern(nextTapped, patternRef.current)) {
                    setPhase(PHASE.CORRECT);
                    const advancedLevel = level + 1;
                    setBest((b) => Math.max(b, level));
                    // Brief celebration, then ramp up the difficulty.
                    const nextTimer = setTimeout(() => {
                        const nextPattern = generatePattern(advancedLevel);
                        setLevel(advancedLevel);
                        setPattern(nextPattern);
                        startRound(advancedLevel, nextPattern);
                    }, 900);
                    timersRef.current.push(nextTimer);
                }
            } else {
                // Wrong tap: game over.
                setWrongCell(id);
                setPhase(PHASE.GAMEOVER);
                setBest((b) => Math.max(b, level));
                clearTimers();
            }
        },
        [phase, tapped, level, startRound, clearTimers]
    );

    // Decide how to render a single cell based on the current phase.
    const renderCell = (id) => {
        const inPattern = pattern.has(id);
        const wasTapped = tapped.has(id);

        let backgroundColor = '#18181b';
        let borderColor = '#27272a';
        let glow = false;

        if (phase === PHASE.SHOWING) {
            // Reveal the pattern.
            if (inPattern) {
                backgroundColor = ACCENT;
                glow = true;
            }
        } else if (phase === PHASE.INPUT) {
            if (wasTapped) {
                backgroundColor = SUCCESS;
                glow = true;
            }
        } else if (phase === PHASE.CORRECT) {
            // Flash all pattern cells green to celebrate.
            if (inPattern) {
                backgroundColor = SUCCESS;
                glow = true;
            }
        } else if (phase === PHASE.GAMEOVER) {
            // Reveal the full pattern, tint the wrong tap red.
            if (id === wrongCell) {
                backgroundColor = DANGER;
                glow = true;
            } else if (inPattern) {
                backgroundColor = ACCENT;
            }
        } else if (phase === PHASE.IDLE) {
            // Subtle hint of what's coming.
        }

        const interactive = phase === PHASE.INPUT && !wasTapped;

        return (
            <TouchableOpacity
                key={id}
                activeOpacity={interactive ? 0.6 : 1}
                disabled={!interactive}
                onPress={() => handlePress(id)}
                style={[
                    styles.cell,
                    {
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor,
                        borderColor,
                        shadowColor: glow ? backgroundColor : 'transparent',
                        shadowOpacity: glow ? 0.5 : 0,
                    },
                ]}
            />
        );
    };

    const statusText = () => {
        switch (phase) {
            case PHASE.IDLE:
                return 'Memorize the pattern, then tap the same cells!';
            case PHASE.SHOWING:
                return 'Memorize the highlighted cells…';
            case PHASE.INPUT:
                return `Reproduce the pattern — ${pattern.size - tapped.size} left`;
            case PHASE.CORRECT:
                return 'Perfect! Get ready for the next round…';
            case PHASE.GAMEOVER:
                return 'Wrong cell! Game over.';
            default:
                return '';
        }
    };

    const statusColor = () => {
        if (phase === PHASE.CORRECT) return SUCCESS;
        if (phase === PHASE.GAMEOVER) return DANGER;
        if (phase === PHASE.SHOWING) return ACCENT;
        return '#52525b';
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <Header title="Memory Grid" />
            <View style={styles.container}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>LEVEL</Text>
                        <Text style={styles.statValue}>{level}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>CELLS</Text>
                        <Text style={styles.statValue}>{pattern.size}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>BEST</Text>
                        <Text style={[styles.statValue, styles.bestValue]}>{best || '—'}</Text>
                    </View>
                </View>

                <Text style={[styles.status, { color: statusColor() }]}>{statusText()}</Text>

                <View style={styles.boardOuter}>
                    <View style={styles.board}>
                        {Array.from({ length: SIZE }).map((__row, r) => (
                            <View key={r} style={styles.row}>
                                {Array.from({ length: SIZE }).map((__col, c) => renderCell(cellId(r, c)))}
                            </View>
                        ))}
                    </View>

                    {(phase === PHASE.IDLE || phase === PHASE.GAMEOVER) && (
                        <View style={styles.overlay}>
                            <View style={styles.overlayContent}>
                                {phase === PHASE.GAMEOVER ? (
                                    <Trophy size={34} color={ACCENT} strokeWidth={2.5} />
                                ) : (
                                    <Brain size={34} color={ACCENT} strokeWidth={2.5} />
                                )}
                                <Text style={[styles.overlayTitle, { color: '#f4f4f5' }]}>
                                    {phase === PHASE.GAMEOVER ? 'Game Over' : 'Memory Grid'}
                                </Text>
                                <Text style={styles.overlaySubtitle}>
                                    {phase === PHASE.GAMEOVER
                                        ? `You reached level ${level}.`
                                        : 'Watch the pattern, then recreate it!'}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.overlayButton, styles.overlayButtonPrimary]}
                                    onPress={startGame}
                                    activeOpacity={0.8}
                                >
                                    {phase === PHASE.IDLE ? (
                                        <Play size={16} color="#f4f4f5" strokeWidth={2.5} />
                                    ) : (
                                        <RotateCcw size={16} color="#f4f4f5" strokeWidth={2.5} />
                                    )}
                                    <Text style={styles.overlayButtonTextPrimary}>
                                        {phase === PHASE.IDLE ? 'START' : 'PLAY AGAIN'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {phase !== PHASE.IDLE && phase !== PHASE.GAMEOVER && (
                    <TouchableOpacity style={styles.newGameButton} onPress={startGame} activeOpacity={0.8}>
                        <RotateCcw size={16} color="#f4f4f5" strokeWidth={2.5} />
                        <Text style={styles.newGameButtonText}>RESTART</Text>
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
        maxWidth: 360,
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
        fontSize: 22,
        fontWeight: '900',
        color: '#f4f4f5',
        marginTop: 4,
        fontVariant: ['tabular-nums'],
    },
    bestValue: {
        color: '#fbbf24',
    },
    status: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
        marginBottom: 18,
        textAlign: 'center',
        minHeight: 18,
    },
    boardOuter: {
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        position: 'relative',
    },
    board: {
        flex: 1,
        backgroundColor: '#09090b',
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
        borderWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
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
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    overlaySubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#a1a1aa',
        marginBottom: 6,
        textAlign: 'center',
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

export default MemoryGrid;
