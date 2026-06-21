import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '../contexts/NavigationContext';
import GameCard from '../components/GameCard';

const Home = () => {
    const { navigate } = useNavigation();

    const gamesList = [
        {
            id: 'TicTacToe',
            title: 'Tic-Tac-Toe',
            description: 'Face off against an unbeatable Minimax AI bot. Can you get a draw or win?',
            emoji: '❌⭕️',
            backgroundColor: '#ef4444', // Red glow
        },
        {
            id: 'Tetris',
            title: 'Tetris',
            description: 'Retro block-dropping arcade action. Rotate, drop, and clear lines!',
            emoji: '🧩',
            backgroundColor: '#10b981', // Green glow
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Welcome to</Text>
                <Text style={styles.brandText}>MobGames Arcade 🕹️</Text>
                <Text style={styles.subtitleText}>Choose a game below to start playing!</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.gridContainer}>
                    {gamesList.map((game) => (
                        <GameCard
                            key={game.id}
                            title={game.title}
                            description={game.description}
                            emoji={game.emoji}
                            backgroundColor={game.backgroundColor}
                            onPress={() => navigate(game.id)}
                        />
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>More games coming soon! 🚀</Text>
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
        paddingTop: 20,
        paddingBottom: 16,
    },
    welcomeText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#3b82f6',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    brandText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#f4f4f5',
        marginTop: 4,
        letterSpacing: -0.5,
    },
    subtitleText: {
        fontSize: 14,
        color: '#71717a',
        marginTop: 8,
    },
    scrollContent: {
        paddingHorizontal: 12,
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
    footerText: {
        fontSize: 13,
        color: '#71717a',
        fontWeight: '600',
    },
});

export default Home;
