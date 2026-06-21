import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SHAPES } from './constants';

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
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 10,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1.5,
    },
    statValue: {
        fontSize: 17,
        fontWeight: '900',
        color: '#f4f4f5',
        marginTop: 4,
    },
    nextPieceBox: {
        alignItems: 'center',
        paddingLeft: 12,
        borderLeftWidth: 1,
        borderLeftColor: '#27272a',
        width: 80,
    },
    nextPieceLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    nextPiecePreview: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewRow: {
        flexDirection: 'row',
    },
    previewCell: {
        width: 9,
        height: 9,
        margin: 1,
        borderWidth: 0.5,
        borderRadius: 2,
    },
});

export default StatsRow;
