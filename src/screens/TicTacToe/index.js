import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import Board from './Board';
import { checkWinner, isBoardFull, getBestMove } from './minimax';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXTurn, setIsXTurn] = useState(true); // true = Human (X), false = Bot (O)
    const [winner, setWinner] = useState(null);

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
                const move = getBestMove([...board]);
                if (move !== -1) {
                    const newBoard = [...board];
                    newBoard[move] = 'O';
                    setBoard(newBoard);
                    setIsXTurn(true);
                }
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [board, isXTurn]);

    const getStatusText = () => {
        if (winner) {
            return winner === 'Draw' ? "It's a Draw! 🤝" : `${winner} Wins! 🎉`;
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
                    <Text style={[
                        styles.status,
                        winner === 'X' ? styles.statusX : winner === 'O' ? styles.statusO : null
                    ]}>
                        {getStatusText()}
                    </Text>
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
