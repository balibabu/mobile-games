import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SHAPES } from './constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const StatsRow = ({ score, level, lines, nextPieceKey }) => {
    const nextPiece = SHAPES[nextPieceKey];

    return (
        <View style={styles.topStatsRow}>
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>SCORE</Text>
                <Text style={styles.statValue}>{score}</Text>
            </View>
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>LEVEL</Text>
                <Text style={styles.statValue}>{level}</Text>
            </View>
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>LINES</Text>
                <Text style={styles.statValue}>{lines}</Text>
            </View>
            <View style={styles.nextPieceBox}>
                <Text style={styles.nextPieceLabel}>NEXT</Text>
                <View style={styles.nextPiecePreview}>
                    {nextPiece && nextPiece.matrix.map((row, rIdx) => (
                        <View key={rIdx} style={styles.previewRow}>
                            {row.map((cell, cIdx) => (
                                <View
                                    key={cIdx}
                                    style={[
                                        styles.previewCell,
                                        {
                                            backgroundColor: cell
                                                ? nextPiece.color
                                                : 'transparent',
                                            borderColor: cell ? '#ffffff44' : 'transparent',
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    topStatsRow: {
        flexDirection: 'row',
        width: '94%',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#18181b',
        paddingVertical: screenHeight * 0.015,
        paddingHorizontal: screenWidth * 0.04,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: screenHeight * 0.012,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: screenHeight * 0.012,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1.5,
    },
    statValue: {
        fontSize: screenHeight * 0.021,
        fontWeight: '900',
        color: '#f4f4f5',
        marginTop: screenHeight * 0.005,
    },
    nextPieceBox: {
        alignItems: 'center',
        paddingLeft: screenWidth * 0.03,
        borderLeftWidth: 1,
        borderLeftColor: '#27272a',
        width: '20%',
    },
    nextPieceLabel: {
        fontSize: screenHeight * 0.012,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1.5,
        marginBottom: screenHeight * 0.005,
    },
    nextPiecePreview: {
        width: screenWidth * 0.11,
        height: screenWidth * 0.11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewRow: {
        flexDirection: 'row',
    },
    previewCell: {
        width: screenWidth * 0.023,
        height: screenWidth * 0.023,
        margin: screenWidth * 0.0025,
        borderWidth: 0.5,
        borderRadius: 2,
    },
});

export default StatsRow;
