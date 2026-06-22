import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flag, Bomb, Smile, Frown, Meh, Crosshair } from 'lucide-react-native';
import Header from '../../components/Header';
import { DIFFICULTY, createBoard, placeMines, revealCell, toggleFlag, checkWin, revealAllMines } from './gameLogic';

const { width } = Dimensions.get('window');

const DIFFICULTY_LABELS = { 初级: 'BEGINNER', 中级: 'INTERMEDIATE', 专家: 'EXPERT' };
const CELL_COLORS = { 1: '#3b82f6', 2: '#10b981', 3: '#f59e0b', 4: '#a855f7', 5: '#f97316', 6: '#06b6d4', 7: '#000000', 8: '#71717a' };
const DIFF_LABELS_EN = { 初级: 'Easy', 中级: 'Medium', 专家: 'Hard' };

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState('初级');
  const [board, setBoard] = useState(() => createBoard(9, 9, 0));
  const [gameState, setGameState] = useState('idle');
  const [minesPlaced, setMinesPlaced] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef(null);
  const [flagCount, setFlagCount] = useState(0);

  const config = DIFFICULTY[DIFFICULTY_LABELS[difficulty]];
  const mineCount = config.mines;
  const flagsRemaining = mineCount - flagCount;

  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => setTimer((p) => p + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
  }, []);

  const resetGame = useCallback(() => {
    stopTimer();
    setTimer(0);
    setFlagCount(0);
    setGameState('idle');
    setMinesPlaced(false);
    setBoard(createBoard(config.rows, config.cols, 0));
  }, [config.rows, config.cols, stopTimer]);

  const changeDifficulty = useCallback((newDiff) => {
    stopTimer();
    setTimer(0);
    setFlagCount(0);
    setGameState('idle');
    setMinesPlaced(false);
    setDifficulty(newDiff);
    const newConfig = DIFFICULTY[DIFFICULTY_LABELS[newDiff]];
    setBoard(createBoard(newConfig.rows, newConfig.cols, 0));
  }, [stopTimer]);

  const handleCellPress = useCallback((row, col) => {
    if (gameState === 'won' || gameState === 'lost') return;
    if (board[row][col].isFlagged) return;
    let currentBoard = board;
    if (!minesPlaced) {
      currentBoard = placeMines(createBoard(config.rows, config.cols, 0), mineCount, row, col);
      setMinesPlaced(true);
      setGameState('playing');
      startTimer();
    }
    if (currentBoard[row][col].isMine) {
      setBoard(revealAllMines(currentBoard));
      setGameState('lost');
      stopTimer();
      return;
    }
    const newBoard = revealCell(currentBoard, row, col);
    setBoard(newBoard);
    if (checkWin(newBoard)) { setGameState('won'); stopTimer(); }
  }, [board, gameState, minesPlaced, config.rows, config.cols, mineCount, startTimer, stopTimer]);

  const handleLongPress = useCallback((row, col) => {
    if (gameState === 'won' || gameState === 'lost') return;
    if (board[row][col].isRevealed) return;
    const oldFlag = board[row][col].isFlagged;
    const newBoard = toggleFlag(board, row, col);
    setBoard(newBoard);
    setFlagCount((prev) => (oldFlag ? prev - 1 : prev + 1));
  }, [board, gameState]);

  const cellSize = Math.min(32, (width - 48) / config.cols || 32);

  const getStatusIcon = () => {
    if (gameState === 'won') return <Smile size={20} color="#10b981" strokeWidth={2.5} />;
    if (gameState === 'lost') return <Frown size={20} color="#ef4444" strokeWidth={2.5} />;
    return <Meh size={20} color="#f4f4f5" strokeWidth={2.5} />;
  };

  const getStatusText = () => {
    if (gameState === 'won') return 'YOU WIN!';
    if (gameState === 'lost') return 'GAME OVER';
    if (gameState === 'playing') return 'PLAYING';
    return 'READY';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />
      <Header title="Minesweeper" />
      <View style={styles.container}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Crosshair size={16} color="#71717a" strokeWidth={2} />
            <Text style={styles.statLabel}>MINES</Text>
            <Text style={styles.statValue}>{flagsRemaining}</Text>
          </View>
          <View style={styles.statItem}>
            {getStatusIcon()}
            <Text style={styles.statLabel}>{getStatusText()}</Text>
            <Text style={styles.statValue}>{timer}s</Text>
          </View>
        </View>

        <View style={styles.difficultyContainer}>
          {Object.keys(DIFFICULTY_LABELS).map((diff) => (
            <TouchableOpacity key={diff} style={[styles.difficultyButton, difficulty === diff && styles.difficultyButtonActive]} onPress={() => changeDifficulty(diff)} activeOpacity={0.7}>
              <Text style={[styles.difficultyButtonText, difficulty === diff && styles.difficultyButtonTextActive]}>{DIFF_LABELS_EN[diff]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView horizontal contentContainerStyle={styles.boardScrollContainer} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
          <ScrollView contentContainerStyle={styles.boardContent} showsVerticalScrollIndicator={false}>
            <View style={styles.gameBoard}>
              {board.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                  {row.map((cell) => {
                    const isRevealed = cell.isRevealed;
                    const isFlagged = cell.isFlagged;
                    const isMine = cell.isMine;
                    return (
                      <TouchableOpacity key={`${cell.row}-${cell.col}`} style={[styles.cell, { width: cellSize, height: cellSize, backgroundColor: isRevealed ? '#09090b' : '#18181b' }]} onPress={() => handleCellPress(cell.row, cell.col)} onLongPress={() => handleLongPress(cell.row, cell.col)} activeOpacity={0.7} delayPressOut={false}>
                        {isFlagged && !isRevealed && <Flag size={cellSize * 0.6} color="#ef4444" strokeWidth={2.5} />}
                        {isRevealed && isMine && <Bomb size={cellSize * 0.6} color="#ef4444" strokeWidth={2.5} />}
                        {isRevealed && !isMine && cell.neighborMines > 0 && (
                          <Text style={[styles.cellNumber, { color: CELL_COLORS[cell.neighborMines] || '#f4f4f5', fontSize: cellSize * 0.55 }]}>{cell.neighborMines}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>

        <TouchableOpacity style={styles.resetButton} onPress={resetGame} activeOpacity={0.8}>
          <Text style={styles.resetText}>NEW GAME</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#09090b' },
  container: { flex: 1, backgroundColor: '#09090b', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingVertical: 12, marginBottom: 8 },
  statItem: { alignItems: 'center', backgroundColor: '#18181b', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10, borderWidth: 1, borderColor: '#27272a', minWidth: 120 },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#71717a', letterSpacing: 1.5, marginTop: 4, marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#f4f4f5' },
  difficultyContainer: { flexDirection: 'row', marginBottom: 12, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#27272a' },
  difficultyButton: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#18181b' },
  difficultyButtonActive: { backgroundColor: '#27272a' },
  difficultyButtonText: { fontSize: 12, fontWeight: '700', color: '#71717a', letterSpacing: 0.5 },
  difficultyButtonTextActive: { color: '#f4f4f5' },
  boardScrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  boardContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  gameBoard: { borderWidth: 1, borderColor: '#27272a', borderRadius: 8, overflow: 'hidden', backgroundColor: '#18181b' },
  row: { flexDirection: 'row' },
  cell: { justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#27272a' },
  cellNumber: { fontWeight: '900' },
  resetButton: { backgroundColor: '#18181b', borderWidth: 1.5, borderColor: '#27272a', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12, marginVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  resetText: { color: '#f4f4f5', fontSize: 14, fontWeight: '800', letterSpacing: 1.5 },
});