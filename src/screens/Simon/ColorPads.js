import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLOR_MAP } from './gameLogic';

const { width } = Dimensions.get('window');
const PAD_GAP = 10;
const BOARD_PADDING = 16;
const PAD_SIZE = Math.min((width - 64 - PAD_GAP) / 2, 150);

const ColorPads = ({ activeColor, onPadPress, disabled }) => {
    const renderPad = (color, index) => {
        const isActive = activeColor === color;
        const colorDef = COLOR_MAP[color];
        const isTopRow = index < 2;
        const isLeftCol = index % 2 === 0;

        return (
            <TouchableOpacity
                key={color}
                style={[
                    styles.pad,
                    {
                        backgroundColor: isActive ? colorDef.active : colorDef.normal,
                        borderColor: colorDef.border,
                        borderTopLeftRadius: isTopRow && isLeftCol ? 24 : 8,
                        borderTopRightRadius: isTopRow && !isLeftCol ? 24 : 8,
                        borderBottomLeftRadius: !isTopRow && isLeftCol ? 24 : 8,
                        borderBottomRightRadius: !isTopRow && !isLeftCol ? 24 : 8,
                        opacity: disabled ? 0.5 : 1,
                    },
                    isActive && styles.activePad,
                ]}
                onPress={() => !disabled && onPadPress(color)}
                activeOpacity={0.7}
                disabled={disabled}
            />
        );
    };

    return (
        <View style={styles.board}>
            <View style={styles.row}>
                {['red', 'green'].map((color, i) => renderPad(color, i))}
            </View>
            <View style={styles.row}>
                {['blue', 'yellow'].map((color, i) => renderPad(color, i + 2))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    board: {
        backgroundColor: '#18181b',
        padding: BOARD_PADDING,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#27272a',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    pad: {
        width: PAD_SIZE,
        height: PAD_SIZE,
        margin: PAD_GAP / 2,
        borderWidth: 2,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    activePad: {
        elevation: 8,
        shadowOpacity: 0.6,
        shadowRadius: 8,
    },
});

export default ColorPads;
