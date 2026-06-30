import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { COLORS, TIMING } from './constants';
import styles from './styles';

export default function Pit({ gems, index, pitSize, isPlayer, disabled, onPress, highlight }) {
    const isEmpty = gems === 0;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const prevHighlight = useRef(false);

    useEffect(() => {
        if (highlight && !prevHighlight.current) {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.5,
                    duration: TIMING.pitPulseOut,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: TIMING.pitPulseIn,
                    useNativeDriver: true,
                }),
            ]).start();
        }
        prevHighlight.current = highlight;
    }, [highlight]);

    return (
        <TouchableOpacity
            activeOpacity={0.5}
            disabled={disabled || isEmpty}
            onPress={() => onPress(index)}
            style={[
                styles.cell,
                {
                    width: pitSize,
                    height: pitSize,
                    opacity: isEmpty ? 0.3 : 1,
                    backgroundColor: !isPlayer ? '#111111' : undefined,
                },
            ]}
        >
            <Animated.Text
                style={[
                    styles.cellNumber,
                    {
                        color: isPlayer ? COLORS.player : COLORS.bot,
                        fontSize: pitSize * 0.45,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {gems}
            </Animated.Text>
        </TouchableOpacity>
    );
}
