import React from 'react';
import { View } from 'react-native';
import Pit from './Pit';
import Store from './Store';
import styles from './styles';

export default function GameBoard({ pits, pitSize, storeW, storeH, onPitPress, disabled, highlightPit, humanMode }) {
    const topDisabled = disabled || !humanMode;
    return (
        <View style={styles.board}>
            <View style={styles.row}>
                <Store
                    gems={pits[13]}
                    label={humanMode ? 'P2' : 'Bot'}
                    width={storeW}
                    height={storeH}
                    isPlayer={false}
                    highlight={highlightPit === 13}
                />
                <View style={styles.pitsColumn}>
                    <View style={styles.pitsRow}>
                        {[12, 11, 10, 9, 8, 7].map((i) => (
                            <Pit
                                key={i}
                                index={i}
                                gems={pits[i]}
                                pitSize={pitSize}
                                isPlayer={false}
                                disabled={topDisabled}
                                onPress={onPitPress}
                                highlight={highlightPit === i}
                            />
                        ))}
                    </View>
                    <View style={styles.pitsRow}>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <Pit
                                key={i}
                                index={i}
                                gems={pits[i]}
                                pitSize={pitSize}
                                isPlayer={true}
                                disabled={disabled}
                                onPress={onPitPress}
                                highlight={highlightPit === i}
                            />
                        ))}
                    </View>
                </View>
                <Store
                    gems={pits[6]}
                    label={humanMode ? 'P1' : 'You'}
                    width={storeW}
                    height={storeH}
                    isPlayer={true}
                    highlight={highlightPit === 6}
                />
            </View>
        </View>
    );
}
