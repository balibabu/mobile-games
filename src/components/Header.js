import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '../contexts/NavigationContext';

const Header = ({ title, showBack = true }) => {
    const { goBack, canGoBack } = useNavigation();

    return (
        <View style={styles.header}>
            <View style={styles.buttonPlaceholder}>
                {showBack && canGoBack && (
                    <TouchableOpacity style={styles.backButton} onPress={goBack} activeOpacity={0.7}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>
            <View style={styles.buttonPlaceholder} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        height: Platform.OS === 'ios' ? 54 : 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#09090b',
        borderBottomWidth: 1,
        borderBottomColor: '#27272a',
        paddingHorizontal: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    buttonPlaceholder: {
        width: 75,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    backText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#a1a1aa',
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '800',
        color: '#f4f4f5',
        letterSpacing: 0.5,
    },
});

export default Header;
