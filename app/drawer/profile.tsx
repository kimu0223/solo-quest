import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [player, setPlayer] = useState<any>(null);
  const [completedQuests, setCompletedQuests] = useState<any[]>([]);
  const [questCount, setQuestCount] = useState(0);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlayerData();
    }, [])
  );

  const fetchPlayerData = async () => {
    try {
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
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HERO DATA</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.profileCard, { borderColor: player?.mana_color || '#00D4FF' }]}>
          <View style={[styles.avatarCircle, { backgroundColor: player?.mana_color || '#333' }]}>
            <Ionicons name="person" size={50} color="#fff" />
          </View>
          <Text style={styles.name}>{player?.display_name || player?.name || '勇者'}</Text>
          <View style={styles.levelBadge}>
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

        {(player?.goal_yearly || player?.goal_monthly) && (
          <View style={styles.goalsSection}>
            <Text style={styles.sectionHeaderTitle}>現在の目標</Text>
            {player?.goal_yearly ? (
              <View style={styles.goalRow}>
                <Ionicons name="flag" size={20} color="#FF74B1" style={styles.goalIcon} />
                <View style={{flex:1}}>
                  <Text style={styles.goalLabel}>年間目標</Text>
                  <Text style={styles.goalText}>{player.goal_yearly}</Text>
                </View>
              </View>
            ) : null}
            {player?.goal_monthly ? (
              <View style={[styles.goalRow, { marginTop: 15 }]}>
                <Ionicons name="calendar" size={20} color="#00D4FF" style={styles.goalIcon} />
                <View style={{flex:1}}>
                  <Text style={styles.goalLabel}>今月の目標</Text>
                  <Text style={styles.goalText}>{player.goal_monthly}</Text>
                </View>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.historySection}>
          <TouchableOpacity 
            style={styles.historyHeader} 
            onPress={() => setIsHistoryExpanded(!isHistoryExpanded)}
            activeOpacity={0.7}
          >
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Ionicons name="time-outline" size={24} color="#00D4FF" style={{marginRight:10}} />
              <Text style={styles.sectionTitle}>冒険の履歴 ({completedQuests.length})</Text>
            </View>
            <Ionicons name={isHistoryExpanded ? "chevron-up" : "chevron-down"} size={24} color="#aaa" />
          </TouchableOpacity>

          {isHistoryExpanded && (
            <View style={styles.historyList}>
              {completedQuests.length > 0 ? (
                completedQuests.map((quest) => (
                  <View key={quest.id} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Ionicons name="checkmark-circle" size={18} color="#00D4FF" />
                    </View>
                    <View style={{flex:1}}>
                      <Text style={styles.historyTitle}>{quest.title}</Text>
                      <Text style={styles.historyDate}>{new Date(quest.created_at).toLocaleDateString()} 達成</Text>
                    </View>
                    <Text style={styles.historyXp}>+{quest.xp_reward}XP</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>まだ完了したタスクはありません</Text>
              )}
              <TouchableOpacity style={styles.closeHistoryButton} onPress={() => setIsHistoryExpanded(false)}>
                <Text style={styles.closeHistoryText}>閉じる</Text>
                <Ionicons name="chevron-up" size={16} color="#aaa" style={{marginLeft:4}} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#1A1A2E' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  iconButton: { padding: 8 },
  content: { padding: 20 },
  profileCard: { backgroundColor: '#1E1E2E', borderRadius: 20, padding: 25, alignItems: 'center', marginBottom: 20, borderWidth: 2 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  levelBadge: { backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 20 },
  levelText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  statsGrid: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 15 },
  statItem: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, height: 30, backgroundColor: '#333' },
  statLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  goalsSection: { backgroundColor: '#1E1E2E', borderRadius: 15, padding: 20, marginBottom: 20 },
  sectionHeaderTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  goalRow: { flexDirection: 'row', alignItems: 'flex-start' },
  goalIcon: { marginRight: 15, marginTop: 2 },
  goalLabel: { color: '#888', fontSize: 12, marginBottom: 2 },
  goalText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  historySection: { backgroundColor: '#1E1E2E', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333', marginBottom: 30 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#252535' },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  historyList: { padding: 15, backgroundColor: '#1E1E2E' },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  historyIcon: { marginRight: 12 },
  historyTitle: { color: '#ccc', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  historyDate: { color: '#666', fontSize: 11 },
  historyXp: { color: '#00D4FF', fontWeight: 'bold', fontSize: 14 },
  emptyText: { color: '#666', textAlign: 'center', padding: 20, fontSize: 13 },
  closeHistoryButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, marginTop: 5, borderTopWidth: 1, borderTopColor: '#333' },
  closeHistoryText: { color: '#aaa', fontSize: 14, fontWeight: '600' },
});