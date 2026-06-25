import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Handshake, PartyPopper } from 'lucide-react-native';
import Header from '../../components/Header';
import Board from './Board';
import { checkWinner, isBoardFull, getBestMove, getRandomMove } from './minimax';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXTurn, setIsXTurn] = useState(true); // true = Human (X), false = Bot (O)
    const [winner, setWinner] = useState(null);
    const [difficulty, setDifficulty] = useState('Hard'); // 'Easy', 'Medium', 'Hard'

    const handleCellPress = (index) => {
        if (board[index] || winner || !isXTurn) return;

        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);
        setIsXTurn(false);
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXTurn(true);
        setWinner(null);
    };

    const changeDifficulty = (newDiff) => {
        setDifficulty(newDiff);
        setBoard(Array(9).fill(null));
        setIsXTurn(true);
        setWinner(null);
    };

    useEffect(() => {
        const currentWinner = checkWinner(board);
        if (currentWinner) {
            setWinner(currentWinner);
            return;
        }

        if (isBoardFull(board)) {
            setWinner('Draw');
            return;
        }

        if (!isXTurn) {
            const timer = setTimeout(() => {
                const botMovesCount = board.filter((cell) => cell === 'O').length;
                let move;
                if (difficulty === 'Easy' && botMovesCount < 2) {
                    move = getRandomMove([...board]);
                } else if (difficulty === 'Medium' && botMovesCount < 1) {
                    move = getRandomMove([...board]);
                } else {
                    move = getBestMove([...board]);
                }

                if (move !== -1) {
                    const newBoard = [...board];
                    newBoard[move] = 'O';
                    setBoard(newBoard);
                    setIsXTurn(true);
                }
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [board, isXTurn, difficulty]);

    const getStatusText = () => {
        if (winner) {
            if (winner === 'Draw') {
                return (
                    <View style={styles.statusRow}>
                        <Text style={styles.status}>It's a Draw! </Text>
                        <Handshake size={22} color="#a1a1aa" strokeWidth={2} />
                    </View>
                );
            }
            return (
                <View style={styles.statusRow}>
                    <Text style={[styles.status, winner === 'X' ? styles.statusX : styles.statusO]}>
                        {winner} Wins!{' '}
                    </Text>
                    <PartyPopper size={22} color={winner === 'X' ? '#ef4444' : '#3b82f6'} strokeWidth={2} />
                </View>
            );
        }
        return isXTurn ? "Your Turn (X)" : "Bot Thinking (O)...";
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <Header title="Tic-Tac-Toe" />
            <View style={styles.container}>
                <Text style={styles.subtitle}>HUMAN (X) VS BOT (O)</Text>

                <View style={styles.statusContainer}>
                    <Text style={styles.subtitle}>{getStatusText()}</Text>
                </View>

                <View style={styles.difficultyContainer}>
                    {['Easy', 'Medium', 'Hard'].map((diff) => (
                        <TouchableOpacity
                            key={diff}
                            style={[
                                styles.difficultyButton,
                                difficulty === diff && styles.difficultyButtonActive,
                            ]}
                            onPress={() => changeDifficulty(diff)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.difficultyButtonText,
                                    difficulty === diff && styles.difficultyButtonTextActive,
                                ]}
                            >
                                {diff.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Board board={board} onCellPress={handleCellPress} />

                <TouchableOpacity style={styles.resetButton} onPress={resetGame} activeOpacity={0.8}>
                    <Text style={styles.resetText}>NEW GAME</Text>
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
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 2,
        marginBottom: 8,
    },
    statusContainer: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    status: {
        fontSize: 22,
        fontWeight: '900',
        color: '#f4f4f5',
        letterSpacing: 0.5,
    },
    statusX: {
        color: '#ef4444',
    },
    statusO: {
        color: '#3b82f6',
    },
    difficultyContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#27272a',
    },
    difficultyButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#18181b',
    },
    difficultyButtonActive: {
        backgroundColor: '#27272a',
    },
    difficultyButtonText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1,
    },
    difficultyButtonTextActive: {
        color: '#f4f4f5',
    },
    resetButton: {
        backgroundColor: '#18181b',
        borderWidth: 1.5,
        borderColor: '#27272a',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 12,
        elevation: 2,
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
});

export default TicTacToe;
