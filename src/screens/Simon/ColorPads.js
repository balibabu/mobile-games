// src/screens/Simon/ColorPads.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

const COLOR_MAP = {
    red: { bg: '#ef4444', active: '#fca5a5' },
    green: { bg: '#10b981', active: '#6ee7b7' },
    blue: { bg: '#3b82f6', active: '#93c5fd' },
    yellow: { bg: '#f59e0b', active: '#fde68a' },
};

const ColorPads = ({ activeColor, onPadPress, disabled }) => {
    const renderButton = (color) => {
        const config = COLOR_MAP[color];
        const isActive = activeColor === color;
        return (
            <TouchableOpacity
                activeOpacity={0.4}
                disabled={disabled}
                onPress={() => onPadPress(color)}
                style={[
                    styles.pad,
                    {
                        backgroundColor: isActive ? config.active : config.bg,
                        shadowColor: config.bg,
                        shadowOpacity: isActive ? 0.8 : 0.3,
                        shadowRadius: isActive ? 24 : 12,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: isActive ? 12 : 6,
                    },
                ]}
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {renderButton('red')}
                {renderButton('green')}
            </View>
            <View style={styles.row}>
                {renderButton('blue')}
                {renderButton('yellow')}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
    },
    row: {
        flexDirection: 'row',
        gap: 18,
    },
    pad: {
        width: 132,
        height: 132,
        borderRadius: 66,
        borderWidth: 4,
        borderColor: '#18181b',
    },
});

export default ColorPads;
