import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    StatusBar,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '../../contexts/NavigationContext';
import {
    PITS_COUNT,
    getInitialState,
    makeMove,
    isGameOver,
    finalizeGame,
    getWinner,
    findBestMove,
    getValidMoves,
    isPlayerPit,
} from './gameLogic';
import Header from '../../components/Header';

function computeSowSteps(pits, pitIndex) {
    const steps = [];
    const working = [...pits];
    let stones = working[pitIndex];
    working[pitIndex] = 0;
    steps.push({ pits: [...working], highlight: pitIndex });

    const playerMoved = isPlayerPit(pitIndex);
    const opponentStore = playerMoved ? 13 : 6;
    let current = pitIndex;

    while (stones > 0) {
        current = (current + 1) % PITS_COUNT;
        if (current === opponentStore) continue;
        working[current] += 1;
        steps.push({ pits: [...working], highlight: current });
        stones -= 1;
    }

    return steps;
}

function Pit({ gems, index, pitSize, isPlayer, disabled, onPress, highlight }) {
    const isEmpty = gems === 0;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const prevHighlight = useRef(false);

    useEffect(() => {
        if (highlight && !prevHighlight.current) {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.5,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 200,
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
                        color: isPlayer ? '#4ade80' : '#f87171',
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

function Store({ gems, label, width, height, isPlayer, highlight }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const prevHighlight = useRef(false);

    useEffect(() => {
        if (highlight && !prevHighlight.current) {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 3,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 500,
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
                { borderColor: isPlayer ? '#4ade8040' : '#f8717140' },
            ]}
        >
            <Text style={styles.storeLabel}>{label}</Text>
            <Animated.Text
                style={[
                    styles.storeValue,
                    {
                        color: isPlayer ? '#4ade80' : '#f87171',
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {gems}
            </Animated.Text>
        </View>
    );
}

function GameBoard({ pits, pitSize, storeW, storeH, onPitPress, disabled, highlightPit }) {
    return (
        <View style={styles.board}>
            <View style={styles.row}>
                <Store
                    gems={pits[13]}
                    label="Bot"
                    width={storeW}
                    height={storeH}
                    isPlayer={false}
                    highlight={highlightPit === 13}
                />
                <View style={styles.pitsColumn}>
                    <View style={styles.pitsRow}>
                        {[12, 11, 10, 9, 8, 7].map((i) => (
                            <Pit
                                key={i}
                                index={i}
                                gems={pits[i]}
                                pitSize={pitSize}
                                isPlayer={false}
                                disabled={disabled}
                                onPress={onPitPress}
                                highlight={highlightPit === i}
                            />
                        ))}
                    </View>
                    <View style={styles.pitsRow}>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <Pit
                                key={i}
                                index={i}
                                gems={pits[i]}
                                pitSize={pitSize}
                                isPlayer={true}
                                disabled={disabled}
                                onPress={onPitPress}
                                highlight={highlightPit === i}
                            />
                        ))}
                    </View>
                </View>
                <Store
                    gems={pits[6]}
                    label="You"
                    width={storeW}
                    height={storeH}
                    isPlayer={true}
                    highlight={highlightPit === 6}
                />
            </View>
        </View>
    );
}

function GameOverOverlay({ winner, playerScore, botScore, onPlayAgain }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const isPlayerWin = winner === 'Player';
    const isBotWin = winner === 'Bot';
    const accentColor = isPlayerWin ? '#4ade80' : isBotWin ? '#f87171' : '#facc15';

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
                    {isPlayerWin ? 'You Win!' : isBotWin ? 'Bot Wins!' : 'Draw!'}
                </Text>

                <View style={styles.scoresRow}>
                    <View style={styles.scoreBox}>
                        <Text style={styles.scoreLabel}>You</Text>
                        <Text style={[styles.scoreValue, { color: '#4ade80' }]}>{playerScore}</Text>
                    </View>
                    <View style={styles.scoreDivider}>
                        <Text style={styles.scoreVs}>vs</Text>
                    </View>
                    <View style={styles.scoreBox}>
                        <Text style={styles.scoreLabel}>Bot</Text>
                        <Text style={[styles.scoreValue, { color: '#f87171' }]}>{botScore}</Text>
                    </View>
                </View>

                <TouchableOpacity style={[styles.playAgainButton, { borderColor: accentColor }]} onPress={onPlayAgain}>
                    <Text style={[styles.playAgainText, { color: accentColor }]}>Play Again</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

export default function Bantumi() {
    const { navigate } = useNavigation();
    const { width } = useWindowDimensions();
    const [pits, setPits] = useState(getInitialState());
    const [isBotTurn, setIsBotTurn] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [animating, setAnimating] = useState(false);
    const [highlightPit, setHighlightPit] = useState(-1);
    const timeoutsRef = useRef([]);

    const clearTimeouts = useCallback(() => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
    }, []);

    const resetGame = useCallback(() => {
        clearTimeouts();
        setPits(getInitialState());
        setIsBotTurn(false);
        setGameOver(false);
        setWinner(null);
        setAnimating(false);
        setHighlightPit(-1);
    }, [clearTimeouts]);

    const executeAnimatedMove = useCallback((startingPits, pitIndex, isBot) => {
        const { newPits, extraTurn } = makeMove(startingPits, pitIndex);
        const sowSteps = computeSowSteps(startingPits, pitIndex);
        setAnimating(true);

        sowSteps.forEach((step, idx) => {
            const t = setTimeout(() => {
                setPits(step.pits);
                setHighlightPit(step.highlight);
            }, idx * 400);
            timeoutsRef.current.push(t);
        });

        const afterSowDelay = sowSteps.length * 400 + 500;

        const afterT = setTimeout(() => {
            setHighlightPit(-1);
            setPits(newPits);

            // 2. Check for game over and animate the sweep
            if (isGameOver(newPits)) {
                const finalSteps = [];
                const finalWorking = [...newPits];

                // Sweep Player side
                for (let i = 0; i < 6; i++) {
                    if (finalWorking[i] > 0) {
                        finalWorking[6] += finalWorking[i];
                        finalWorking[i] = 0;
                        finalSteps.push({ pits: [...finalWorking], highlight: i });
                    }
                }
                
                // Sweep Bot side
                for (let i = 7; i < 13; i++) {
                    if (finalWorking[i] > 0) {
                        finalWorking[13] += finalWorking[i];
                        finalWorking[i] = 0;
                        finalSteps.push({ pits: [...finalWorking], highlight: i });
                    }
                }

                if (finalSteps.length > 0) {
                    finalSteps.forEach((step, idx) => {
                        const sweepTimer = setTimeout(() => {
                            setPits(step.pits);
                            setHighlightPit(step.highlight);
                        }, idx * 300); // Slightly faster animation for the final sweep
                        timeoutsRef.current.push(sweepTimer);
                    });

                    const finalSweepDelay = finalSteps.length * 300 + 500;
                    
                    const finalGameTimer = setTimeout(() => {
                        setHighlightPit(-1);
                        const finalPits = finalizeGame(newPits); 
                        setPits(finalPits);
                        setGameOver(true);
                        setWinner(getWinner(finalPits));
                        setAnimating(false);
                    }, finalSweepDelay);
                    timeoutsRef.current.push(finalGameTimer);
                } else {
                    const finalPits = finalizeGame(newPits);
                    setPits(finalPits);
                    setGameOver(true);
                    setWinner(getWinner(finalPits));
                    setAnimating(false);
                }
                return;
            }

            setAnimating(false);

            if (extraTurn) {
                const moves = getValidMoves(newPits, isBot);
                if (moves.length === 0) {
                    setIsBotTurn(!isBot);
                }
            } else {
                setIsBotTurn(!isBot);
            }
        }, afterSowDelay);
        timeoutsRef.current.push(afterT);
    }, [clearTimeouts]);

    const handlePlayerMove = useCallback(
        (pitIndex) => {
            if (isBotTurn || gameOver || animating) return;
            if (!isPlayerPit(pitIndex)) return;
            if (pits[pitIndex] === 0) return;
            executeAnimatedMove([...pits], pitIndex, false);
        },
        [isBotTurn, gameOver, animating, pits, executeAnimatedMove],
    );

    const handleBotMove = useCallback(
        (currentPits) => {
            const move = findBestMove(currentPits);
            if (move === null || move === undefined) return;
            executeAnimatedMove([...currentPits], move, true);
        },
        [executeAnimatedMove],
    );

    useEffect(() => {
        if (isBotTurn && !gameOver && !animating) {
            const timer = setTimeout(() => {
                handleBotMove(pits);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isBotTurn, gameOver, animating, pits, handleBotMove]);

    useEffect(() => {
        return () => clearTimeouts();
    }, [clearTimeouts]);

    const boardWidth = Math.min(width - 32, 420);
    const pitSize = (boardWidth - 40) / 6;
    const storeW = 44;
    const storeH = pitSize * 2 + 20;
    const isDisabled = isBotTurn || gameOver || animating;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <Header title="Bantumi" />

            <View style={styles.boardWrap}>
                <View
                    style={[styles.turnBadge, { borderColor: animating ? '#facc15' : isBotTurn ? '#f87171' : '#4ade80', },]}>
                    <Text
                        style={[styles.turnText, { color: animating ? '#facc15' : isBotTurn ? '#f87171' : '#4ade80', },]}>
                        {animating ? 'Moving...' : isBotTurn ? "Bot's Turn" : 'Your Turn'}
                    </Text>
                </View>
                <GameBoard
                    pits={pits}
                    pitSize={pitSize}
                    storeW={storeW}
                    storeH={storeH}
                    onPitPress={handlePlayerMove}
                    disabled={isDisabled}
                    highlightPit={highlightPit}
                />
            </View>

            {gameOver && (
                <GameOverOverlay
                    winner={winner}
                    playerScore={pits[6]}
                    botScore={pits[13]}
                    onPlayAgain={resetGame}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#09090b',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#f4f4f5',
        letterSpacing: 0.5,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingVertical: 12,
        marginBottom: 8,
    },
    statBox: {
        alignItems: 'center',
        backgroundColor: '#18181b',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#27272a',
        minWidth: 100,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1.5,
        marginTop: 4,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#f4f4f5',
    },
    boardWrap: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    board: {
        borderWidth: 1,
        borderColor: '#27272a',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#18181b',
        padding: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pitsColumn: {
        flexDirection: 'column',
    },
    pitsRow: {
        flexDirection: 'row',
    },
    cell: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#27272a',
    },
    cellNumber: {
        fontWeight: '900',
    },
    store: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#27272a',
        borderRadius: 4,
    },
    storeLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1,
        marginBottom: 2,
    },
    storeValue: {
        fontSize: 18,
        fontWeight: '900',
    },
    overlayBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(9,9,11,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayCard: {
        backgroundColor: '#18181b',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#27272a',
        paddingVertical: 32,
        paddingHorizontal: 36,
        alignItems: 'center',
        width: '80%',
        maxWidth: 340,
    },
    overlayAccent: {
        width: 48,
        height: 4,
        borderRadius: 2,
        marginBottom: 20,
    },
    overlayTitle: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 24,
    },
    scoresRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 28,
        width: '100%',
    },
    scoreBox: {
        flex: 1,
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#71717a',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    scoreValue: {
        fontSize: 28,
        fontWeight: '900',
    },
    scoreDivider: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreVs: {
        fontSize: 14,
        fontWeight: '800',
        color: '#3f3f46',
        letterSpacing: 1,
    },
    playAgainButton: {
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 40,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
    },
    playAgainText: {
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 2,
    },
    turnBadge: {
        alignSelf: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        backgroundColor: '#18181b',
        marginBottom: 16,
    },

    turnText: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});