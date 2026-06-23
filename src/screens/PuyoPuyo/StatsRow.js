import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLOR_MAP } from './constants';

const StatsRow = ({ score, level, chains, nextPair }) => {
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
                <Text style={styles.statLabel}>CHAINS</Text>
                <Text style={styles.statValue}>{chains}</Text>
            </View>
            <View style={styles.nextPieceBox}>
                <Text style={styles.nextPieceLabel}>NEXT</Text>
                <View style={styles.nextPiecePreview}>
                    {nextPair && (
                        <>
                            <View
                                style={[
                                    styles.previewCell,
                                    { backgroundColor: COLOR_MAP[nextPair.top], borderColor: '#ffffff44' },
                                ]}
                            />
                            <View
                                style={[
                                    styles.previewCell,
                                    { backgroundColor: COLOR_MAP[nextPair.bottom], borderColor: '#ffffff44' },
                                ]}
                            />
                        </>
                    )}
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
        width: 60,
    },
    nextPieceLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    nextPiecePreview: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    previewCell: {
        width: 16,
        height: 16,
        margin: 1,
        borderWidth: 0.5,
        borderRadius: 4,
    },
});

export default StatsRow;
