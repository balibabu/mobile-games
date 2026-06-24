import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCcw, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '../../contexts/NavigationContext';
import {
  getInitialState,
  makeMove,
  isGameOver,
  finalizeGame,
  getWinner,
  findBestMove,
  getValidMoves,
} from './gameLogic';

export default function Bantumi() {
  const { navigate } = useNavigation();
  const { width } = useWindowDimensions();
  const [pits, setPits] = useState(getInitialState());
  const [isBotTurn, setIsBotTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const resetGame = useCallback(() => {
    setPits(getInitialState());
    setIsBotTurn(false);
    setGameOver(false);
    setWinner(null);
  }, []);

  const handleBotMove = useCallback((currentPits) => {
    const move = findBestMove(currentPits);
    if (move === null || move === undefined) return;

    const { newPits } = makeMove(currentPits, move);

    if (isGameOver(newPits)) {
      const finalPits = finalizeGame(newPits);
      setPits(finalPits);
      setGameOver(true);
      setWinner(getWinner(finalPits));
      return;
    }

    const botMoves = getValidMoves(newPits, true);
    if (botMoves.length === 0) {
      setPits(newPits);
      setIsBotTurn(false);
      return;
    }

    setPits(newPits);
    setIsBotTurn((p) => !p);
  }, []);

  const handlePlayerMove = useCallback(
    (pitIndex) => {
      if (isBotTurn || gameOver) return;
      if (pitIndex < 0 || pitIndex > 5) return;
      if (pits[pitIndex] === 0) return;

      const { newPits } = makeMove(pits, pitIndex);

      if (isGameOver(newPits)) {
        const finalPits = finalizeGame(newPits);
        setPits(finalPits);
        setGameOver(true);
        setWinner(getWinner(finalPits));
        return;
      }

      const botMoves = getValidMoves(newPits, true);
      if (botMoves.length === 0) {
        setPits(newPits);
        return;
      }

      setPits(newPits);
      setIsBotTurn(true);
    },
    [isBotTurn, gameOver, pits]
  );

  useEffect(() => {
    if (isBotTurn && !gameOver) {
      const timer = setTimeout(() => {
        handleBotMove(pits);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isBotTurn, gameOver, pits, handleBotMove]);

  const boardWidth = Math.min(width - 32, 420);
  const pitSize = (boardWidth - 40) / 6;
  const storeW = 44;
  const storeH = pitSize * 2 + 20;

  const renderCell = (index) => {
    const gems = pits[index];
    const isStore = index === 6 || index === 13;
    const isPlayer = index < 6 || index === 6;
    const isEmpty = gems === 0;

    return (
      <TouchableOpacity
        key={index}
        activeOpacity={isStore ? 1 : 0.7}
        disabled={isStore || isBotTurn || gameOver || isEmpty || !isPlayer}
        onPress={() => handlePlayerMove(index)}
        style={[
          styles.cell,
          {
            width: isStore ? storeW : pitSize,
            height: isStore ? storeH : pitSize,
            opacity: isEmpty ? 0.35 : 1,
            backgroundColor: !isPlayer && !isStore ? '#111111' : undefined,
          },
        ]}
      >
        <Text
          style={[
            styles.cellNumber,
            {
              color: isPlayer ? '#4ade80' : '#f87171',
              fontSize: isStore ? pitSize * 0.5 : pitSize * 0.45,
            },
          ]}
        >
          {gems}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate('Home')}>
          <ChevronLeft size={22} color="#f4f4f5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bantumi</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Your Store</Text>
          <Text style={styles.statValue}>{pits[6]}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{isBotTurn ? 'Bot Turn' : 'Your Turn'}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Bot Store</Text>
          <Text style={styles.statValue}>{pits[13]}</Text>
        </View>
      </View>

      <View style={styles.boardWrap}>
        <View style={[styles.board, { width: boardWidth + storeW * 2 + 16 }]}>
          <View style={styles.row}>
            {renderCell(13)}
            <View style={styles.pitsRow}>
              {[12, 11, 10, 9, 8, 7].map((i) => renderCell(i))}
            </View>
            {renderCell(6)}
          </View>
          <View style={styles.row}>
            {renderCell(6)}
            <View style={styles.pitsRow}>
              {[0, 1, 2, 3, 4, 5].map((i) => renderCell(i))}
            </View>
            {renderCell(13)}
          </View>
        </View>
      </View>

      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>
            {winner === 'Player' ? 'You Win!' : winner === 'Bot' ? 'Bot Wins!' : 'Draw!'}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <RefreshCcw size={16} color="#f4f4f5" style={{ marginRight: 8 }} />
        <Text style={styles.resetText}>Reset Game</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090b',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f4f4f5',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 12,
    marginBottom: 8,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#27272a',
    minWidth: 100,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#71717a',
    letterSpacing: 1.5,
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#f4f4f5',
  },
  boardWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  board: {
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#18181b',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pitsRow: {
    flexDirection: 'row',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#27272a',
  },
  cellNumber: {
    fontWeight: '900',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9,9,11,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#f4f4f5',
    letterSpacing: 1,
  },
  resetButton: {
    backgroundColor: '#18181b',
    borderWidth: 1.5,
    borderColor: '#27272a',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resetText: {
    color: '#f4f4f5',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
