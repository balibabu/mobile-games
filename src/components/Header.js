import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, Pause, Play } from 'lucide-react-native';
import { useNavigation } from '../contexts/NavigationContext';

const Header = ({ title, pause }) => {
    const { goBack } = useNavigation();

    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={goBack} activeOpacity={0.2}>
                <ArrowLeft size={20} color="#f4f4f5" />
            </TouchableOpacity>

            <Text style={styles.title} numberOfLines={1}> {title} </Text>

            {pause ?
                <TouchableOpacity style={styles.backButton} activeOpacity={0.2} onPress={() => pause.setIsPaused(!pause.isPaused)}>
                    {pause.isPaused ? <Play size={18} color="#f4f4f5" /> : <Pause size={18} color="#f4f4f5" />}
                </TouchableOpacity>
                :
                <View style={styles.backButtonPlaceholder} />
            }
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: '#09090b',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    backButtonPlaceholder: {
        width: 40,
        height: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#f4f4f5',
        letterSpacing: 0.5,
        textAlign: 'center',
        flex: 1,
    },
});

export default Header;