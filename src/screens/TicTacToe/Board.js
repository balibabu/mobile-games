import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.min(width / 4.2, 110);

const Board = ({ board, onCellPress }) => {
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
        borderBottomWidth: 4,
        borderBottomColor: '#27272a',
    },
    cellRightBorder: {
        borderRightWidth: 4,
        borderRightColor: '#27272a',
    },
});

export default Board;
