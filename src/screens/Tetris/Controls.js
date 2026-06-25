import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RotateCw, ArrowLeft, ArrowDown, ArrowRight, ArrowBigDown } from 'lucide-react-native';

const Controls = ({
    rotate,
    moveLeft,
    moveDown,
    moveRight,
    hardDrop,
}) => {
    const iconColor = '#a1a1aa';

    return (
        <View style={styles.controlsContainer}>

            {/* Joystick/GamePad layout */}
            <View style={styles.gamePadRow}>
                {/* D-PAD Left Side */}
                <View style={styles.dPad}>
                    <View style={styles.dPadRow}>
                        <View style={styles.dPadSpacer} />
                        <TouchableOpacity
                            style={styles.dPadButton}
                            onPress={rotate}
                            activeOpacity={0.7}
                        >
                            <RotateCw size={20} color={iconColor} strokeWidth={2.5} />
                        </TouchableOpacity>
                        <View style={styles.dPadSpacer} />
                    </View>
                    <View style={styles.dPadRow}>
                        <TouchableOpacity
                            style={styles.dPadButton}
                            onPress={moveLeft}
                            activeOpacity={0.7}
                        >
                            <ArrowLeft size={20} color={iconColor} strokeWidth={2.5} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.dPadButton}
                            onPress={moveDown}
                            activeOpacity={0.7}
                        >
                            <ArrowDown size={20} color={iconColor} strokeWidth={2.5} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.dPadButton}
                            onPress={moveRight}
                            activeOpacity={0.7}
                        >
                            <ArrowRight size={20} color={iconColor} strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Drop Buttons Right Side */}
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.hardDropBtn]}
                        onPress={hardDrop}
                        activeOpacity={0.7}
                    >
                        <ArrowBigDown size={24} color="#f4f4f5" strokeWidth={2.5} />
                        <Text style={styles.actionButtonLabel}>HARD DROP</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    controlsContainer: {
        width: '94%',
        alignItems: 'center',
        paddingBottom: 5,
        marginTop: 10,
    },
    gameActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    gameActionButton: {
        backgroundColor: '#18181b',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        flex: 0.48,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    gameActionButtonText: {
        color: '#f4f4f5',
        fontWeight: '800',
        fontSize: 12,
        letterSpacing: 1.5,
    },
    gamePadRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dPad: {
        width: 160,
        alignItems: 'center',
    },
    dPadRow: {
        flexDirection: 'row',
    },
    dPadSpacer: {
        width: 48,
        height: 48,
    },
    dPadButton: {
        width: 48,
        height: 48,
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: '#27272a',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    dPadArrow: {
        fontSize: 18,
    },
    actionButtonsContainer: {
        flex: 1,
        alignItems: 'flex-end',
        paddingRight: 10,
    },
    actionButton: {
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: '#27272a',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    hardDropBtn: {
        borderColor: '#3b82f644',
        borderWidth: 1.5,
        width: 110,
    },
    actionButtonText: {
        fontSize: 24,
    },
    actionButtonLabel: {
        fontSize: 8,
        fontWeight: '800',
        color: '#71717a',
        marginTop: 4,
        letterSpacing: 0.5,
    },
});

export default Controls;
