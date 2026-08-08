import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Animated, Easing } from 'react-native';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.min(width / 4.2, 110);
const BORDER = 4;
const LINE_THICKNESS = 8;

// Keep this in sync with the delay used before showing the win overlay.
export const WIN_LINE_ANIMATION_DURATION = 500;

const cellCenter = (index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    return {
        x: (col + 0.5) * CELL_SIZE + col * BORDER,
        y: (row + 0.5) * CELL_SIZE + row * BORDER,
    };
};

const Board = ({ board, onCellPress, winningLine }) => {
    const scale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (winningLine) {
            scale.setValue(0);
            Animated.timing(scale, {
                toValue: 1,
                duration: WIN_LINE_ANIMATION_DURATION,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        } else {
            scale.setValue(0);
        }
    }, [winningLine, scale]);

    const renderCell = (index) => {
        const value = board[index];
        const isX = value === 'X';

        const cellStyle = [
            styles.cell,
            index % 3 !== 2 && styles.cellRightBorder,
        ];

        return (
            <TouchableOpacity
                key={index}
                style={cellStyle}
                onPress={() => onCellPress(index)}
                activeOpacity={0.7}
            >
                <Text style={[styles.cellText, isX ? styles.textX : styles.textO]}>
                    {value}
                </Text>
            </TouchableOpacity>
        );
    };

    let lineProps = null;
    if (winningLine) {
        const start = cellCenter(winningLine[0]);
        const end = cellCenter(winningLine[2]);
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const marker = board[winningLine[0]];
        const color = marker === 'X' ? '#ef4444' : '#3b82f6';
        lineProps = { length, angleDeg, midX, midY, color };
    }

    return (
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

            <View style={styles.lastRow}>
                {renderCell(6)}
                {renderCell(7)}
                {renderCell(8)}
            </View>

            {lineProps && (
                <View style={styles.lineLayer} pointerEvents="none">
                    <Animated.View
                        style={[
                            styles.line,
                            {
                                width: lineProps.length,
                                left: lineProps.midX - lineProps.length / 2,
                                top: lineProps.midY - LINE_THICKNESS / 2,
                                backgroundColor: lineProps.color,
                                shadowColor: lineProps.color,
                                transform: [
                                    { rotate: `${lineProps.angleDeg}deg` },
                                    { scaleX: scale },
                                ],
                            },
                        ]}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    lastRow: {
        flexDirection: 'row',
    },
    board: {
        overflow: 'hidden',
        marginBottom: 30,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: '#09090b',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cellX: {
        borderColor: '#ef444433',
    },
    cellO: {
        borderColor: '#3b82f633',
    },
    cellText: {
        fontSize: CELL_SIZE * 0.5,
        fontWeight: '900',
    },
    textX: {
        color: '#ef4444',
        textShadowColor: '#ef444455',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    textO: {
        color: '#3b82f6',
        textShadowColor: '#3b82f655',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: BORDER,
        borderBottomColor: '#27272a',
    },
    cellRightBorder: {
        borderRightWidth: BORDER,
        borderRightColor: '#27272a',
    },
    lineLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    line: {
        position: 'absolute',
        height: LINE_THICKNESS,
        borderRadius: LINE_THICKNESS / 2,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
        elevation: 6,
    },
});

export default Board;
