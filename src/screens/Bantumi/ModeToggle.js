import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Users, Cpu } from 'lucide-react-native';
import { COLORS } from './constants';
import styles from './styles';

export default function ModeToggle({ gameMode, onToggle }) {
    return (
        <View style={styles.topControls}>
            <View style={styles.modeContainer}>
                <TouchableOpacity
                    style={[styles.modeButton, gameMode === 'human' && styles.modeButtonActive]}
                    onPress={() => onToggle('human')}
                    activeOpacity={0.7}
                >
                    <Users
                        size={20}
                        color={gameMode === 'human' ? COLORS.text : COLORS.muted}
                        strokeWidth={2.5}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modeButton, gameMode === 'bot' && styles.modeButtonActive]}
                    onPress={() => onToggle('bot')}
                    activeOpacity={0.7}
                >
                    <Cpu
                        size={20}
                        color={gameMode === 'bot' ? COLORS.text : COLORS.muted}
                        strokeWidth={2.5}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}
