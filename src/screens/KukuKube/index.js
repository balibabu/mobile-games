// src/screens/KukuKube/index.js
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
import { RotateCcw, Trophy, Play, ScanSearch } from 'lucide-react-native';
import Header from '../../components/Header';
import { generateRound, MAX_SIZE } from './gameLogic';

const { width } = Dimensions.get('window');
const BOARD_PADDING = 10;
const BOARD_GAP = 6;
const BOARD_SIZE = Math.min(width - 32, 360);

const ACCENT = '#a855f7';
const SUCCESS = '#22c55e';
const DANGER = '#ef4444';
const WRONG_FLASH_MS = 600;

// Phases the screen cycles through.
//   idle     -> waiting at the start screen
//   playing  -> countdown running, player taps to find the odd tile
//   correct  -> right tile found, brief flash before the next round
//   wrong    -> wrong tile tapped, brief reveal before game over
//   gameover -> time ran out or wrong tile (end screen)
const PHASE = {
    IDLE: 'idle',
    PLAYING: 'playing',
    CORRECT: 'correct',
    WRONG: 'wrong',
    GAMEOVER: 'gameover',
};

const KukuKube = () => {
    const [level, setLevel] = useState(1);
    const [best, setBest] = useState(0);
    const [phase, setPhase] = useState(PHASE.IDLE);
    const [round, setRound] = useState(() => generateRound(1));
    const [timeLeft, setTimeLeft] = useState(round.time);
    const [wrongIndex, setWrongIndex] = useState(null); // cell tapped incorrectly

    // Keep the latest values in refs so interval/timeout callbacks read fresh data.
    const phaseRef = useRef(phase);
    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    // Clear every pending interval/timeout on unmount or phase change.
    const timersRef = useRef({ interval: null, timeouts: [] });
    const clearTimers = useCallback(() => {
        if (timersRef.current.interval) {
            clearInterval(timersRef.current.interval);
            timersRef.current.interval = null;
        }
        timersRef.current.timeouts.forEach((t) => clearTimeout(t));
        timersRef.current.timeouts = [];
    }, []);

    useEffect(() => () => clearTimers(), [clearTimers]);

    // Start a fresh round: reset the countdown and begin ticking.
    const startRound = useCallback(
        (nextLevel, nextRound) => {
            clearTimers();
            setRound(nextRound);
            setTimeLeft(nextRound.time);
            setWrongIndex(null);
            setPhase(PHASE.PLAYING);

            timersRef.current.interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Out of time -> game over.
                        clearTimers();
                        setBest((b) => Math.max(b, nextLevel));
                        setPhase(PHASE.GAMEOVER);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        },
        [clearTimers]
    );

    const startGame = useCallback(() => {
        const firstLevel = 1;
        const firstRound = generateRound(firstLevel);
        setLevel(firstLevel);
        startRound(firstLevel, firstRound);
    }, [startRound]);

    // Handle a tile tap during play.
    const handlePress = useCallback(
        (index) => {
            if (phaseRef.current !== PHASE.PLAYING) return;

            if (index === round.oddIndex) {
                // Correct! Flash green, then advance.
                clearTimers();
                setPhase(PHASE.CORRECT);
                const advancedLevel = level + 1;
                setBest((b) => Math.max(b, level));
                const next = setTimeout(() => {
                    const nextRound = generateRound(advancedLevel);
                    setLevel(advancedLevel);
                    startRound(advancedLevel, nextRound);
                }, 450);
                timersRef.current.timeouts.push(next);
            } else {
                // Wrong tile. Flash it red, then end the game.
                clearTimers();
                setWrongIndex(index);
                setPhase(PHASE.WRONG);
                setBest((b) => Math.max(b, level));
                const over = setTimeout(() => setPhase(PHASE.GAMEOVER), WRONG_FLASH_MS);
                timersRef.current.timeouts.push(over);
            }
        },
        [round, level, startRound, clearTimers]
    );

    // Color each tile based on phase.
    const colorFor = (index) => {
        const isOdd = index === round.oddIndex;
        // Correctly-tapped odd tile flashes green.
        if (phase === PHASE.CORRECT && isOdd) return SUCCESS;
        // A wrongly-tapped tile flashes red.
        if (phase === PHASE.WRONG && index === wrongIndex) return DANGER;
        // During play, the odd tile shows its distinct shade so the player can find it.
        if (isOdd) return round.oddColor;
        return round.baseColor;
    };

    const renderCell = (index) => {
        const interactive = phase === PHASE.PLAYING;
        return (
            <TouchableOpacity
                key={index}
                activeOpacity={interactive ? 0.7 : 1}
                disabled={!interactive}
                onPress={() => handlePress(index)}
                style={[styles.cell, { backgroundColor: colorFor(index) }]}
            />
        );
    };

    const statusText = () => {
        switch (phase) {
            case PHASE.IDLE:
                return 'Find the odd-colored tile before time runs out!';
            case PHASE.PLAYING:
                return `${timeLeft}s — spot the different shade`;
            case PHASE.CORRECT:
                return 'Got it! Next round…';
            case PHASE.WRONG:
                return 'Not that one!';
            case PHASE.GAMEOVER:
                return 'Game over.';
            default:
                return '';
        }
    };

    const statusColor = () => {
        if (phase === PHASE.CORRECT) return SUCCESS;
        if (phase === PHASE.WRONG || phase === PHASE.GAMEOVER) return DANGER;
        if (timeLeft <= 5) return DANGER;
        return '#52525b';
    };

    const countdownColor = timeLeft <= 5 ? DANGER : '#f4f4f5';

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <Header title="Kuku Kube" />
            <View style={styles.container}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>LEVEL</Text>
                        <Text style={styles.statValue}>{level}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>GRID</Text>
                        <Text style={styles.statValue}>{`${round.size}\u00d7${round.size}`}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>BEST</Text>
                        <Text style={[styles.statValue, styles.bestValue]}>{best || '\u2014'}</Text>
                    </View>
                </View>

                <Text style={[styles.status, { color: statusColor() }]}>{statusText()}</Text>

                {/* Countdown bar */}
                <View style={styles.timeBarOuter}>
                    <View
                        style={[
                            styles.timeBarFill,
                            {
                                width: `${round.time ? (timeLeft / round.time) * 100 : 0}%`,
                                backgroundColor: countdownColor,
                            },
                        ]}
                    />
                </View>

                <View style={styles.boardOuter}>
                    <View style={styles.board}>
                        {Array.from({ length: round.size }).map((__, r) => (
                            <View key={r} style={styles.row}>
                                {Array.from({ length: round.size }).map((_, c) =>
                                    renderCell(r * round.size + c)
                                )}
                            </View>
                        ))}
                    </View>

                    {(phase === PHASE.IDLE || phase === PHASE.GAMEOVER) && (
                        <View style={styles.overlay}>
                            <View style={styles.overlayContent}>
                                {phase === PHASE.GAMEOVER ? (
                                    <Trophy size={34} color={ACCENT} strokeWidth={2.5} />
                                ) : (
                                    <ScanSearch size={34} color={ACCENT} strokeWidth={2.5} />
                                )}
                                <Text style={[styles.overlayTitle, { color: '#f4f4f5' }]}>
                                    {phase === PHASE.GAMEOVER ? 'Game Over' : 'Kuku Kube'}
                                </Text>
                                <Text style={styles.overlaySubtitle}>
                                    {phase === PHASE.GAMEOVER
                                        ? `You reached level ${level}.`
                                        : 'Spot the tile with a different shade!'}
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

                {level >= MAX_SIZE - 1 && phase !== PHASE.IDLE && phase !== PHASE.GAMEOVER && (
                    <Text style={styles.maxHint}>{'Max grid reached \u2014 pure sharpness now!'}</Text>
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
        marginBottom: 14,
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
        marginBottom: 12,
        textAlign: 'center',
        minHeight: 18,
    },
    timeBarOuter: {
        width: '100%',
        maxWidth: 360,
        height: 8,
        backgroundColor: '#18181b',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#27272a',
        overflow: 'hidden',
        marginBottom: 18,
    },
    timeBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    boardOuter: {
        width: BOARD_SIZE,
        aspectRatio: 1,
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
        justifyContent: 'space-between',
        marginBottom: BOARD_GAP,
    },
    cell: {
        flex: 1,
        aspectRatio: 1,
        marginHorizontal: BOARD_GAP / 2,
        borderRadius: 8,
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
    maxHint: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fbbf24',
        marginTop: 14,
        letterSpacing: 0.3,
    },
});

export default KukuKube;
