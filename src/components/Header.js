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
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
    },
    buttonPlaceholder: {
        width: 75,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
    },
    backText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default Header;
