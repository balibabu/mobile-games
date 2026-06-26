import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLOR_MAP } from './gameLogic';

const { width } = Dimensions.get('window');
const BOARD_PADDING = 20;
const PAD_GAP = 8;
const BOARD_WIDTH = Math.min(width - 40, 340);
const PAD_SIZE = (BOARD_WIDTH - BOARD_PADDING * 2 - PAD_GAP) / 2;

const PAD_LAYOUT = [
    { color: 'red', isTop: true, isLeft: true },
    { color: 'green', isTop: true, isLeft: false },
    { color: 'blue', isTop: false, isLeft: true },
    { color: 'yellow', isTop: false, isLeft: false },
];

const getRadii = (isTop, isLeft) => ({
    borderTopLeftRadius: isTop && isLeft ? 32 : 10,
    borderTopRightRadius: isTop && !isLeft ? 32 : 10,
    borderBottomLeftRadius: !isTop && isLeft ? 32 : 10,
    borderBottomRightRadius: !isTop && !isLeft ? 32 : 10,
});

const ColorPads = ({ activeColor, onPadPress, disabled }) => {
    return (
        <View style={styles.boardOuter}>
            <View style={styles.board}>
                <View style={styles.row}>
                    {PAD_LAYOUT.slice(0, 2).map(({ color, isTop, isLeft }) => {
                        const isActive = activeColor === color;
                        const colorDef = COLOR_MAP[color];
                        return (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.pad,
                                    getRadii(isTop, isLeft),
                                    {
                                        backgroundColor: isActive ? colorDef.active : colorDef.normal,
                                        opacity: disabled ? 0.4 : 1,
                                    },
                                    isActive && styles.activePad,
                                ]}
                                onPress={() => !disabled && onPadPress(color)}
                                activeOpacity={0.8}
                                disabled={disabled}
            >
              {isActive && <View style={[styles.glowRing, { shadowColor: colorDef.active }, getRadii(isTop, isLeft)]} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View style={styles.row}>
                    {PAD_LAYOUT.slice(2, 4).map(({ color, isTop, isLeft }) => {
                        const isActive = activeColor === color;
                        const colorDef = COLOR_MAP[color];
                        return (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.pad,
                                    getRadii(isTop, isLeft),
                                    {
                                        backgroundColor: isActive ? colorDef.active : colorDef.normal,
                                        opacity: disabled ? 0.4 : 1,
                                    },
                                    isActive && styles.activePad,
                                ]}
                                onPress={() => !disabled && onPadPress(color)}
                                activeOpacity={0.8}
                                disabled={disabled}
            >
              {isActive && <View style={[styles.glowRing, { shadowColor: colorDef.active }, getRadii(isTop, isLeft)]} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
            <View style={styles.centerDisc}>
                <View style={styles.centerDiscInner} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    boardOuter: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    board: {
        padding: BOARD_PADDING,
        borderRadius: 40,
        backgroundColor: '#111113',
        borderWidth: 3,
        borderColor: '#27272a',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    pad: {
        width: PAD_SIZE,
        height: PAD_SIZE,
        margin: PAD_GAP / 2,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
        overflow: 'hidden',
        position: 'relative',
    },
    activePad: {
        elevation: 16,
        shadowOpacity: 0.7,
        shadowRadius: 20,
        transform: [{ scale: 1.05 }],
    },
    glowRing: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 36,
        shadowOpacity: 0.8,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 0 },
        elevation: 20,
        backgroundColor: 'transparent',
    },
    centerDisc: {
        position: 'absolute',
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#09090b',
        borderWidth: 3,
        borderColor: '#3f3f46',
        elevation: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerDiscInner: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#18181b',
        borderWidth: 2,
        borderColor: '#52525b',
    },
});

export default ColorPads;
