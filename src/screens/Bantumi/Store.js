import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { COLORS, TIMING } from './constants';
import styles from './styles';

export default function Store({ gems, label, width, height, isPlayer, highlight }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const prevHighlight = useRef(false);

    useEffect(() => {
        if (highlight && !prevHighlight.current) {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 3,
                    duration: TIMING.storePulseOut,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: TIMING.storePulseIn,
                    useNativeDriver: true,
                }),
            ]).start();
        }
        prevHighlight.current = highlight;
    }, [highlight]);

    return (
        <View
            style={[
                styles.store,
                { width, height },
                { borderColor: isPlayer ? COLORS.playerBorder : COLORS.botBorder },
            ]}
        >
            <Text style={styles.storeLabel}>{label}</Text>
            <Animated.Text
                style={[
                    styles.storeValue,
                    {
                        color: isPlayer ? COLORS.player : COLORS.bot,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {gems}
            </Animated.Text>
        </View>
    );
}
