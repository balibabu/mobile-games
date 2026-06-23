import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RotateCcw, Users, Cpu } from 'lucide-react-native';
import { useNavigation } from '../contexts/NavigationContext';
import { sowSeeds, isValidMove, getValidMoves, isGameOver, collectRemaining, getWinner, getCPUMove } from '../utils/mancalaAI';

const PIT_COUNT = 6;
const INITIAL_SEEDS = 4;

function createInitialBoard() {
  const board = new Array(14).fill(0);
  for (let i = 0; i < 6; i++) board[i] = INITIAL_SEEDS;
  for (let i = 7; i < 13; i++) board[i] = INITIAL_SEEDS;
  return board;
}

export default function Mancala() {
  const { navigate } = useNavigation();
  const [board, setBoard] = useState(createInitialBoard);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameMode, setGameMode] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const cpuTimeoutRef = useRef(null);

  const resetGame = useCallback((mode) => {
    if (cpuTimeoutRef.current) clearTimeout(cpuTimeoutRef.current);
    setBoard(createInitialBoard());
    setCurrentPlayer(0);
    setGameOver(false);
    setWinner(null);
    setIsAnimating(false);
    setLastMove(null);
    if (mode) setGameMode(mode);
  }, []);

  const handleGameOver = useCallback((b) => {
    let finalBoard = [...b];
    const p0Seeds = [0, 1, 2, 3, 4, 5].reduce((s, i) => s + finalBoard[i], 0);
    const p1Seeds = [7, 8, 9, 10, 11, 12].reduce((s, i) => s + finalBoard[i], 0);
    if (p0Seeds === 0) finalBoard = collectRemaining(finalBoard, 1);
    else if (p1Seeds === 0) finalBoard = collectRemaining(finalBoard, 0);
    setBoard(finalBoard);
    setGameOver(true);
    setWinner(getWinner(finalBoard));
  }, []);

  const makeMove = useCallback((pitIndex, player, currentBoard) => {
    if (!isValidMove(currentBoard, pitIndex, player)) return null;
    const result = sowSeeds(currentBoard, pitIndex, player);
    let finalBoard = [...result.board];

    if (isGameOver(finalBoard)) {
      const p0Seeds = [0, 1, 2, 3, 4, 5].reduce((s, i) => s + finalBoard[i], 0);
      const p1Seeds = [7, 8, 9, 10, 11, 12].reduce((s, i) => s + finalBoard[i], 0);
      if (p0Seeds === 0) finalBoard = collectRemaining(finalBoard, 1);
      else if (p1Seeds === 0) finalBoard = collectRemaining(finalBoard, 0);
      return { board: finalBoard, extraTurn: result.extraTurn, gameOver: true };
    }

    return { board: finalBoard, extraTurn: result.extraTurn, gameOver: false };
  }, []);

  const onPitPress = useCallback((pitIndex) => {
    if (isAnimating || gameOver) return;
    if (gameMode === 'cpu' && currentPlayer === 1) return;
    if (pitIndex === 6 || pitIndex === 13) return;
    if (!isValidMove(board, pitIndex, currentPlayer)) return;

    setIsAnimating(true);
    setLastMove(pitIndex);

    const result = makeMove(pitIndex, currentPlayer, board);
    if (!result) { setIsAnimating(false); return; }

    setBoard(result.board);

    if (result.gameOver) {
      handleGameOver(result.board);
      setIsAnimating(false);
      return;
    }

    if (result.extraTurn) {
      setIsAnimating(false);
      if (gameMode === 'cpu' && currentPlayer === 1) {
        cpuTimeoutRef.current = setTimeout(() => cpuPlay(result.board), 500);
      }
    } else {
      setCurrentPlayer(1 - currentPlayer);
      setIsAnimating(false);
    }
  }, [board, currentPlayer, gameOver, isAnimating, gameMode, makeMove, handleGameOver]);

  const cpuPlay = useCallback((currentBoard) => {
    const move = getCPUMove(currentBoard, 1, 'hard');
    if (move === null) return;

    setIsAnimating(true);
    setLastMove(move);

    const result = makeMove(move, 1, currentBoard);
    if (!result) { setIsAnimating(false); return; }

    setBoard(result.board);

    if (result.gameOver) {
      handleGameOver(result.board);
      setIsAnimating(false);
      return;
    }

    if (result.extraTurn) {
      cpuTimeoutRef.current = setTimeout(() => cpuPlay(result.board), 600);
    } else {
      setCurrentPlayer(0);
      setIsAnimating(false);
    }
  }, [makeMove, handleGameOver]);

  useEffect(() => {
    if (gameMode === 'cpu' && currentPlayer === 1 && !gameOver && !isAnimating) {
      cpuTimeoutRef.current = setTimeout(() => cpuPlay(board), 600);
    }
    return () => { if (cpuTimeoutRef.current) clearTimeout(cpuTimeoutRef.current); };
  }, [currentPlayer, gameMode, gameOver, isAnimating, cpuPlay, board]);

  useEffect(() => {
    if (gameOver && winner !== null) {
      const msg = winner === -1 ? "It's a draw!" : winner === 0 ? 'Player 1 wins!' : (gameMode === 'cpu' ? 'CPU wins!' : 'Player 2 wins!');
      const timeout = setTimeout(() => {
        Alert.alert('Game Over', msg, [
          { text: 'Play Again', onPress: () => resetGame() },
          { text: 'Home', onPress: () => navigate('Home') },
        ]);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [gameOver, winner, gameMode, resetGame, navigate]);

  const p1Pits = [12, 11, 10, 9, 8, 7];
  const p0Pits = [0, 1, 2, 3, 4, 5];
  const p0Store = board[6];
  const p1Store = board[13];

  const isPitPlayable = (pitIndex) => {
    if (gameOver || isAnimating) return false;
    if (gameMode === 'cpu' && currentPlayer === 1) return false;
    return currentPlayer === 0 ? pitIndex >= 0 && pitIndex <= 5 : pitIndex >= 7 && pitIndex <= 12;
  };

  if (!gameMode) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#09090b" />
        <View style={styles.modeContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigate('Home')}>
            <ArrowLeft size={20} color="#a1a1aa" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.modeTitle}>Bantumi</Text>
          <Text style={styles.modeSubtitle}>Mancala Classic</Text>

          <TouchableOpacity style={styles.modeCard} onPress={() => resetGame('cpu')}>
            <View style={[styles.modeIconContainer, { backgroundColor: '#ef4444' }]}>
              <Cpu size={28} color="#f4f4f5" />
            </View>
            <View style={styles.modeTextContainer}>
              <Text style={styles.modeCardTitle}>vs CPU</Text>
              <Text style={styles.modeCardDesc}>Challenge the AI opponent</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modeCard} onPress={() => resetGame('human')}>
            <View style={[styles.modeIconContainer, { backgroundColor: '#3b82f6' }]}>
              <Users size={28} color="#f4f4f5" />
            </View>
            <View style={styles.modeTextContainer}>
              <Text style={styles.modeCardTitle}>vs Human</Text>
              <Text style={styles.modeCardDesc}>Play with a friend locally</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigate('Home')}>
            <ArrowLeft size={18} color="#a1a1aa" />
          </TouchableOpacity>
          <Text style={styles.title}>Bantumi</Text>
          <TouchableOpacity style={styles.resetIconButton} onPress={() => resetGame()}>
            <RotateCcw size={18} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statItem, currentPlayer === 0 && styles.activeStatItem]}>
            <Text style={styles.statLabel}>P1 {gameMode === 'cpu' ? '(YOU)' : ''}</Text>
            <Text style={styles.statValue}>{p0Store}</Text>
          </View>
          <View style={[styles.turnIndicator, styles.statItem]}>
            <Text style={styles.statLabel}>TURN</Text>
            <Text style={[styles.statValue, { color: currentPlayer === 0 ? '#3b82f6' : '#ef4444' }]}>
              P{currentPlayer + 1}
            </Text>
          </View>
          <View style={[styles.statItem, currentPlayer === 1 && styles.activeStatItem]}>
            <Text style={styles.statLabel}>P2 {gameMode === 'cpu' ? '(CPU)' : ''}</Text>
            <Text style={styles.statValue}>{p1Store}</Text>
          </View>
        </View>

        <View style={styles.boardWrapper}>
          <View style={styles.boardContainer}>
            <View style={styles.storeContainer}>
              <Text style={styles.storeLabel}>P2</Text>
              <View style={[styles.store, currentPlayer === 1 && styles.storeActive]}>
                <Text style={styles.storeValue}>{p1Store}</Text>
              </View>
            </View>

            <View style={styles.pitsContainer}>
              <View style={styles.pitRow}>
                {p1Pits.map((pitIndex) => (
                  <TouchableOpacity
                    key={pitIndex}
                    style={[
                      styles.pit,
                      isPitPlayable(pitIndex) && styles.pitPlayable,
                      lastMove === pitIndex && styles.pitLastMove,
                    ]}
                    onPress={() => onPitPress(pitIndex)}
                    activeOpacity={isPitPlayable(pitIndex) ? 0.7 : 1}
                    disabled={!isPitPlayable(pitIndex)}
                  >
                    <Text style={styles.pitValue}>{board[pitIndex]}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.rowDivider} />

              <View style={styles.pitRow}>
                {p0Pits.map((pitIndex) => (
                  <TouchableOpacity
                    key={pitIndex}
                    style={[
                      styles.pit,
                      isPitPlayable(pitIndex) && styles.pitPlayable,
                      lastMove === pitIndex && styles.pitLastMove,
                    ]}
                    onPress={() => onPitPress(pitIndex)}
                    activeOpacity={isPitPlayable(pitIndex) ? 0.7 : 1}
                    disabled={!isPitPlayable(pitIndex)}
                  >
                    <Text style={styles.pitValue}>{board[pitIndex]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.storeContainer}>
              <Text style={styles.storeLabel}>P1</Text>
              <View style={[styles.store, currentPlayer === 0 && styles.storeActive]}>
                <Text style={styles.storeValue}>{p0Store}</Text>
              </View>
            </View>
          </View>

          <View style={styles.pitLabelsRow}>
            <View style={styles.storeLabelSpacer} />
            <View style={styles.pitLabelsInner}>
              {p1Pits.map((_, i) => (
                <Text key={i} style={styles.pitLabel}>{String(p1Pits.length - i)}</Text>
              ))}
            </View>
            <View style={styles.storeLabelSpacer} />
          </View>
          <View style={styles.pitLabelsRow}>
            <View style={styles.storeLabelSpacer} />
            <View style={styles.pitLabelsInner}>
              {p0Pits.map((_, i) => (
                <Text key={i} style={styles.pitLabel}>{String(i + 1)}</Text>
              ))}
            </View>
            <View style={styles.storeLabelSpacer} />
          </View>
        </View>

        {gameOver && (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverText}>
              {winner === -1 ? "Draw!" : winner === 0 ? 'Player 1 Wins!' : (gameMode === 'cpu' ? 'CPU Wins!' : 'Player 2 Wins!')}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.resetButton} onPress={() => resetGame()}>
          <Text style={styles.resetText}>NEW GAME</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#09090b' },
  container: { flex: 1, backgroundColor: '#09090b', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 8, marginBottom: 8, paddingVertical: 4 },
  backButton: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  backButtonText: { color: '#a1a1aa', fontSize: 14, fontWeight: '600', marginLeft: 4 },
  title: { fontSize: 20, fontWeight: '900', color: '#f4f4f5', letterSpacing: 1 },
  resetIconButton: { padding: 8 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingVertical: 8, marginBottom: 4 },
  statItem: { alignItems: 'center', backgroundColor: '#18181b', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: '#27272a', minWidth: 100 },
  activeStatItem: { borderColor: '#3b82f6' },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#71717a', letterSpacing: 1.5, marginTop: 2, marginBottom: 2 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#f4f4f5' },
  turnIndicator: { minWidth: 80 },
  boardWrapper: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  boardContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181b', borderRadius: 12, borderWidth: 1, borderColor: '#27272a', padding: 8 },
  storeContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  store: { width: 52, height: 160, backgroundColor: '#09090b', borderRadius: 10, borderWidth: 1, borderColor: '#27272a', justifyContent: 'center', alignItems: 'center' },
  storeActive: { borderColor: '#3b82f6', borderWidth: 1.5 },
  storeLabel: { fontSize: 9, fontWeight: '800', color: '#52525b', letterSpacing: 1.5, marginBottom: 6 },
  storeValue: { fontSize: 22, fontWeight: '900', color: '#f4f4f5' },
  pitsContainer: { paddingHorizontal: 4 },
  pitRow: { flexDirection: 'row', paddingVertical: 6 },
  rowDivider: { height: 1, backgroundColor: '#27272a', marginHorizontal: 4 },
  pit: { width: 48, height: 64, backgroundColor: '#09090b', borderRadius: 24, borderWidth: 1, borderColor: '#27272a', justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
  pitPlayable: { borderColor: '#3b82f6', backgroundColor: '#0f172a' },
  pitLastMove: { borderColor: '#f59e0b' },
  pitValue: { fontSize: 18, fontWeight: '900', color: '#f4f4f5' },
  pitLabel: { fontSize: 9, fontWeight: '700', color: '#52525b', width: 48, textAlign: 'center', marginHorizontal: 4 },
  pitLabelsRow: { flexDirection: 'row', marginTop: 4 },
  pitLabelsInner: { flexDirection: 'row' },
  storeLabelSpacer: { width: 60 },
  gameOverContainer: { marginTop: 12, backgroundColor: '#18181b', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12, borderWidth: 1, borderColor: '#27272a' },
  gameOverText: { fontSize: 18, fontWeight: '900', color: '#f59e0b', letterSpacing: 1 },
  resetButton: { backgroundColor: '#18181b', borderWidth: 1.5, borderColor: '#27272a', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12, marginVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  resetText: { color: '#f4f4f5', fontSize: 14, fontWeight: '800', letterSpacing: 1.5 },
  modeContainer: { flex: 1, backgroundColor: '#09090b', paddingHorizontal: 24, paddingTop: 12 },
  modeTitle: { fontSize: 36, fontWeight: '900', color: '#f4f4f5', marginTop: 40, marginBottom: 4, letterSpacing: -0.5 },
  modeSubtitle: { fontSize: 14, color: '#52525b', marginBottom: 40, fontWeight: '600', letterSpacing: 0.5 },
  modeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181b', borderRadius: 16, borderWidth: 1, borderColor: '#27272a', padding: 20, marginBottom: 16 },
  modeIconContainer: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  modeTextContainer: { marginLeft: 16, flex: 1 },
  modeCardTitle: { fontSize: 18, fontWeight: '800', color: '#f4f4f5', letterSpacing: 0.3 },
  modeCardDesc: { fontSize: 13, color: '#71717a', marginTop: 4, fontWeight: '600' },
});
