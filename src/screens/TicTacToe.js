import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.min(width / 4, 120); // Responsive cell size

const TikTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXTurn, setIsXTurn] = useState(true); // true = Human (X), false = Bot (O)
    const [winner, setWinner] = useState(null);

    const winningLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6],           // diagonals
    ];

    const checkWinner = (currentBoard) => {
        for (const line of winningLines) {
            const [a, b, c] = line;
            if (
                currentBoard[a] &&
                currentBoard[a] === currentBoard[b] &&
                currentBoard[a] === currentBoard[c]
            ) {
                return currentBoard[a];
            }
        }
        return null;
    };

    const isBoardFull = (currentBoard) => currentBoard.every((cell) => cell !== null);

    // Minimax with depth for optimal (unbeatable) bot
    const minimax = (currentBoard, depth, isMaximizing) => {
        const result = checkWinner(currentBoard);

        if (result === 'O') return 10 - depth;     // Bot win
        if (result === 'X') return -10 + depth;    // Human win (delay loss)
        if (isBoardFull(currentBoard)) return 0;  // Draw

        if (isMaximizing) { // Bot (O) maximizing
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === null) {
                    currentBoard[i] = 'O';
                    const score = minimax(currentBoard, depth + 1, false);
                    currentBoard[i] = null;
                    bestScore = Math.max(bestScore, score);
                }
            }
            return bestScore;
        } else { // Human (X) minimizing
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === null) {
                    currentBoard[i] = 'X';
                    const score = minimax(currentBoard, depth + 1, true);
                    currentBoard[i] = null;
                    bestScore = Math.min(bestScore, score);
                }
            }
            return bestScore;
        }
    };

    const getBestMove = (currentBoard) => {
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === null) {
                currentBoard[i] = 'O';
                const score = minimax(currentBoard, 0, false);
                currentBoard[i] = null;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    };

    const handleCellPress = (index) => {
        if (board[index] || winner || !isXTurn) return; // Can't play if occupied, game over, or bot's turn

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

    // Bot move with slight delay for better UX
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
            // Bot's turn
            setTimeout(() => {
                const move = getBestMove([...board]); // Copy to avoid mutation issues
                if (move !== -1) {
                    const newBoard = [...board];
                    newBoard[move] = 'O';
                    setBoard(newBoard);
                    setIsXTurn(true);
                }
            }, 600);
        }
    }, [board, isXTurn]);

    const getStatusText = () => {
        if (winner) {
            return winner === 'Draw' ? "It's a Draw!" : `${winner} Wins! 🎉`;
        }
        return `Your turn (X)`;
    };

    const renderCell = (index) => (
        <TouchableOpacity
            style={styles.cell}
            onPress={() => handleCellPress(index)}
            activeOpacity={0.7}
        >
            <Text style={styles.cellText}>{board[index]}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Tic Tac Toe</Text>
            <Text style={styles.subtitle}>Human (X) vs Bot (O)</Text>

            <Text style={styles.status}>{getStatusText()}</Text>

            <View style={styles.board}>
                <View style={styles.row}>
                    {renderCell(0)}
                    {renderCell(1)}
                    {renderCell(2)}
                </View>
                <View style={styles.row}>
                    {renderCell(3)}
                    {renderCell(4)}
                    {renderCell(5)}
                </View>
                <View style={styles.row}>
                    {renderCell(6)}
                    {renderCell(7)}
                    {renderCell(8)}
                </View>
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
                <Text style={styles.resetText}>New Game</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 30,
    },
    status: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 30,
        color: '#444',
    },
    board: {
        borderWidth: 4,
        borderColor: '#333',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 40,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cellText: {
        fontSize: CELL_SIZE * 0.6,
        fontWeight: 'bold',
        color: '#333',
    },
    resetButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
    },
    resetText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default TikTacToe;