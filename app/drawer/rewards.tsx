import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RewardsScreen() {
  const navigation = useNavigation();
  const [rewards, setRewards] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedReward, setSelectedReward] = useState<any>(null);

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  useFocusEffect(
    useCallback(() => {
      fetchRewards();
    }, [])
  );

  const fetchRewards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const activePlayerId = await AsyncStorage.getItem('activePlayerId');
      
      let query = supabase.from('players').select('id, level').eq('parent_id', user.id);
      if (activePlayerId) query = query.eq('id', activePlayerId);
      else query = query.limit(1);

      const { data: players } = await query;
      const player = players && players.length > 0 ? players[0] : null;

      if (player) {
        setCurrentLevel(player.level);
        
        const { data: rewardsData } = await supabase
          .from('rewards')
          .select('*')
          .eq('player_id', player.id)
          .order('target_level', { ascending: true });
        
        setRewards(rewardsData || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePressReward = (item: any) => {
    if (currentLevel >= item.target_level) {
      setSelectedReward(item);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isUnlocked = currentLevel >= item.target_level;
    const isSpecial = item.target_level % 5 === 0;

    return (
      <TouchableOpacity 
        style={[styles.card, isUnlocked ? styles.unlockedCard : styles.lockedCard, isSpecial && styles.specialCard]}
        onPress={() => handlePressReward(item)}
        activeOpacity={isUnlocked ? 0.7 : 1}
      >
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.{item.target_level}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rewardTitle, isUnlocked && styles.unlockedText]}>{item.title}</Text>
          {isUnlocked ? (
            <Text style={styles.statusText}>🎁 GET! タップして開く</Text>
          ) : (
            <Text style={styles.lockText}>あと {item.target_level - currentLevel} レベル</Text>
          )}
        </View>
        <Ionicons name={isUnlocked ? (isSpecial ? "gift" : "cube-outline") : "lock-closed"} size={30} color={isUnlocked ? (isSpecial ? "#FF74B1" : "#00D4FF") : "#666"} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>TREASURY (宝物庫)</Text>
          <Text style={styles.subTitle}>現在のレベル: <Text style={styles.hl}>{currentLevel}</Text></Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={rewards}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>まだご褒美が設定されていません</Text>}
      />

      <Modal animationType="fade" transparent={true} visible={!!selectedReward} onRequestClose={() => setSelectedReward(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="sparkles" size={40} color="#FFD700" style={styles.sparkle1} />
            <Ionicons name="sparkles" size={30} color="#00D4FF" style={styles.sparkle2} />
            <Text style={styles.congratsTitle}>おめでとう！</Text>
            <View style={styles.giftIconContainer}>
              <Ionicons name="gift" size={80} color={selectedReward?.target_level % 5 === 0 ? "#FF74B1" : "#00D4FF"} />
            </View>
            <Text style={styles.rewardName}>{selectedReward?.title}</Text>
            <Text style={styles.rewardSubText}>レベル{selectedReward?.target_level} 達成のご褒美です！</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedReward(null)}>
              <Text style={styles.closeButtonText}>受け取る</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#1A1A2E' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', fontFamily: 'Orbitron_700Bold' },
  subTitle: { color: '#aaa', marginTop: 5 },
  hl: { color: '#00D4FF', fontWeight: 'bold', fontSize: 18 },
  iconButton: { padding: 8 },
  list: { padding: 20 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 50 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
  lockedCard: { backgroundColor: '#1E1E2E', borderColor: '#333' },
  unlockedCard: { backgroundColor: '#1A2A3A', borderColor: '#00D4FF' },
  specialCard: { borderColor: '#FF74B1', borderWidth: 2, backgroundColor: '#2A1A20' },
  levelBadge: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  levelText: { color: '#fff', fontWeight: 'bold' },
  rewardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  unlockedText: { color: '#00D4FF' },
  statusText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },
  lockText: { color: '#666', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  congratsTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  giftIconContainer: { marginBottom: 20, transform: [{ scale: 1.1 }] },
  rewardName: { fontSize: 22, fontWeight: 'bold', color: '#00D4FF', textAlign: 'center', marginBottom: 10 },
  rewardSubText: { fontSize: 14, color: '#666', marginBottom: 30, textAlign: 'center' },
  closeButton: { backgroundColor: '#333', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  closeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sparkle1: { position: 'absolute', top: 20, left: 30 },
  sparkle2: { position: 'absolute', top: 40, right: 30 },
});