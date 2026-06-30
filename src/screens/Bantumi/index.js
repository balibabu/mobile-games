import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import GameBoard from './GameBoard';
import GameOverOverlay from './GameOverOverlay';
import ModeToggle from './ModeToggle';
import useBantumiGame from './useBantumiGame';
import { COLORS, LAYOUT } from './constants';
import styles from './styles';

export default function Bantumi() {
    const { width } = useWindowDimensions();
    const {
        pits,
        isBotTurn,
        gameOver,
        winner,
        animating,
        highlightPit,
        gameMode,
        humanMode,
        resetGame,
        toggleGameMode,
        handlePitPress,
    } = useBantumiGame();

    const boardWidth = Math.min(width - 32, LAYOUT.maxBoardWidth);
    const pitSize = (boardWidth - LAYOUT.boardPaddingH) / 6;
    const storeW = LAYOUT.storeW;
    const storeH = pitSize * 2 + LAYOUT.pitRowsGap;
    const isDisabled = animating || gameOver;

    const turnLabel = animating
        ? 'Moving...'
        : humanMode
            ? (isBotTurn ? "P2's Turn" : "P1's Turn")
            : (isBotTurn ? "Bot's Turn" : 'Your Turn');

    const turnColor = animating
        ? COLORS.turn
        : isBotTurn
            ? COLORS.bot
            : COLORS.player;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <Header title="Bantumi" />

            <ModeToggle gameMode={gameMode} onToggle={toggleGameMode} />

            <View style={styles.boardWrap}>
                <View style={[styles.turnBadge, { borderColor: turnColor }]}>
                    <Text style={[styles.turnText, { color: turnColor }]}>
                        {turnLabel}
                    </Text>
                </View>
                <GameBoard
                    pits={pits}
                    pitSize={pitSize}
                    storeW={storeW}
                    storeH={storeH}
                    onPitPress={handlePitPress}
                    disabled={isDisabled}
                    highlightPit={highlightPit}
                    humanMode={humanMode}
                />
            </View>

            {gameOver && (
                <GameOverOverlay
                    winner={winner}
                    playerScore={pits[6]}
                    botScore={pits[13]}
                    onPlayAgain={resetGame}
                    gameMode={gameMode}
                />
            )}
        </SafeAreaView>
    );
}
