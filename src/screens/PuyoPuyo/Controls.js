import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
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
            <View style={styles.gamePadRow}>
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.hardDropBtn]}
                        onPress={hardDrop}
                        activeOpacity={0.5}
                    >
                        <ArrowBigDown size={24} color="#f4f4f5" strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>

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
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    controlsContainer: {
        width: '95%',
        alignItems: 'center',
        paddingVertical: '1%',
    },
    gamePadRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dPad: {
        width: '50%',
        alignItems: 'center',
    },
    dPadRow: {
        flexDirection: 'row',
    },
    dPadSpacer: {
        width: '30%',
        aspectRatio: 1,
    },
    dPadButton: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: '#27272a',
        borderRadius: '10%',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '2%',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: '2%' },
        shadowOpacity: 0.25,
        shadowRadius: '3%',
    },
    actionButtonsContainer: {
        flex: 1,
        alignItems: 'flex-start',
        paddingLeft: '2.5%',
        height: '60%',
    },
    actionButton: {
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: '#27272a',
        borderRadius: '10%',
        paddingVertical: '4%',
        paddingHorizontal: '10%',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: '2%' },
        shadowOpacity: 0.25,
        shadowRadius: '3%',
    },
    hardDropBtn: {
        borderColor: '#3b82f644',
        borderWidth: 1.5,
        width: '50%',
        flex: 1,
    },
});

export default Controls;
