import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationProvider, useNavigation } from './src/contexts/NavigationContext';
import Home from './src/screens/Home';
import TicTacToe from './src/screens/TicTacToe';
import Tetris from './src/screens/Tetris';
import Simon from './src/screens/Simon';

const AppContent = () => {
    const { currentScreen } = useNavigation();

    switch (currentScreen) {
        case 'Home':
            return <Home />;
        case 'TicTacToe':
            return <TicTacToe />;
        case 'Tetris':
            return <Tetris />;
        case 'Simon':
            return <Simon />;
        default:
            return <Home />;
    }
};

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationProvider>
                <AppContent />
            </NavigationProvider>
        </SafeAreaProvider>
    );
}
