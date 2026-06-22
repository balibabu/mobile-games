import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width > 500 ? 220 : (width - 48) / 2;

const GameCard = ({ title, description, Icon, onPress, backgroundColor = '#3b82f6' }) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.glowBorder}>
                <View style={[styles.accentStrip, { backgroundColor }]} />
                <View style={styles.cardContent}>
                    <View style={[styles.emojiOrb, { backgroundColor: backgroundColor + '22' }]}>
                        <View style={[styles.emojiOrbInner, { backgroundColor: backgroundColor + '15' }]}>
                            {Icon && <Icon size={22} color="#f4f4f5" strokeWidth={2} />}
                        </View>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title} numberOfLines={1}>
                            {title}
                        </Text>
                        <Text style={styles.description} numberOfLines={2}>
                            {description}
                        </Text>
                    </View>
                    <View style={[styles.playBadge, { backgroundColor }]}>
                        <Text style={styles.playBadgeText}>PLAY</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        height: 190,
        marginVertical: 8,
        marginHorizontal: 8,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    glowBorder: {
        flex: 1,
        backgroundColor: '#18181b',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#27272a',
        overflow: 'hidden',
    },
    accentStrip: {
        height: 3,
        width: '100%',
    },
    cardContent: {
        flex: 1,
        padding: 14,
        justifyContent: 'space-between',
    },
    emojiOrb: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    emojiOrbInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 22,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: '800',
        color: '#f4f4f5',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    description: {
        fontSize: 11,
        color: '#71717a',
        lineHeight: 15,
    },
    playBadge: {
        position: 'absolute',
        top: 14,
        right: 14,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    playBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1.5,
    },
});

export default GameCard;
