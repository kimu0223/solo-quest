import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

type Quest = {
  id: string;
  title: string;
  xp_reward: number;
  is_completed: boolean;
};

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const explosionRef = useRef<any>(null);

  const [isGateOpen, setIsGateOpen] = useState(false);
  const [gateQuestion, setGateQuestion] = useState({ a: 0, b: 0 });
  const [gateAnswer, setGateAnswer] = useState('');

  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingIds, setCompletingIds] = useState<string[]>([]);

  const [playerName, setPlayerName] = useState('勇者');
  const [playerLevel, setPlayerLevel] = useState(1);
  const [manaColor, setManaColor] = useState('#00D4FF');
  const [currentXp, setCurrentXp] = useState(0);
  const [nextLevelXp, setNextLevelXp] = useState(100);

  const [goals, setGoals] = useState({ yearly: '', monthly: '' });
  const [nextReward, setNextReward] = useState<{ title: string, target_level: number } | null>(null);

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const fetchQuestsAndPlayer = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const activePlayerId = await AsyncStorage.getItem('activePlayerId');
      let query = supabase.from('players').select('*').eq('parent_id', user.id);

      if (activePlayerId) {
        query = query.eq('id', activePlayerId);
      } else {
        query = query.order('created_at', { ascending: false }).limit(1);
      }

      const { data: players } = await query;
      const player = players && players.length > 0 ? players[0] : null;

      if (player) {
        if (!activePlayerId) await AsyncStorage.setItem('activePlayerId', player.id);

        setPlayerName(player.display_name || player.name);
        setPlayerLevel(player.level);
        setManaColor(player.mana_color || '#00D4FF');
        setGoals({ yearly: player.goal_yearly, monthly: player.goal_monthly });
        
        const xp = player.total_xp || 0;
        const current = xp % 100;
        setCurrentXp(current);
        setNextLevelXp(100);

        const { data: reward } = await supabase.from('rewards').select('title, target_level').eq('player_id', player.id).gt('target_level', player.level).order('target_level', { ascending: true }).limit(1).single();
        setNextReward(reward || null);

        const { data: questsData } = await supabase.from('quests').select('*').eq('player_id', player.id).eq('is_completed', false).order('created_at', { ascending: false });
        setQuests(questsData || []);
      } else {
        router.replace('/onboarding');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchQuestsAndPlayer();
  }, [fetchQuestsAndPlayer]);

  useFocusEffect(useCallback(() => { 
    fetchQuestsAndPlayer(); 
  }, [fetchQuestsAndPlayer]));

  const runCompletionSequence = async (id: string, xp: number) => {
    setCompletingIds(prev => [...prev, id]);
    if (explosionRef.current) explosionRef.current.start();

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('quests').update({ is_completed: true }).eq('id', id);
      const activePlayerId = await AsyncStorage.getItem('activePlayerId');
      const { data: player } = await supabase.from('players').select('total_xp, level, id').eq('id', activePlayerId).single();
      if (player) {
        const newTotalXp = (player.total_xp || 0) + xp;
        const newLevel = Math.floor(newTotalXp / 100) + 1;
        await supabase.from('players').update({ total_xp: newTotalXp, level: newLevel }).eq('id', player.id);
        if (newLevel > player.level) {
          setTimeout(() => { Alert.alert("🎉 LEVEL UP!", `Lv.${newLevel} になりました！`); }, 1000);
        }
      }
    }
    setTimeout(() => { fetchQuestsAndPlayer(); setCompletingIds([]); }, 1500);
  };

  const progressPercent = Math.min((currentXp / nextLevelXp) * 100, 100);

  return (
    <View style={styles.container}>
      <ConfettiCannon count={200} origin={{x: -10, y: 0}} autoStart={false} ref={explosionRef} fadeOut={true} />
      <View style={[styles.header, { backgroundColor: manaColor + '33' || '#1A1A2E' }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}><Ionicons name="menu" size={28} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>冒険の記録</Text>
        <TouchableOpacity onPress={() => setIsGateOpen(true)} style={styles.iconButton}><Ionicons name="settings-sharp" size={24} color="#fff" /></TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.statusSection}>
          <Text style={styles.heroText}>{playerName}</Text>
          <View style={[styles.levelBadge, { backgroundColor: manaColor }]}>
            <Text style={styles.levelText}>Lv.{playerLevel}</Text>
          </View>
        </View>
        <View style={styles.xpBarContainer}>
          <View style={styles.xpBarBackground}>
            <View style={[styles.xpBarFill, { width: `${progressPercent}%`, backgroundColor: manaColor }]} />
          </View>
          <Text style={styles.xpLabel}>あと {nextLevelXp - currentXp} XP</Text>
        </View>
        {nextReward && (
          <View style={[styles.nextRewardCard, { borderColor: manaColor }]}>
            <Text style={styles.nextRewardTitle}>次のご褒美: {nextReward.title}</Text>
          </View>
        )}
        <FlatList
          data={quests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.questCard} onPress={() => runCompletionSequence(item.id, item.xp_reward)}>
              <Text style={styles.questTitle}>{item.title}</Text>
              <Ionicons name={completingIds.includes(item.id) ? "checkmark-circle" : "ellipse-outline"} size={24} color={manaColor} />
            </TouchableOpacity>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  iconButton: { padding: 8 },
  content: { flex: 1, padding: 20 },
  statusSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  heroText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginRight: 10 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  levelText: { color: '#000', fontWeight: 'bold' },
  xpBarContainer: { marginBottom: 20 },
  xpBarBackground: { height: 10, backgroundColor: '#333', borderRadius: 5 },
  xpBarFill: { height: '100%', borderRadius: 5 },
  xpLabel: { color: '#aaa', fontSize: 12, textAlign: 'right', marginTop: 5 },
  nextRewardCard: { padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, backgroundColor: '#1E1E2E' },
  nextRewardTitle: { color: '#fff', fontWeight: 'bold' },
  questCard: { backgroundColor: '#1E1E2E', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questTitle: { color: '#fff', fontSize: 16 },
});