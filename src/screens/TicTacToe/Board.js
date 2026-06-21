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
            isX ? styles.cellX : value === 'O' ? styles.cellO : null
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
        <View style={styles.boardContainer}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    boardContainer: {
        borderRadius: 20,
        backgroundColor: '#18181b',
        padding: 12,
        borderWidth: 1,
        borderColor: '#27272a',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        marginBottom: 30,
    },
    board: {
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: '#09090b',
        borderWidth: 1.5,
        borderColor: '#18181b',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 4,
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
});

export default Board;
