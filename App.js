import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationProvider, useNavigation } from './src/contexts/NavigationContext';
import Home from './src/screens/Home';
import TicTacToe from './src/screens/TicTacToe';
import Tetris from './src/screens/Tetris';
import Simon from './src/screens/Simon';
import Minesweeper from './src/screens/Minesweeper';
import LightsOut from './src/screens/LightsOut';
import PuyoPuyo from './src/screens/PuyoPuyo';
import Bantumi from './src/screens/Bantumi';
import Game2048 from './src/screens/Game2048';
import Snake from './src/screens/Snake';
import Sudoku from './src/screens/Sudoku';
import SlidePuzzle from './src/screens/SlidePuzzle';

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
        case 'Minesweeper':
            return <Minesweeper />;
        case 'LightsOut':
            return <LightsOut />;
        case 'PuyoPuyo':
            return <PuyoPuyo />;
        case 'Bantumi':
            return <Bantumi />;
        case 'Game2048':
            return <Game2048 />;
        case 'Snake':
            return <Snake />;
        case 'Sudoku':
            return <Sudoku />;
        case 'SlidePuzzle':
            return <SlidePuzzle />;
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
