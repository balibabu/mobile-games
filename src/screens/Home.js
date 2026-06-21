import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Platform } from 'react-native';
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
            backgroundColor: '#FF3B30', // Vibrant Red
        },
        {
            id: 'Tetris',
            title: 'Tetris',
            description: 'Retro block-dropping arcade action. Rotate, drop, and clear lines!',
            emoji: '🧩',
            backgroundColor: '#4CD964', // Vibrant Green
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />
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
        backgroundColor: '#f9f9f9',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 16,
    },
    welcomeText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    brandText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginTop: 4,
    },
    subtitleText: {
        fontSize: 14,
        color: '#8e8e93',
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
        borderTopColor: '#eaeaea',
        backgroundColor: '#ffffff',
    },
    footerText: {
        fontSize: 13,
        color: '#8e8e93',
        fontWeight: '500',
    },
});

export default Home;
