import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width > 500 ? 220 : (width - 48) / 2; // Grid style (2 columns)

const GameCard = ({ title, description, emoji, onPress, backgroundColor = '#007AFF' }) => {
    return (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: backgroundColor }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.emojiContainer, { backgroundColor: backgroundColor + '15' }]}>
                <Text style={styles.emoji}>{emoji}</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
                <Text style={styles.description} numberOfLines={2}>
                    {description}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 8,
        borderLeftWidth: 6,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        justifyContent: 'space-between',
        height: 150,
    },
    emojiContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    emoji: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
});

export default GameCard;
