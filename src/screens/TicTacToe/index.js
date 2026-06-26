import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Brain, RotateCcw } from 'lucide-react-native';
import Header from '../../components/Header';
import Board from './Board';
import { checkWinner, isBoardFull, getBestMove, getRandomMove } from './minimax';

const TicTacToe = () => {
    const [gameMode, setGameMode] = useState('bot'); // 'bot' or 'human'
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXTurn, setIsXTurn] = useState(true);
    const [winner, setWinner] = useState(null);
    const [difficulty, setDifficulty] = useState('Medium'); // 'Easy', 'Medium', 'Hard'

    const handleCellPress = (index) => {
        if (board[index] || winner) return;
        if (gameMode === 'bot' && !isXTurn) return;

        const marker = isXTurn ? 'X' : 'O';
        const newBoard = [...board];
        newBoard[index] = marker;
        setBoard(newBoard);
        setIsXTurn(!isXTurn);
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXTurn(true);
        setWinner(null);
    };

    const changeDifficulty = (newDiff) => {
        setDifficulty(newDiff);
        resetGame();
    };

    const toggleGameMode = (mode) => {
        setGameMode(mode);
        resetGame();
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

        if (gameMode === 'bot' && !isXTurn && !winner) {
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
    }, [board, isXTurn, difficulty, gameMode, winner]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <Header title="Tic Tac Toe" />

            <View style={styles.container}>
                <View style={styles.topControls}>
                    <View style={styles.modeContainer}>
                        <TouchableOpacity
                            style={[styles.modeButton, gameMode === 'human' && styles.modeButtonActive]}
                            onPress={() => toggleGameMode('human')}
                            activeOpacity={0.7}
                        >
                            <Users
                                size={20}
                                color={gameMode === 'human' ? '#f4f4f5' : '#71717a'}
                                strokeWidth={2.5}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modeButton, gameMode === 'bot' && styles.modeButtonActive]}
                            onPress={() => toggleGameMode('bot')}
                            activeOpacity={0.7}
                        >
                            <Brain
                                size={20}
                                color={gameMode === 'bot' ? '#f4f4f5' : '#71717a'}
                                strokeWidth={2.5}
                            />
                        </TouchableOpacity>
                    </View>

                    {gameMode === 'bot' && (
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
                    )}
                </View>

                <Board board={board} onCellPress={handleCellPress} />

                {winner && (
                    <View style={styles.overlay}>
                        <View style={styles.overlayContent}>
                            <Text style={[styles.winnerText, winner === 'X' ? styles.xColor : winner === 'Draw' ? styles.drawColor : styles.oColor]}>
                                {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}
                            </Text>
                            <TouchableOpacity style={styles.playAgainButton} onPress={resetGame} activeOpacity={0.8}>
                                <RotateCcw size={18} color="#f4f4f5" strokeWidth={2.5} />
                                <Text style={styles.playAgainText}>PLAY AGAIN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    },
    topControls: {
        position: 'absolute',
        top: 16,
        alignItems: 'center',
        gap: 16,
    },
    modeContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#27272a',
    },
    modeButton: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: '#18181b',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modeButtonActive: {
        backgroundColor: '#27272a',
    },
    difficultyContainer: {
        flexDirection: 'row',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#27272a',
    },
    difficultyButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: '#18181b',
    },
    difficultyButtonActive: {
        backgroundColor: '#27272a',
    },
    difficultyButtonText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1,
    },
    difficultyButtonTextActive: {
        color: '#f4f4f5',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(9, 9, 11, 0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    overlayContent: {
        alignItems: 'center',
        gap: 20,
    },
    winnerText: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    xColor: {
        color: '#ef4444',
    },
    oColor: {
        color: '#3b82f6',
    },
    drawColor: {
        color: '#f4f4f5',
    },
    playAgainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#18181b',
        borderWidth: 1.5,
        borderColor: '#27272a',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 10,
    },
    playAgainText: {
        color: '#f4f4f5',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
});

export default TicTacToe;
