// src/screens/Sudoku/index.js
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RotateCcw, Trophy, Eraser, Pencil } from 'lucide-react-native';
import Header from '../../components/Header';
import {
    SIZE,
    BOX,
    createPuzzle,
    buildFixedMask,
    findConflicts,
    hasConflict,
    isSolved,
    DIFFICULTIES,
} from './gameLogic';

const { width } = Dimensions.get('window');
const BOARD_PADDING = 6;
const BOARD_SIZE = Math.min(width - 32, 380);
const CELL_SIZE = (BOARD_SIZE - BOARD_PADDING * 2) / SIZE;
const MAX_MISTAKES = 3;

const ACCENT = '#a855f7';

// Per-difficulty accent colors so the cards feel distinct.
const DIFFICULTY_COLORS = {
    easy: '#22c55e',
    medium: '#f59e0b',
    hard: '#ef4444',
};

const Sudoku = () => {
    // Lazy-init the first puzzle so the (slightly heavy) generator runs only once.
    const [session, setSession] = useState(() => {
        const { puzzle, solution } = createPuzzle('medium');
        return { puzzle, solution, fixed: buildFixedMask(puzzle) };
    });
    const [board, setBoard] = useState(() => session.puzzle.map((row) => [...row]));
    const [selected, setSelected] = useState(null); // {row, col}
    const [mistakes, setMistakes] = useState(0);
    const [notes, setNotes] = useState(() =>
        Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => new Set()))
    );
    const [notesMode, setNotesMode] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [won, setWon] = useState(false);
    const [lost, setLost] = useState(false);

    // Precompute which cells currently conflict, so we can tint them red.
    const conflicts = useMemo(() => {
        const map = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] !== 0 && hasConflict(board, r, c)) {
                    map[r][c] = true;
                    findConflicts(board, r, c).forEach(([cr, cc]) => {
                        map[cr][cc] = true;
                    });
                }
            }
        }
        return map;
    }, [board]);

    const handleSelect = useCallback(
        (row, col) => {
            if (won || lost) return;
            if (session.fixed[row][col]) return;
            setSelected({ row, col });
        },
        [session.fixed, won, lost]
    );

    const handleNumber = useCallback(
        (num) => {
            if (!selected || won || lost) return;
            const { row, col } = selected;
            if (session.fixed[row][col]) return;

            if (notesMode) {
                // Toggle the candidate note instead of writing the value.
                setNotes((prev) => {
                    const next = prev.map((r) => r.map((s) => new Set(s)));
                    if (next[row][col].has(num)) next[row][col].delete(num);
                    else next[row][col].add(num);
                    return next;
                });
                return;
            }

            setBoard((prev) => {
                const next = prev.map((r) => [...r]);
                next[row][col] = num;
                return next;
            });

            // Count a mistake whenever the entered value diverges from the solution.
            const isWrong = session.solution[row][col] !== num;
            setMistakes((m) => {
                const updated = m + (isWrong ? 1 : 0);
                if (updated >= MAX_MISTAKES) setLost(true);
                return updated;
            });
        },
        [selected, session.fixed, session.solution, notesMode, won, lost]
    );

    const handleErase = useCallback(() => {
        if (!selected || won || lost) return;
        const { row, col } = selected;
        if (session.fixed[row][col]) return;
        setBoard((prev) => {
            const next = prev.map((r) => [...r]);
            next[row][col] = 0;
            return next;
        });
        setNotes((prev) => {
            const next = prev.map((r) => r.map((s) => new Set(s)));
            next[row][col].clear();
            return next;
        });
    }, [selected, session.fixed, won, lost]);

    // Check for a win whenever the board changes.
    useEffect(() => {
        if (!won && !lost && isSolved(board)) setWon(true);
    }, [board, won, lost]);

    const startNewGame = useCallback(
        (difficulty) => {
            setGenerating(true);
            // Defer the heavy generation to the next tick so the spinner can paint.
            setTimeout(() => {
                const { puzzle, solution } = createPuzzle(difficulty);
                setSession({ puzzle, solution, fixed: buildFixedMask(puzzle) });
                setBoard(puzzle.map((row) => [...row]));
                setNotes(Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => new Set())));
                setSelected(null);
                setMistakes(0);
                setNotesMode(false);
                setWon(false);
                setLost(false);
                setGenerating(false);
            }, 30);
        },
        []
    );

    const sameRowCol = selected;
    const renderCell = (value, row, col) => {
        const isSelected = selected && selected.row === row && selected.col === col;
        const isPeer =
            sameRowCol &&
            !isSelected &&
            (sameRowCol.row === row ||
                sameRowCol.col === col ||
                (Math.floor(sameRowCol.row / BOX) === Math.floor(row / BOX) &&
                    Math.floor(sameRowCol.col / BOX) === Math.floor(col / BOX)));
        const isSameNumber =
            sameRowCol && value !== 0 && board[sameRowCol.row][sameRowCol.col] === value;
        const isFixed = session.fixed[row][col];
        const isConflict = conflicts[row][col];
        const cellNotes = notes[row][col];

        // Box-separator borders create the classic 3x3 sub-grid look.
        const borderStyles = {};
        if (col % BOX === BOX - 1 && col !== SIZE - 1) borderStyles.borderRightWidth = 2.5;
        if (row % BOX === BOX - 1 && row !== SIZE - 1) borderStyles.borderBottomWidth = 2.5;

        let backgroundColor = '#18181b';
        if (isPeer) backgroundColor = '#1f1f23';
        if (isSameNumber) backgroundColor = '#3f3f46';
        if (isSelected) backgroundColor = '#3b82f6';
        if (isConflict) backgroundColor = '#7f1d1d';

        let textColor = '#f4f4f5';
        if (isConflict) textColor = '#fecaca';
        if (isFixed) textColor = '#a1a1aa';

        return (
            <TouchableOpacity
                key={`${row}-${col}`}
                activeOpacity={isFixed ? 1 : 0.6}
                onPress={() => handleSelect(row, col)}
                style={[
                    styles.cell,
                    {
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor,
                    },
                    borderStyles,
                ]}
            >
                {value !== 0 ? (
                    <Text style={[styles.cellText, { color: textColor, fontWeight: isFixed ? '700' : '800' }]}>
                        {value}
                    </Text>
                ) : cellNotes.size > 0 ? (
                    <View style={styles.notesGrid}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                            <Text key={n} style={styles.noteText}>
                                {cellNotes.has(n) ? n : ''}
                            </Text>
                        ))}
                    </View>
                ) : null}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <Header title="Sudoku" />
            <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>MISTAKES</Text>
                        <Text style={[styles.statValue, mistakes >= MAX_MISTAKES && { color: '#ef4444' }]}>
                            {mistakes}/{MAX_MISTAKES}
                        </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>FILLED</Text>
                        <Text style={styles.statValue}>
                            {board.flat().filter((v) => v !== 0).length}/{SIZE * SIZE}
                        </Text>
                    </View>
                </View>

                <View style={styles.difficultyRow}>
                    {DIFFICULTIES.map((d) => (
                        <TouchableOpacity
                            key={d}
                            style={[
                                styles.difficultyButton,
                                { borderColor: DIFFICULTY_COLORS[d] },
                            ]}
                            onPress={() => startNewGame(d)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[d] }]}>
                                {d.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.boardOuter}>
                    {generating ? (
                        <View style={styles.loadingWrap}>
                            <ActivityIndicator size="large" color={ACCENT} />
                            <Text style={styles.loadingText}>Generating puzzle…</Text>
                        </View>
                    ) : (
                        <View style={styles.board}>
                            {board.map((row, r) => (
                                <View key={r} style={styles.row}>
                                    {row.map((value, c) => renderCell(value, r, c))}
                                </View>
                            ))}
                        </View>
                    )}

                    {!generating && (won || lost) && (
                        <View style={styles.overlay}>
                            <View style={styles.overlayContent}>
                                <Trophy size={34} color={won ? ACCENT : '#71717a'} strokeWidth={2.5} />
                                <Text style={[styles.overlayTitle, { color: won ? ACCENT : '#f4f4f5' }]}>
                                    {won ? 'Solved!' : 'Out of Mistakes'}
                                </Text>
                                <Text style={styles.overlaySubtitle}>
                                    {won
                                        ? 'You completed the puzzle.'
                                        : 'Better luck next time.'}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.overlayButton, styles.overlayButtonPrimary]}
                                    onPress={() => startNewGame('medium')}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.overlayButtonTextPrimary}>NEW PUZZLE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, notesMode && styles.actionButtonActive]}
                        onPress={() => setNotesMode((v) => !v)}
                        activeOpacity={0.7}
                    >
                        <Pencil size={18} color={notesMode ? ACCENT : '#a1a1aa'} strokeWidth={2.5} />
                        <Text style={[styles.actionText, notesMode && { color: ACCENT }]}>NOTES</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleErase} activeOpacity={0.7}>
                        <Eraser size={18} color="#a1a1aa" strokeWidth={2.5} />
                        <Text style={styles.actionText}>ERASE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => startNewGame('medium')}
                        activeOpacity={0.7}
                    >
                        <RotateCcw size={18} color="#a1a1aa" strokeWidth={2.5} />
                        <Text style={styles.actionText}>NEW</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.numberPad}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                        const remaining = board.flat().filter((v) => v === num).length;
                        return (
                            <TouchableOpacity
                                key={num}
                                style={styles.numberButton}
                                onPress={() => handleNumber(num)}
                                activeOpacity={0.6}
                            >
                                <Text style={styles.numberText}>{num}</Text>
                                <Text style={styles.numberRemaining}>{9 - remaining}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#09090b',
    },
    scroll: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 30,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        maxWidth: 380,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: '#18181b',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 14,
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
        fontSize: 20,
        fontWeight: '900',
        color: '#f4f4f5',
        marginTop: 4,
        fontVariant: ['tabular-nums'],
    },
    difficultyRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 14,
    },
    difficultyButton: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 10,
        backgroundColor: '#18181b',
        borderWidth: 1.5,
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    boardOuter: {
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        position: 'relative',
    },
    board: {
        flex: 1,
        backgroundColor: '#27272a',
        borderRadius: 12,
        borderWidth: 2.5,
        borderColor: '#27272a',
        padding: BOARD_PADDING,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#18181b',
        borderColor: '#3f3f46',
        borderWidth: 0.5,
    },
    cellText: {
        fontSize: CELL_SIZE * 0.5,
        fontWeight: '800',
    },
    notesGrid: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteText: {
        width: CELL_SIZE / 3,
        textAlign: 'center',
        fontSize: CELL_SIZE * 0.18,
        color: '#52525b',
        fontWeight: '600',
    },
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
    },
    loadingText: {
        color: '#71717a',
        fontSize: 14,
        fontWeight: '600',
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
        gap: 12,
        padding: 24,
    },
    overlayTitle: {
        fontSize: 28,
        fontWeight: '900',
    },
    overlaySubtitle: {
        fontSize: 13,
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
    overlayButtonTextPrimary: {
        color: '#f4f4f5',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 18,
        marginBottom: 14,
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#18181b',
        borderWidth: 1.5,
        borderColor: '#27272a',
        minWidth: 88,
    },
    actionButtonActive: {
        borderColor: '#a855f7',
        backgroundColor: '#a855f722',
    },
    actionText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#a1a1aa',
        letterSpacing: 1,
    },
    numberPad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 380,
    },
    numberButton: {
        width: '31.5%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#18181b',
        borderWidth: 1.5,
        borderColor: '#27272a',
        marginBottom: 10,
    },
    numberText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#f4f4f5',
    },
    numberRemaining: {
        fontSize: 10,
        fontWeight: '700',
        color: '#52525b',
        marginTop: 2,
    },
});

export default Sudoku;
