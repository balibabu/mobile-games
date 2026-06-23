import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE, COLOR_MAP } from './constants';

const GameBoard = ({ displayGrid, currentPair, isPaused, gameOver, score, chainPop, togglePause, resetGame }) => {
    return (
        <View style={styles.gameContainer}>
            <View style={styles.board}>
                {displayGrid.map((row, rIdx) => (
                    <View key={rIdx} style={styles.row}>
                        {row.map((cellColor, cIdx) => (
                            <View
                                key={cIdx}
                                style={[
                                    styles.cell,
                                    {
                                        backgroundColor: cellColor ? COLOR_MAP[cellColor] || cellColor : '#09090b',
                                        borderColor: cellColor ? 'rgba(255, 255, 255, 0.25)' : '#111115',
                                    },
                                ]}
                            >
                                {cellColor ? <View style={styles.cellHighlight} /> : null}
                            </View>
                        ))}
                    </View>
                ))}

                {chainPop > 0 && !isPaused && !gameOver && (
                    <View style={styles.chainOverlay}>
                        <Text style={styles.chainText}>{chainPop}x CHAIN!</Text>
                    </View>
                )}

                {isPaused && !gameOver && (
                    <View style={styles.overlay}>
                        <Text style={styles.overlayText}>PAUSED</Text>
                        <TouchableOpacity style={styles.overlayButton} onPress={togglePause}>
                            <Text style={styles.overlayButtonText}>RESUME</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {gameOver && (
                    <View style={styles.overlay}>
                        <Text style={[styles.overlayText, { color: '#ef4444' }]}>GAME OVER</Text>
                        <Text style={styles.finalScoreText}>Final Score: {score}</Text>
                        <TouchableOpacity style={styles.overlayButton} onPress={resetGame}>
                            <Text style={styles.overlayButtonText}>PLAY AGAIN</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    gameContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    board: {
        width: BOARD_WIDTH,
        height: BOARD_HEIGHT,
        backgroundColor: '#09090b',
        borderWidth: 4,
        borderColor: '#18181b',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderWidth: 0.5,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellHighlight: {
        width: CELL_SIZE * 0.35,
        height: CELL_SIZE * 0.35,
        borderRadius: CELL_SIZE * 0.2,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        position: 'absolute',
        top: CELL_SIZE * 0.15,
        left: CELL_SIZE * 0.15,
    },
    chainOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(9, 9, 11, 0.6)',
    },
    chainText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#eab308',
        letterSpacing: 2,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(9, 9, 11, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#f4f4f5',
        letterSpacing: 2,
        marginBottom: 10,
    },
    finalScoreText: {
        fontSize: 18,
        color: '#a1a1aa',
        marginBottom: 20,
        fontWeight: '600',
    },
    overlayButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        elevation: 4,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    overlayButtonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 1,
    },
});

export default GameBoard;
