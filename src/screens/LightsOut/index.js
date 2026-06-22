import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ArrowLeft, RotateCcw, Zap, Trophy, TrendingUp } from 'lucide-react-native';
import { useNavigation } from '../../contexts/NavigationContext';
import { createBoard, toggleCell, isSolved, calculateMoveLimit } from './gameLogic';

const CELL_SIZE = Math.floor((Dimensions.get('window').width - 80) / 5);
const MAX_LEVEL = 10;

export default function LightsOut() {
    const { navigate } = useNavigation();
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [board, setBoard] = useState(() => createBoard());
    const [moveLimit, setMoveLimit] = useState(() => calculateMoveLimit(1));
    const [gameStatus, setGameStatus] = useState('playing');
    const [totalCleared, setTotalCleared] = useState(0);
    const timerRef = useRef(null);

    const resetGame = useCallback(() => {
        setBoard(createBoard());
        setMoves(0);
        setGameStatus('playing');
        setMoveLimit(calculateMoveLimit(level));
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    }, [level]);

    const handleAutoLevel = useCallback(() => {
        if (gameStatus !== 'playing') {return;}

        setGameStatus('transitioning');
        const nextLevel = Math.min(level + 1, MAX_LEVEL);
        setScore(prev => prev + (moveLimit - moves) * 10 + 100);
        setTotalCleared(prev => prev + 1);

        timerRef.current = setTimeout(() => {
            setLevel(nextLevel);
            setBoard(createBoard());
            setMoves(0);
            setMoveLimit(calculateMoveLimit(nextLevel));
            setGameStatus('playing');
        }, 1000);
    }, [gameStatus, level, moves, moveLimit]);

    const handleCellPress = useCallback((row, col) => {
        if (gameStatus !== 'playing') {return;}

        const newBoard = toggleCell(board, row, col);
        const newMoves = moves + 1;
        setBoard(newBoard);
        setMoves(newMoves);

        if (isSolved(newBoard)) {
            handleAutoLevel();
        } else if (newMoves >= moveLimit) {
            setGameStatus('lost');
            setScore(prev => Math.max(0, prev - 50));
        }
    }, [board, moves, moveLimit, gameStatus, handleAutoLevel]);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate('Home')} style={styles.backButton}>
                    <ArrowLeft size={20} color="#f4f4f5" />
                </TouchableOpacity>
                <Text style={styles.title}>Lights Out</Text>
                <View style={styles.backButton} />
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Zap size={16} color="#facc15" strokeWidth={2.5} />
                    <Text style={styles.statLabel}>SCORE</Text>
                    <Text style={styles.statValue}>{score}</Text>
                </View>
                <View style={styles.statItem}>
                    <Trophy size={16} color="#f4f4f5" strokeWidth={2.5} />
                    <Text style={styles.statLabel}>LEVEL</Text>
                    <Text style={styles.statValue}>{level}/{MAX_LEVEL}</Text>
                </View>
                <View style={styles.statItem}>
                    <TrendingUp size={16} color="#10b981" strokeWidth={2.5} />
                    <Text style={styles.statLabel}>CLEARED</Text>
                    <Text style={styles.statValue}>{totalCleared}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.infoText}>Moves: <Text style={[styles.infoValue, moves >= moveLimit ? styles.dangerText : {}]}>{moves}/{moveLimit}</Text></Text>
            </View>

            <View style={styles.boardContainer}>
                {gameStatus === 'lost' ? (
                    <View style={styles.overlay}>
                        <Text style={styles.overlayTitle}>Game Over</Text>
                        <Text style={styles.overlayText}>No more moves left</Text>
                        <TouchableOpacity onPress={resetGame} style={styles.overlayButton}>
                            <Text style={styles.overlayButtonText}>TRY AGAIN</Text>
                        </TouchableOpacity>
                    </View>
                ) : gameStatus === 'transitioning' ? (
                    <View style={styles.overlay}>
                        <Text style={styles.overlayTitle}>Level Complete!</Text>
                        <Text style={styles.overlayText}>Leveling up...</Text>
                    </View>
                ) : (
                    <View style={styles.board}>
                        {board.map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.row}>
                                {row.map((isOn, colIndex) => (
                                    <TouchableOpacity
                                        key={colIndex}
                                        style={[
                                            styles.cell,
                                            isOn ? styles.cellOn : styles.cellOff
                                        ]}
                                        onPress={() => handleCellPress(rowIndex, colIndex)}
                                        activeOpacity={0.7}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.controlsContainer}>
                <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
                    <RotateCcw size={16} color="#f4f4f5" strokeWidth={2} />
                    <Text style={styles.resetText}>RESET BOARD</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Turn off all the lights to advance!</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09090b',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 4,
        paddingTop: 12,
        paddingBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#f4f4f5',
        letterSpacing: 0.5,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingVertical: 12,
        marginBottom: 8,
    },
    statItem: {
        alignItems: 'center',
        backgroundColor: '#18181b',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#27272a',
        minWidth: 100,
        flex: 1,
        marginHorizontal: 4,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1.5,
        marginTop: 4,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#f4f4f5',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#71717a',
    },
    infoValue: {
        color: '#f4f4f5',
    },
    dangerText: {
        color: '#ef4444',
    },
    boardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    board: {
        borderWidth: 1,
        borderColor: '#27272a',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#18181b',
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        margin: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    cellOn: {
        backgroundColor: '#facc15',
        shadowColor: '#facc15',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 6,
    },
    cellOff: {
        backgroundColor: '#27272a',
    },
    overlay: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    overlayTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#f4f4f5',
        marginBottom: 8,
    },
    overlayText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#71717a',
        marginBottom: 24,
    },
    overlayButton: {
        backgroundColor: '#18181b',
        borderWidth: 1.5,
        borderColor: '#27272a',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    overlayButtonText: {
        color: '#f4f4f5',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    controlsContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 16,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#18181b',
        borderWidth: 1.5,
        borderColor: '#27272a',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    resetText: {
        color: '#f4f4f5',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    footer: {
        padding: 16,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#52525b',
        fontWeight: '600',
    },
});