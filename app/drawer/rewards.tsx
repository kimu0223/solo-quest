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
// ConfettiCannonの型定義がない場合のエラー回避
// @ts-ignore
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

export default function RewardsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<any[]>([]);
  const [playerLevel, setPlayerLevel] = useState(0);
  const [manaColor, setManaColor] = useState('#00D4FF');
  const [playerName, setPlayerName] = useState('');
  
  // 目標データ
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

  // リストのヘッダー（目標ボード）
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
      
      <View style={styles.divider} />
      <Text style={styles.listTitle}>🏆 レベルアップ報酬</Text>
    </View>
  );

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isUnlocked = playerLevel >= item.target_level;
    const isNext = !isUnlocked && (index === 0 || playerLevel >= rewards[index - 1]?.target_level);

    return (
      <View style={styles.timelineContainer}>
        {/* 左側のレベルライン */}
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

        {/* 右側のカード */}
        <TouchableOpacity
          activeOpacity={isUnlocked ? 0.7 : 1}
          onPress={() => handlePressReward(item)}
          style={[
            styles.card,
            isUnlocked ? { borderColor: manaColor, shadowColor: manaColor, shadowOpacity: 0.3, shadowRadius: 5 } : styles.cardLocked,
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
        ListHeaderComponent={ListHeader} // ヘッダーをここで指定
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

      {/* チケットモーダル */}
      <Modal visible={!!selectedReward} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          
          <View style={styles.ticketContainer}>
            {/* チケットの上部のギザギザ */}
            <View style={[styles.ticketJagged, { top: -10, borderBottomWidth: 10, borderBottomColor: '#fff' }]} />
            
            <View style={styles.ticketContent}>
              <Text style={styles.ticketHeader}>GIFT TICKET</Text>
              
              <View style={[styles.ticketIconCircle, { backgroundColor: manaColor + '22' }]}>
                 <Text style={{ fontSize: 60 }}>🎁</Text>
              </View>
              
              <Text style={styles.ticketTitle}>{selectedReward?.title}</Text>
              
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>プレイヤー名</Text>
                <Text style={styles.ticketValue}>{playerName} 殿</Text>
              </View>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>到達レベル</Text>
                <Text style={styles.ticketValue}>Lv.{selectedReward?.target_level}</Text>
              </View>

              <View style={styles.dashedLine} />

              <Text style={styles.ticketNote}>
                この画面を保護者の方に見せてください。{'\n'}
                ご褒美を受け取ったら「使ったよ！」を押してね。
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

            {/* チケットの下部のギザギザ */}
            <View style={[styles.ticketJagged, { bottom: -10, borderTopWidth: 10, borderTopColor: '#fff' }]} />
          </View>

          {/* クラッカーエフェクト（一番手前に表示） */}
          {showConfetti && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <ConfettiCannon count={200} origin={{x: width / 2, y: 0}} fadeOut={true} />
            </View>
          )}
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
  
  // 目標ボード
  goalsContainer: { marginBottom: 30 },
  goalCard: { backgroundColor: '#1E1E2E', padding: 15, borderRadius: 10, marginBottom: 12, borderLeftWidth: 5 },
  goalLabel: { color: '#999', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  goalText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 20 },
  listTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },

  // タイムライン（左側の線と丸）
  timelineContainer: { flexDirection: 'row', marginBottom: 0 },
  levelIndicator: { alignItems: 'center', width: 50, marginRight: 10 },
  levelCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', zIndex: 1 },
  levelCircleLocked: { borderColor: '#444', backgroundColor: '#222' },
  levelNumber: { fontWeight: 'bold', fontSize: 12 },
  line: { width: 2, flex: 1, marginVertical: -2 },

  // カード
  card: { flex: 1, backgroundColor: '#1E1E2E', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: 'transparent' },
  cardLocked: { backgroundColor: '#181820', borderColor: '#333', opacity: 0.6 },
  cardNext: { borderColor: '#666', borderStyle: 'dashed', opacity: 1 },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rewardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  statusText: { fontSize: 11, fontWeight: 'bold' },

  // 空の状態
  emptyContainer: { alignItems: 'center', marginTop: 30, opacity: 0.7 },
  emptyEmoji: { fontSize: 60, marginBottom: 10 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  emptySubText: { color: '#888', fontSize: 12 },

  // モーダル
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  ticketContainer: { width: '100%', maxWidth: 340, backgroundColor: '#fff', borderRadius: 0, alignItems: 'center', paddingVertical: 30, position: 'relative' },
  ticketJagged: { position: 'absolute', left: 0, right: 0, height: 10, borderColor: 'transparent', borderStyle: 'solid' },
  ticketContent: { alignItems: 'center', width: '100%', paddingHorizontal: 30 },
  ticketHeader: { fontSize: 20, fontWeight: '900', color: '#ccc', marginBottom: 20, letterSpacing: 4 },
  ticketIconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  ticketTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 25 },
  ticketInfo: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12 },
  ticketLabel: { color: '#999', fontSize: 13, fontWeight: 'bold' },
  ticketValue: { color: '#333', fontSize: 15, fontWeight: 'bold' },
  dashedLine: { width: '100%', height: 1, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', marginVertical: 20, borderRadius: 1 },
  ticketNote: { color: '#888', fontSize: 11, textAlign: 'center', lineHeight: 16 },
  useButton: { marginTop: 25, paddingHorizontal: 50, paddingVertical: 14, borderRadius: 30, elevation: 3 },
  useButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});