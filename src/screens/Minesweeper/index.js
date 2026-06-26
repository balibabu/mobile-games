import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flag, Bomb, Clock } from 'lucide-react-native';
import Header from '../../components/Header';
import { DIFFICULTY, createBoard, placeMines, revealCell, toggleFlag, checkWin, revealAllMines } from './gameLogic';

const { width } = Dimensions.get('window');

const DIFFICULTY_KEYS = ['BEGINNER', 'INTERMEDIATE', 'EXPERT'];
const DIFF_LABELS = { BEGINNER: 'Easy', INTERMEDIATE: 'Medium', EXPERT: 'Hard' };
const CELL_COLORS = { 1: '#3b82f6', 2: '#10b981', 3: '#f59e0b', 4: '#a855f7', 5: '#f97316', 6: '#06b6d4', 7: '#000000', 8: '#71717a' };

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState('BEGINNER');
  const [board, setBoard] = useState(() => createBoard(9, 9, 0));
  const [gameState, setGameState] = useState('idle');
  const [minesPlaced, setMinesPlaced] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef(null);
  const [flagCount, setFlagCount] = useState(0);

  const config = DIFFICULTY[difficulty];
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
    const newConfig = DIFFICULTY[newDiff];
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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isFinished = gameState === 'won' || gameState === 'lost';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />
      <Header title="Minesweeper" />
      <View style={styles.container}>

        <View style={styles.difficultyContainer}>
          {DIFFICULTY_KEYS.map((diff) => (
            <TouchableOpacity key={diff} style={[styles.difficultyButton, difficulty === diff && styles.difficultyButtonActive]} onPress={() => changeDifficulty(diff)} activeOpacity={0.7}>
              <Text style={[styles.difficultyButtonText, difficulty === diff && styles.difficultyButtonTextActive]}>{DIFF_LABELS[diff]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Clock size={14} color="#71717a" strokeWidth={2.5} />
            <Text style={styles.infoText}>Time: <Text style={styles.infoValue}>{formatTime(timer)}</Text></Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoText}>Mines: <Text style={styles.infoValue}>{flagsRemaining}</Text></Text>
          </View>
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

        {isFinished && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>{gameState === 'won' ? 'YOU WIN!' : 'GAME OVER'}</Text>
            <Text style={styles.overlayText}>Time: {formatTime(timer)}</Text>
            <TouchableOpacity onPress={resetGame} style={styles.overlayButton}>
              <Text style={styles.overlayButtonText}>PLAY AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#09090b' },
  container: { flex: 1, backgroundColor: '#09090b', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  difficultyContainer: { flexDirection: 'row', marginBottom: 12, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#27272a' },
  difficultyButton: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#18181b' },
  difficultyButtonActive: { backgroundColor: '#27272a' },
  difficultyButtonText: { fontSize: 12, fontWeight: '700', color: '#71717a', letterSpacing: 0.5 },
  difficultyButtonTextActive: { color: '#f4f4f5' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 14, fontWeight: '700', color: '#71717a' },
  infoValue: { color: '#f4f4f5' },
  boardScrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  boardContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  gameBoard: { borderWidth: 1, borderColor: '#27272a', borderRadius: 8, overflow: 'hidden', backgroundColor: '#18181b' },
  row: { flexDirection: 'row' },
  cell: { justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#27272a' },
  cellNumber: { fontWeight: '900' },
  overlay: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  overlayTitle: { fontSize: 24, fontWeight: '900', color: '#f4f4f5', marginBottom: 8 },
  overlayText: { fontSize: 14, fontWeight: '600', color: '#71717a', marginBottom: 24 },
  overlayButton: { backgroundColor: '#18181b', borderWidth: 1.5, borderColor: '#27272a', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  overlayButtonText: { color: '#f4f4f5', fontSize: 14, fontWeight: '800', letterSpacing: 1.5 },
});
