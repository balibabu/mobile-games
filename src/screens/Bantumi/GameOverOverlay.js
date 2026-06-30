import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { COLORS, TIMING } from './constants';
import styles from './styles';

export default function GameOverOverlay({ winner, playerScore, botScore, onPlayAgain, gameMode }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: TIMING.overlayFadeIn,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: TIMING.overlaySlideIn,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const isPlayerWin = winner === 'Player';
    const isBotWin = winner === 'Bot';
    const accentColor = isPlayerWin ? COLORS.player : isBotWin ? COLORS.bot : COLORS.turn;

    const playerLabel = gameMode === 'human' ? 'P1' : 'You';
    const botLabel = gameMode === 'human' ? 'P2' : 'Bot';

    let titleText;
    if (winner === 'Draw') {
        titleText = 'Draw!';
    } else if (gameMode === 'human') {
        titleText = isPlayerWin ? 'P1 Wins!' : 'P2 Wins!';
    } else {
        titleText = isPlayerWin ? 'You Win!' : 'Bot Wins!';
    }

    return (
        <View style={styles.overlayBackground}>
            <Animated.View
                style={[
                    styles.overlayCard,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <View style={[styles.overlayAccent, { backgroundColor: accentColor }]} />
                <Text style={[styles.overlayTitle, { color: accentColor }]}>
                    {titleText}
                </Text>

                <View style={styles.scoresRow}>
                    <View style={styles.scoreBox}>
                        <Text style={styles.scoreLabel}>{playerLabel}</Text>
                        <Text style={[styles.scoreValue, { color: COLORS.player }]}>{playerScore}</Text>
                    </View>
                    <View style={styles.scoreDivider}>
                        <Text style={styles.scoreVs}>vs</Text>
                    </View>
                    <View style={styles.scoreBox}>
                        <Text style={styles.scoreLabel}>{botLabel}</Text>
                        <Text style={[styles.scoreValue, { color: COLORS.bot }]}>{botScore}</Text>
                    </View>
                </View>

                <TouchableOpacity style={[styles.playAgainButton, { borderColor: accentColor }]} onPress={onPlayAgain}>
                    <Text style={[styles.playAgainText, { color: accentColor }]}>Play Again</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
