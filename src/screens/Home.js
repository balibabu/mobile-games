import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gamepad2, Rocket, Grid3X3, LayoutGrid, Lightbulb, Bomb, Sun, CircleDot, Gem } from 'lucide-react-native';
import { useNavigation } from '../contexts/NavigationContext';
import GameCard from '../components/GameCard';

export default function Home() {
    const { navigate } = useNavigation();

    const gamesList = [
        {
            id: 'TicTacToe',
            title: 'Tic-Tac-Toe',
            description: 'Face off against an unbeatable Minimax AI bot. Can you get a draw or win?',
            Icon: Grid3X3,
            backgroundColor: '#ef4444',
        },
        {
            id: 'Tetris',
            title: 'Tetris',
            description: 'Retro block-dropping arcade action. Rotate, drop, and clear lines!',
            Icon: LayoutGrid,
            backgroundColor: '#10b981',
        },
        {
            id: 'Simon',
            title: 'Simon',
            description: 'Memorize and repeat the growing color sequence. How far can you go?',
            Icon: Lightbulb,
            backgroundColor: '#a855f7',
        },
        {
            id: 'Minesweeper',
            title: 'Minesweeper',
            description: "Avoid the mines and clear the board! Flag suspicious cells and test your logic.",
            Icon: Bomb,
            backgroundColor: '#f59e0b',
        },
        {
            id: 'LightsOut',
            title: 'Lights Out',
            description: 'Turn off all the lights to advance! Click cells to toggle the light and its neighbors.',
            Icon: Sun,
            backgroundColor: '#3b82f6',
        },
        {
            id: 'PuyoPuyo',
            title: 'Puyo Puyo',
            description: 'Match 4+ same-colored puyos to pop them! Build chains for big points as speed increases.',
            Icon: CircleDot,
            backgroundColor: '#ec4899',
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.logoCircle}>
                        <Gamepad2 size={20} color="#f4f4f5" strokeWidth={2.5} />
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>ARCADE</Text>
                    </View>
                </View>
                <Text style={styles.brandText}>MobGames</Text>
                <Text style={styles.subtitleText}>Choose a game below to start playing!</Text>
            </View>

            <View style={styles.divider} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.gridContainer}>
                    {gamesList.map((game) => (
                        <GameCard
                            key={game.id}
                            title={game.title}
                            description={game.description}
                            Icon={game.Icon}
                            backgroundColor={game.backgroundColor}
                            onPress={() => navigate(game.id)}
                        />
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.footerContent}>
                    <Rocket size={14} color="#52525b" strokeWidth={2} />
                    <Text style={styles.footerText}> More games coming soon!</Text>
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
    header: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    logoCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    badge: {
        marginLeft: 10,
        backgroundColor: '#18181b',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#a1a1aa',
        letterSpacing: 3,
    },
    brandText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#f4f4f5',
        marginTop: 4,
        letterSpacing: -1,
    },
    subtitleText: {
        fontSize: 14,
        color: '#52525b',
        marginTop: 8,
        letterSpacing: 0.2,
    },
    divider: {
        height: 1,
        backgroundColor: '#18181b',
        marginHorizontal: 24,
        marginBottom: 8,
    },
    scrollContent: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 30,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    footer: {
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#18181b',
        backgroundColor: '#09090b',
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#52525b',
        fontWeight: '600',
    },
});
