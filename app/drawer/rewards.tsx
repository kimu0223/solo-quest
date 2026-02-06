import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

export default function RewardsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<any[]>([]);
  const [playerLevel, setPlayerLevel] = useState(0);
  const [manaColor, setManaColor] = useState('#00D4FF');
  const [playerName, setPlayerName] = useState('');
  
  // ★追加: 目標データ
  const [goals, setGoals] = useState({ yearly: '', monthly: '' });
  
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const activePlayerId = await AsyncStorage.getItem('activePlayerId');
      if (!activePlayerId) return;

      const { data: player } = await supabase
        .from('players')
        .select('*')
        .eq('id', activePlayerId)
        .single();

      if (player) {
        setPlayerLevel(player.level);
        setManaColor(player.mana_color || '#00D4FF');
        setPlayerName(player.display_name || player.name);
        // ★追加: 目標をセット
        setGoals({ 
          yearly: player.goal_yearly || '（未設定）', 
          monthly: player.goal_monthly || '（未設定）' 
        });

        const { data: rewardsData } = await supabase
          .from('rewards')
          .select('*')
          .eq('player_id', activePlayerId)
          .order('target_level', { ascending: true });
        
        setRewards(rewardsData || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handlePressReward = (item: any) => {
    if (playerLevel >= item.target_level) {
      setSelectedReward(item);
      setShowConfetti(true);
    }
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isUnlocked = playerLevel >= item.target_level;
    const isNext = !isUnlocked && (index === 0 || playerLevel >= rewards[index - 1].target_level);

    return (
      <View style={styles.timelineContainer}>
        <View style={styles.levelIndicator}>
          <View style={[
            styles.levelCircle, 
            isUnlocked ? { backgroundColor: manaColor, borderColor: manaColor } : styles.levelCircleLocked
          ]}>
            <Text style={[styles.levelNumber, isUnlocked ? { color: '#fff' } : { color: '#999' }]}>
              {item.target_level}
            </Text>
          </View>
          {index < rewards.length - 1 && (
            <View style={[styles.line, isUnlocked ? { backgroundColor: manaColor } : { backgroundColor: '#333' }]} />
          )}
        </View>

        <TouchableOpacity
          activeOpacity={isUnlocked ? 0.7 : 1}
          onPress={() => handlePressReward(item)}
          style={[
            styles.card,
            isUnlocked ? { borderColor: manaColor, shadowColor: manaColor } : styles.cardLocked,
            isNext && styles.cardNext
          ]}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconBox, isUnlocked ? { backgroundColor: manaColor + '33' } : { backgroundColor: '#222' }]}>
              <Text style={{ fontSize: 30 }}>{isUnlocked ? '🎁' : '🔒'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rewardTitle, !isUnlocked && { color: '#777' }]}>{item.title}</Text>
              <Text style={[styles.statusText, isUnlocked ? { color: manaColor } : { color: '#555' }]}>
                {isUnlocked ? '✨ タップして使う！' : `あと ${item.target_level - playerLevel} レベル`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // ★追加: リストのヘッダーとして目標カードを表示
  const ListHeader = () => (
    <View style={styles.goalsContainer}>
      <View style={[styles.goalCard, { borderLeftColor: manaColor }]}>
        <Text style={styles.goalLabel}>📅 今月の目標</Text>
        <Text style={styles.goalText}>{goals.monthly}</Text>
      </View>
      <View style={[styles.goalCard, { borderLeftColor: '#FFD700' }]}>
        <Text style={styles.goalLabel}>🚩 今年の目標</Text>
        <Text style={styles.goalText}>{goals.yearly}</Text>
      </View>
      <Text style={styles.listTitle}>🏆 レベルアップ報酬</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: manaColor + '33' }]}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ご褒美の宝物庫</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader} // ★ここでヘッダーを指定
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#fff" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>まだご褒美が設定されていません。</Text>
            <Text style={styles.emptySubText}>お父さん・お母さんにお願いしてみよう！</Text>
          </View>
        }
      />

      <Modal visible={!!selectedReward} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          {showConfetti && <ConfettiCannon count={200} origin={{x: -10, y: 0}} fadeOut={true} />}
          
          <View style={styles.ticketContainer}>
            <View style={[styles.ticketJagged, { top: -10, borderBottomWidth: 10 }]} />
            <View style={styles.ticketContent}>
              <Text style={styles.ticketHeader}>ごほうび引換券</Text>
              <View style={[styles.ticketIconCircle, { backgroundColor: manaColor + '22' }]}>
                 <Text style={{ fontSize: 60 }}>🎁</Text>
              </View>
              <Text style={styles.ticketTitle}>{selectedReward?.title}</Text>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>勇者名</Text>
                <Text style={styles.ticketValue}>{playerName} 殿</Text>
              </View>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>到達レベル</Text>
                <Text style={styles.ticketValue}>Lv.{selectedReward?.target_level}</Text>
              </View>
              <Text style={styles.ticketNote}>
                この画面を保護者の方に見せてください。{'\n'}
                ご褒美を受け取ったら閉じてね！
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.useButton, { backgroundColor: manaColor }]}
              onPress={() => {
                setSelectedReward(null);
                setShowConfetti(false);
              }}
            >
              <Text style={styles.useButtonText}>使ったよ！ (閉じる)</Text>
            </TouchableOpacity>
            <View style={[styles.ticketJagged, { bottom: -10, borderTopWidth: 10 }]} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  iconButton: { padding: 8 },
  listContent: { padding: 20, paddingBottom: 100 },
  
  // ★追加: 目標ボードのスタイル
  goalsContainer: { marginBottom: 30 },
  goalCard: { backgroundColor: '#1E1E2E', padding: 15, borderRadius: 10, marginBottom: 12, borderLeftWidth: 5 },
  goalLabel: { color: '#999', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  goalText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  listTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },

  timelineContainer: { flexDirection: 'row', marginBottom: 0 },
  levelIndicator: { alignItems: 'center', width: 60 },
  levelCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', zIndex: 1 },
  levelCircleLocked: { borderColor: '#444', backgroundColor: '#222' },
  levelNumber: { fontWeight: 'bold', fontSize: 14 },
  line: { width: 4, flex: 1, marginVertical: -2 },

  card: { flex: 1, backgroundColor: '#1E1E2E', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 2, borderColor: 'transparent' },
  cardLocked: { backgroundColor: '#181820', borderColor: '#333', opacity: 0.8 },
  cardNext: { borderColor: '#555', borderStyle: 'dashed' },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rewardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  statusText: { fontSize: 12, fontWeight: 'bold' },

  emptyContainer: { alignItems: 'center', marginTop: 50, opacity: 0.7 },
  emptyEmoji: { fontSize: 80, marginBottom: 20, opacity: 0.5 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  emptySubText: { color: '#888', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  ticketContainer: { width: '100%', maxWidth: 350, backgroundColor: '#fff', borderRadius: 0, alignItems: 'center', paddingVertical: 40, position: 'relative' },
  ticketJagged: { position: 'absolute', left: 0, right: 0, height: 10, borderColor: '#fff', borderStyle: 'dashed', backgroundColor: 'transparent' },
  ticketContent: { alignItems: 'center', width: '100%', paddingHorizontal: 30 },
  ticketHeader: { fontSize: 24, fontWeight: '900', color: '#333', marginBottom: 30, letterSpacing: 2, borderBottomWidth: 2, borderBottomColor: '#333', paddingBottom: 5 },
  ticketIconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  ticketTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 30 },
  ticketInfo: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10 },
  ticketLabel: { color: '#999', fontSize: 14, fontWeight: 'bold' },
  ticketValue: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  ticketNote: { marginTop: 30, color: '#666', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  useButton: { marginTop: 30, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30, elevation: 5 },
  useButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});