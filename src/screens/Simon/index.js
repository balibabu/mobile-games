import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react-native';
import Sound from 'react-native-sound';
import Header from '../../components/Header';
import ColorPads from './ColorPads';
import { extendSequence, COLOR_MAP, COLORS } from './gameLogic';

const soundFiles = {
    red: new Sound('red.mp3', Sound.MAIN_BUNDLE, (e) => { if (e) console.log('red sound error', e); }),
    green: new Sound('green.mp3', Sound.MAIN_BUNDLE, (e) => { if (e) console.log('green sound error', e); }),
    blue: new Sound('blue.mp3', Sound.MAIN_BUNDLE, (e) => { if (e) console.log('blue sound error', e); }),
    yellow: new Sound('yellow.mp3', Sound.MAIN_BUNDLE, (e) => { if (e) console.log('yellow sound error', e); }),
    wrong: new Sound('wrong.mp3', Sound.MAIN_BUNDLE, (e) => { if (e) console.log('wrong sound error', e); }),
};

const Simon = () => {
    const [sequence, setSequence] = useState([]);
    const [playerIndex, setPlayerIndex] = useState(0);
    const [activeColor, setActiveColor] = useState(null);
    const [isPlayingSequence, setIsPlayingSequence] = useState(false);
    const [gameState, setGameState] = useState('idle');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [round, setRound] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const timeoutRefs = useRef([]);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const clearTimeouts = () => {
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];
    };

    const playSound = useCallback((color) => {
        if (!soundEnabled) return;
        const sound = soundFiles[color];
        if (sound) {
            sound.stop(() => {
                sound.play();
            });
        }
    }, [soundEnabled]);

    const playWrongSound = useCallback(() => {
        if (!soundEnabled) return;
        const sound = soundFiles.wrong;
        if (sound) {
            sound.stop(() => {
                sound.play();
            });
        }
    }, [soundEnabled]);

    useEffect(() => {
        return () => clearTimeouts();
    }, []);

    useEffect(() => {
        if (gameState === 'gameover') {
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 500, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 500, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 500, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start();
        }
    }, [gameState]);

    useEffect(() => {
        if (gameState === 'showing') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                ]),
                { iterations: -1 }
            ).start();
        } else {
            pulseAnim.setValue(1);
            pulseAnim.stopAnimation();
        }
    }, [gameState]);

    const playSequence = useCallback((seq) => {
        clearTimeouts();
        setIsPlayingSequence(true);
        setActiveColor(null);

        seq.forEach((color, i) => {
            const showTimeout = setTimeout(() => {
                setActiveColor(color);
                playSound(color);
            }, i * 700 + 300);

            const hideTimeout = setTimeout(() => {
                setActiveColor(null);
            }, i * 700 + 700);

            timeoutRefs.current.push(showTimeout, hideTimeout);
        });

        const endTimeout = setTimeout(() => {
            setIsPlayingSequence(false);
            setGameState('playing');
        }, seq.length * 700 + 300);

        timeoutRefs.current.push(endTimeout);
    }, [playSound]);

    const startGame = () => {
        clearTimeouts();
        const initial = extendSequence([]);
        setSequence(initial);
        setPlayerIndex(0);
        setScore(0);
        setRound(1);
        setGameState('showing');
        playSequence(initial);
    };

    const handlePadPress = (color) => {
        if (gameState !== 'playing' || isPlayingSequence) return;

        setActiveColor(color);
        setTimeout(() => setActiveColor(null), 200);
        
        if (color !== sequence[playerIndex]) {
            clearTimeouts();
            playWrongSound();
            setGameState('gameover');
            setHighScore((prev) => Math.max(prev, score));
            setActiveColor(null);
            return;
        }
        playSound(color);

        const nextIndex = playerIndex + 1;
        setPlayerIndex(nextIndex);

        if (nextIndex >= sequence.length) {
            const newScore = score + 1;
            setScore(newScore);
            setRound(newScore + 1);
            const extended = extendSequence(sequence);
            setSequence(extended);
            setPlayerIndex(0);
            setGameState('showing');
            setTimeout(() => playSequence(extended), 600);
        }
    };

    const getStatusText = () => {
        if (gameState === 'idle') return 'Ready to play?';
        if (gameState === 'showing') return 'Watch closely...';
        if (gameState === 'playing') return `Your turn  ${playerIndex + 1}/${sequence.length}`;
        if (gameState === 'gameover') return 'Game Over';
        return '';
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <Header title="Simon" />
            <View style={styles.container}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>SCORE</Text>
                        <Text style={styles.statValue}>{score}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>ROUND</Text>
                        <Text style={styles.statValue}>{round}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>BEST</Text>
                        <Text style={[styles.statValue, styles.bestValue]}>{highScore}</Text>
                    </View>
                </View>

                <Animated.View style={[styles.statusContainer, { transform: [{ translateX: shakeAnim }] }]}>
                    <Text style={[styles.status, gameState === 'playing' && styles.statusPlay, gameState === 'gameover' && styles.statusLose, gameState === 'showing' && styles.statusWatch]}>
                        {getStatusText()}
                    </Text>
                </Animated.View>

                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <ColorPads
                        activeColor={activeColor}
                        onPadPress={handlePadPress}
                        disabled={gameState !== 'playing' || isPlayingSequence}
                    />
                </Animated.View>

                <View style={styles.bottomSection}>
                    {(gameState === 'idle' || gameState === 'gameover') && (
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={startGame}
                            activeOpacity={0.8}
                        >
                            <RotateCcw size={16} color="#f4f4f5" strokeWidth={2.5} />
                            <Text style={styles.startButtonText}>
                                {gameState === 'idle' ? 'START GAME' : 'PLAY AGAIN'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.soundToggle}
                        onPress={() => setSoundEnabled(!soundEnabled)}
                        activeOpacity={0.7}
                    >
                        {soundEnabled
                            ? <Volume2 size={18} color="#a855f7" strokeWidth={2} />
                            : <VolumeX size={18} color="#52525b" strokeWidth={2} />
                        }
                        <Text style={[styles.soundToggleText, { color: soundEnabled ? '#c4b5fd' : '#52525b' }]}>
                            Sound {soundEnabled ? 'On' : 'Off'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#09090b',
    },
    container: {
        flex: 1,
        backgroundColor: '#09090b',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        maxWidth: 340,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: '#18181b',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 28,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 28,
        backgroundColor: '#27272a',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#71717a',
        letterSpacing: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#f4f4f5',
        marginTop: 4,
        fontVariant: ['tabular-nums'],
    },
    bestValue: {
        color: '#fbbf24',
    },
    statusContainer: {
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    status: {
        fontSize: 17,
        fontWeight: '700',
        color: '#a1a1aa',
        letterSpacing: 0.3,
    },
    statusWatch: {
        color: '#e2e8f0',
        fontWeight: '800',
    },
    statusPlay: {
        color: '#a855f7',
        fontWeight: '800',
    },
    statusLose: {
        color: '#ef4444',
        fontWeight: '900',
        fontSize: 19,
    },
    bottomSection: {
        marginTop: 32,
        alignItems: 'center',
        gap: 16,
        minHeight: 100,
        justifyContent: 'center',
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#a855f7',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        elevation: 6,
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    startButtonText: {
        color: '#f4f4f5',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    soundToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    soundToggleText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

export default Simon;
