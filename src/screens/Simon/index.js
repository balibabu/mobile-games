import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Volume2, VolumeX } from 'lucide-react-native';
import Header from '../../components/Header';
import ColorPads from './ColorPads';
import { extendSequence, COLOR_MAP } from './gameLogic';

const Simon = () => {
    const [sequence, setSequence] = useState([]);
    const [playerIndex, setPlayerIndex] = useState(0);
    const [activeColor, setActiveColor] = useState(null);
    const [isPlayingSequence, setIsPlayingSequence] = useState(false);
    const [gameState, setGameState] = useState('idle');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const timeoutRefs = useRef([]);

    const clearTimeouts = () => {
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];
    };

    useEffect(() => {
        return () => clearTimeouts();
    }, []);

    const playSequence = useCallback((seq) => {
        clearTimeouts();
        setIsPlayingSequence(true);
        setActiveColor(null);

        seq.forEach((color, i) => {
            const showTimeout = setTimeout(() => {
                setActiveColor(color);
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
    }, []);

    const startGame = () => {
        clearTimeouts();
        const initial = extendSequence([]);
        setSequence(initial);
        setPlayerIndex(0);
        setScore(0);
        setGameState('showing');
        playSequence(initial);
    };

    const handlePadPress = (color) => {
        if (gameState !== 'playing' || isPlayingSequence) return;

        setActiveColor(color);
        setTimeout(() => setActiveColor(null), 200);

        if (color !== sequence[playerIndex]) {
            clearTimeouts();
            setGameState('gameover');
            setHighScore((prev) => Math.max(prev, score));
            setActiveColor(null);
            return;
        }

        const nextIndex = playerIndex + 1;
        setPlayerIndex(nextIndex);

        if (nextIndex >= sequence.length) {
            const newScore = score + 1;
            setScore(newScore);
            const extended = extendSequence(sequence);
            setSequence(extended);
            setPlayerIndex(0);
            setGameState('showing');
            setTimeout(() => playSequence(extended), 600);
        }
    };

    const getStatusText = () => {
        if (gameState === 'idle') return 'Tap START to play!';
        if (gameState === 'showing') return 'Watch the sequence...';
        if (gameState === 'playing') return `Your turn! (${playerIndex + 1}/${sequence.length})`;
        if (gameState === 'gameover') return 'Wrong! Game Over';
        return '';
    };

    const getStatusStyle = () => {
        if (gameState === 'gameover') return styles.statusLose;
        if (gameState === 'playing') return styles.statusPlay;
        return null;
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <Header title="Simon" />
            <View style={styles.container}>
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>SCORE</Text>
                        <Text style={styles.statValue}>{score}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>BEST</Text>
                        <Text style={styles.statValue}>{highScore}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <TouchableOpacity
                            style={styles.soundButton}
                            onPress={() => setSoundEnabled(!soundEnabled)}
                            activeOpacity={0.7}
                        >
                            {soundEnabled
                                ? <Volume2 size={16} color="#a1a1aa" strokeWidth={2} />
                                : <VolumeX size={16} color="#71717a" strokeWidth={2} />
                            }
                            <Text style={styles.soundButtonText}>
                                {soundEnabled ? 'ON' : 'OFF'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.statusContainer}>
                    <Text style={[styles.status, getStatusStyle()]}>{getStatusText()}</Text>
                </View>

                <ColorPads
                    activeColor={activeColor}
                    onPadPress={handlePadPress}
                    disabled={gameState !== 'playing' || isPlayingSequence}
                />

                <TouchableOpacity
                    style={[styles.startButton, gameState !== 'idle' && gameState !== 'gameover' && styles.startButtonDisabled]}
                    onPress={startGame}
                    activeOpacity={0.7}
                    disabled={gameState !== 'idle' && gameState !== 'gameover'}
                >
                    <Text style={styles.startButtonText}>
                        {gameState === 'idle' ? 'START' : 'PLAY AGAIN'}
                    </Text>
                </TouchableOpacity>
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
    },
    statsRow: {
        flexDirection: 'row',
        width: '94%',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#18181b',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 20,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1.5,
    },
    statValue: {
        fontSize: 17,
        fontWeight: '900',
        color: '#f4f4f5',
        marginTop: 4,
    },
    soundButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#09090b',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    soundButtonText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#a1a1aa',
        marginLeft: 4,
        letterSpacing: 1,
    },
    statusContainer: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    status: {
        fontSize: 20,
        fontWeight: '900',
        color: '#f4f4f5',
        letterSpacing: 0.5,
    },
    statusPlay: {
        color: '#a855f7',
    },
    statusLose: {
        color: '#ef4444',
    },
    startButton: {
        marginTop: 30,
        backgroundColor: '#18181b',
        borderWidth: 1.5,
        borderColor: '#a855f744',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    startButtonDisabled: {
        opacity: 0.4,
    },
    startButtonText: {
        color: '#f4f4f5',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
});

export default Simon;
