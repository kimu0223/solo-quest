import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  
  const [player, setPlayer] = useState<any>(null);
  const [completedQuests, setCompletedQuests] = useState<any[]>([]);
  const [questCount, setQuestCount] = useState(0);

  // プレイヤーデータ取得
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const activePlayerId = await AsyncStorage.getItem('activePlayerId');
      
      let query = supabase.from('players').select('*').eq('parent_id', user.id);
      if (activePlayerId) query = query.eq('id', activePlayerId);
      else query = query.limit(1);

      const { data: players } = await query;
      const playerData = players && players.length > 0 ? players[0] : null;

      if (playerData) {
        setPlayer(playerData);
        
        // 完了したクエストの履歴を取得
        const { data: history, count } = await supabase
          .from('quests')
          .select('*', { count: 'exact' })
          .eq('player_id', playerData.id)
          .eq('is_completed', true)
          .order('created_at', { ascending: false });

        setCompletedQuests(history || []);
        setQuestCount(count || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const manaColor = player?.mana_color || '#00D4FF';

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={[styles.header, { backgroundColor: manaColor + '33' }]}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ギルドカード</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#fff" />}
      >
        {/* 冒険者カード（ステータス表示） */}
        <View style={[styles.profileCard, { borderColor: manaColor }]}>
          <View style={[styles.avatarCircle, { backgroundColor: manaColor }]}>
            <Ionicons name="person" size={50} color="#fff" />
          </View>
          <Text style={styles.name}>{player?.display_name || player?.name || '勇者'}</Text>
          <View style={[styles.levelBadge, { backgroundColor: '#FFD700' }]}>
            <Text style={styles.levelText}>Lv.{player?.level || 1}</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total XP</Text>
              <Text style={styles.statValue}>{player?.total_xp || 0}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Quests</Text>
              <Text style={styles.statValue}>{questCount}</Text>
            </View>
          </View>
        </View>

        {/* 冒険履歴（簡易表示） */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>最近の冒険 ({completedQuests.length})</Text>
          {completedQuests.slice(0, 5).map((quest) => (
            <View key={quest.id} style={styles.historyItem}>
              <Ionicons name="checkmark-circle" size={18} color={manaColor} style={styles.historyIcon} />
              <View style={{flex:1}}>
                <Text style={styles.historyTitle}>{quest.title}</Text>
                <Text style={styles.historyDate}>{new Date(quest.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.historyXp, { color: manaColor }]}>+{quest.xp_reward}XP</Text>
            </View>
          ))}
          {completedQuests.length === 0 && <Text style={styles.emptyText}>まだ履歴はありません</Text>}
        </View>
        
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  iconButton: { padding: 8 },
  content: { padding: 20 },
  
  profileCard: { backgroundColor: '#1E1E2E', borderRadius: 20, padding: 25, alignItems: 'center', marginBottom: 20, borderWidth: 2 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 20 },
  levelText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  statsGrid: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 15 },
  statItem: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, height: 30, backgroundColor: '#333' },
  statLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  sectionContainer: { backgroundColor: '#1E1E2E', borderRadius: 15, padding: 20, marginBottom: 20 },
  sectionHeaderTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  historyIcon: { marginRight: 12 },
  historyTitle: { color: '#ccc', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  historyDate: { color: '#666', fontSize: 11 },
  historyXp: { fontWeight: 'bold', fontSize: 14 },
  emptyText: { color: '#666', textAlign: 'center', padding: 10, fontSize: 13 },
});