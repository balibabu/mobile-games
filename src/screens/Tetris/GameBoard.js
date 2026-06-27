import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BOARD_WIDTH_PCT, CELL_WIDTH_PCT, CELL_HEIGHT_PCT, BOARD_COLS, BOARD_ROWS } from './constants';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const GameBoard = ({ displayGrid, isPaused, gameOver, score, togglePause, resetGame }) => {
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
                                        backgroundColor: cellColor || '#09090b',
                                        borderColor: cellColor ? 'rgba(255, 255, 255, 0.25)' : '#111115',
                                    },
                                ]}
                            />
                        ))}
                    </View>
                ))}

                {/* Pause Overlay */}
                {isPaused && !gameOver && (
                    <View style={styles.overlay}>
                        <Text style={styles.overlayText}>PAUSED</Text>
                        <TouchableOpacity style={styles.overlayButton} onPress={togglePause}>
                            <Text style={styles.overlayButtonText}>RESUME</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Game Over Overlay */}
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
        width: BOARD_WIDTH_PCT + '%',
        aspectRatio: BOARD_COLS / BOARD_ROWS,
        backgroundColor: '#09090b',
        borderWidth: 4,
        borderColor: '#18181b',
        borderRadius: 8,
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
        height: CELL_HEIGHT_PCT + '%',
    },
    cell: {
        width: CELL_WIDTH_PCT + '%',
        height: '100%',
        borderWidth: 0.5,
        borderRadius: 2,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(9, 9, 11, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayText: {
        fontSize: screenHeight * 0.04,
        fontWeight: '900',
        color: '#f4f4f5',
        letterSpacing: 2,
        marginBottom: screenHeight * 0.012,
    },
    finalScoreText: {
        fontSize: screenHeight * 0.022,
        color: '#a1a1aa',
        marginBottom: screenHeight * 0.025,
        fontWeight: '600',
    },
    overlayButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: screenWidth * 0.06,
        paddingVertical: screenHeight * 0.015,
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
        fontSize: screenHeight * 0.018,
        letterSpacing: 1,
    },
});

export default GameBoard;
