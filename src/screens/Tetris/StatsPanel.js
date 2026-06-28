import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SHAPES } from './constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const StatsPanel = ({ score, level, lines, nextPieceKey }) => {
    const nextPiece = SHAPES[nextPieceKey];

    return (
        <View style={styles.panel}>
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
    panel: {
        width: '28%',
        height: '80%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: '#18181b',
        borderRadius: screenWidth * 0.02,
        borderWidth: 1,
        borderColor: '#27272a',
        marginLeft: '2%',
        paddingVertical: '3%',
    },
    statBox: {
        alignItems: 'center',
        width: '100%',
        paddingVertical: '2%',
    },
    statLabel: {
        fontSize: screenWidth * 0.028,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1.5,
    },
    statValue: {
        fontSize: screenWidth * 0.045,
        fontWeight: '900',
        color: '#f4f4f5',
        marginTop: screenHeight * 0.005,
    },
    nextPieceBox: {
        alignItems: 'center',
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#27272a',
        paddingTop: '3%',
    },
    nextPieceLabel: {
        fontSize: screenWidth * 0.028,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1.5,
        marginBottom: screenHeight * 0.005,
    },
    nextPiecePreview: {
        width: '70%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewRow: {
        flexDirection: 'row',
    },
    previewCell: {
        width: '20%',
        aspectRatio: 1,
        margin: '1%',
        borderWidth: 0.5,
        borderRadius: 2,
    },
});

export default StatsPanel;
