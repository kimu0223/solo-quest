import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CompletedQuest {
  id: string;
  title: string;
  xp_reward: number;
  created_at: string;
}

export default function RewardsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [completedQuests, setCompletedQuests] = useState<CompletedQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRewards, setTotalRewards] = useState(0);

  // ハンバーガーメニューを開く処理
  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  // 画面フォーカス時に完了済みクエストを取得
  useFocusEffect(
    useCallback(() => {
      fetchCompletedQuests();
    }, [])
  );

  const fetchCompletedQuests = async () => {
    try {
      setLoading(true);

      // 1. ログイン中のユーザーを取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('エラー', 'ログインしていません');
        return;
      }

      // 2. そのユーザーに紐づくプレイヤーを取得
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('id')
        .eq('parent_id', user.id)
        .limit(1)
        .single();

      if (playerError || !player) {
        console.log('プレイヤーデータなし:', playerError);
        setCompletedQuests([]);
        setLoading(false);
        return;
      }

      // 3. 完了済みクエストを取得
      const { data: questsData, error: questsError } = await supabase
        .from('quests')
        .select('*')
        .eq('player_id', player.id)
        .eq('is_completed', true)
        .order('created_at', { ascending: false });

      if (questsError) {
        console.error('クエスト取得エラー:', questsError);
        setCompletedQuests([]);
      } else {
        setCompletedQuests(questsData || []);
        
        // 総報酬を計算
        const total = (questsData || []).reduce((sum, quest) => sum + (quest.xp_reward || 0), 0);
        setTotalRewards(total);
      }
    } catch (error) {
      console.error('fetchCompletedQuests error:', error);
      Alert.alert('エラー', 'ご褒美一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // バッジデータ（マイルストーン）
  const badges = [
    { id: 1, name: '最初の一歩', icon: 'flag', unlocked: completedQuests.length >= 1, description: 'クエスト1つ完了' },
    { id: 2, name: '順調な滑り出し', icon: 'star', unlocked: completedQuests.length >= 5, description: 'クエスト5つ完了' },
    { id: 3, name: '勇敢なる冒険者', icon: 'shield-checkmark', unlocked: completedQuests.length >= 10, description: 'クエスト10つ完了' },
    { id: 4, name: '伝説の勇士', icon: 'crown', unlocked: completedQuests.length >= 20, description: 'クエスト20つ完了' },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ご褒美・トレジャリー</Text>
          <View style={styles.iconButton} />
        </View>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ご褒美・トレジャリー</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* 総報酬セクション */}
        <View style={styles.totalRewardsSection}>
          <Ionicons name="gift" size={40} color="#FFD700" style={{ marginBottom: 10 }} />
          <Text style={styles.totalRewardsLabel}>総獲得報酬</Text>
          <Text style={styles.totalRewardsValue}>{totalRewards} XP</Text>
          <Text style={styles.completedCountText}>完了済みクエスト: {completedQuests.length}個</Text>
        </View>

        {/* バッジセクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>バッジ・達成</Text>
          <View style={styles.badgesGrid}>
            {badges.map((badge) => (
              <View key={badge.id} style={[styles.badgeCard, !badge.unlocked && styles.badgeLockedCard]}>
                <View style={[styles.badgeIconContainer, { opacity: badge.unlocked ? 1 : 0.4 }]}>
                  <Ionicons name={badge.icon as any} size={32} color={badge.unlocked ? '#FFD700' : '#666'} />
                </View>
                <Text style={[styles.badgeName, !badge.unlocked && styles.badgeLockedText]}>{badge.name}</Text>
                <Text style={[styles.badgeDesc, !badge.unlocked && styles.badgeLockedText]}>{badge.description}</Text>
                {badge.unlocked && <View style={styles.badgeCheckmark}>
                  <Ionicons name="checkmark-circle" size={20} color="#39FF14" />
                </View>}
              </View>
            ))}
          </View>
        </View>

        {/* 完了済みクエスト一覧 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>完了済みクエスト</Text>
          {completedQuests.length > 0 ? (
            <View style={styles.questsList}>
              {completedQuests.map((quest) => (
                <View key={quest.id} style={styles.completedQuestCard}>
                  <View style={styles.questCheckmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#39FF14" />
                  </View>
                  <View style={styles.questInfo}>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                    <Text style={styles.questDate}>
                      {new Date(quest.created_at).toLocaleDateString('ja-JP')}
                    </Text>
                  </View>
                  <Text style={styles.questReward}>+{quest.xp_reward} XP</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-outline" size={40} color="#666" />
              <Text style={styles.emptyText}>完了済みクエストはまだありません</Text>
              <Text style={styles.emptySubText}>クエストを完了してご褒美を獲得しよう！</Text>
            </View>
          )}
        </View>

        {/* コツのセクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>冒険のコツ</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color="#FFD700" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>毎日クエストをこなそう</Text>
              <Text style={styles.tipText}>クエストを続けることで、より多くのXPを獲得できます。</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#1A1A2E',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  iconButton: { padding: 8, width: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  contentContainer: {
    paddingBottom: 40,
  },
  totalRewardsSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1A1A2E',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  totalRewardsLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  totalRewardsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  completedCountText: {
    color: '#00D4FF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  badgeLockedCard: {
    borderColor: '#444',
    opacity: 0.6,
  },
  badgeIconContainer: {
    marginBottom: 8,
  },
  badgeName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDesc: {
    color: '#aaa',
    fontSize: 10,
    textAlign: 'center',
  },
  badgeLockedText: {
    color: '#666',
  },
  badgeCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  questsList: {
    gap: 12,
  },
  completedQuestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#39FF14',
  },
  questCheckmark: {
    marginRight: 12,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  questDate: {
    color: '#aaa',
    fontSize: 11,
  },
  questReward: {
    color: '#39FF14',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 12,
  },
  emptySubText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
    gap: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipText: {
    color: '#aaa',
    fontSize: 12,
  },
});