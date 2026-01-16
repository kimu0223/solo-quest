import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Player {
  id: string;
  name: string;
  level: number;
  total_xp: number;
  mana_color: string;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  // ハンバーガーメニューを開く処理
  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  // プレイヤーデータを取得
  const fetchPlayerData = useCallback(async () => {
    try {
      // 1. ログイン中のユーザーを取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('エラー', 'ログインしていません');
        return;
      }

      // 2. そのユーザーに紐づくプレイヤーを取得
      const { data: playerData, error } = await supabase
        .from('players')
        .select('*')
        .eq('parent_id', user.id)
        .limit(1)
        .single();

      if (error || !playerData) {
        console.error('プレイヤーデータ取得エラー:', error);
        return;
      }

      setPlayer(playerData);
      setLoading(false);
    } catch (error) {
      console.error('fetchPlayerData error:', error);
    }
  }, []);

  // 画面フォーカス時にプレイヤーデータを取得
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPlayerData();
    }, [fetchPlayerData])
  );

  // 画面マウント時、定期的にデータを更新（5秒ごと）
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchPlayerData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchPlayerData]);

  // XPからレベルを計算（レベル計算式: 100 * (Lv-1)^2）
  const getNextLevelXP = (level: number) => {
    return 100 * Math.pow(level, 2);
  };

  const currentLevelXP = player ? 100 * Math.pow(player.level - 1, 2) : 0;
  const nextLevelXP = player ? getNextLevelXP(player.level) : 0;
  const progressXP = player ? Math.min(player.total_xp - currentLevelXP, nextLevelXP - currentLevelXP) : 0;
  const maxProgressXP = player ? nextLevelXP - currentLevelXP : 100;
  const progressPercent = maxProgressXP > 0 ? (progressXP / maxProgressXP) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ヒーロー・データ</Text>
          <View style={styles.iconButton} />
        </View>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ヒーロー・データ</Text>
          <View style={styles.iconButton} />
        </View>
        <Text style={styles.errorText}>プレイヤーデータが見つかりません</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ヒーロー・データ</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* ヘッダー */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarCircle, { borderColor: player.mana_color || '#00D4FF' }]}>
            <Ionicons name="person-sharp" size={60} color={player.mana_color || '#00D4FF'} />
          </View>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.levelText}>Lv. {player.level}</Text>
        </View>

        {/* XPバー */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>経験値</Text>
          <View style={styles.xpBarContainer}>
            <View style={[styles.xpBar, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.xpText}>
            {Math.floor(progressXP)} / {Math.floor(maxProgressXP)} XP
          </Text>
        </View>

        {/* ステータス情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ステータス</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>総経験値</Text>
              <Text style={styles.statValue}>{player.total_xp}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>現在のレベル</Text>
              <Text style={styles.statValue}>{player.level}</Text>
            </View>
          </View>
        </View>

        {/* マナ・カラー情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>マナ・カラー</Text>
          <View style={styles.manaCard}>
            <View style={[styles.manaColorBox, { backgroundColor: player.mana_color || '#00D4FF' }]} />
            <Text style={styles.manaColorText}>{player.mana_color || '#00D4FF'}</Text>
          </View>
        </View>

        {/* 達成情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>達成</Text>
          <View style={styles.achievementCard}>
            <Ionicons name="trophy" size={32} color="#FFD700" />
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>勇者の試練</Text>
              <Text style={styles.achievementDesc}>レベル {player.level} に到達しました！</Text>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  playerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  levelText: {
    fontSize: 16,
    color: '#00D4FF',
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
  xpBarContainer: {
    height: 24,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#00D4FF',
  },
  xpBar: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 12,
  },
  xpText: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#00D4FF',
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    color: '#00D4FF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  manaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  manaColorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  manaColorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDesc: {
    color: '#aaa',
    fontSize: 12,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
});