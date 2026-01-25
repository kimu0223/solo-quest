import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function AdminScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');

  // 入力フォームの状態
  const [questTitle, setQuestTitle] = useState('');
  const [xpReward, setXpReward] = useState('10');
  const [rewardLevel, setRewardLevel] = useState('');
  const [rewardTitle, setRewardTitle] = useState('');
  const [goalYearly, setGoalYearly] = useState('');
  const [goalMonthly, setGoalMonthly] = useState('');

  // データ表示用
  const [completedQuests, setCompletedQuests] = useState<any[]>([]);

  // 初期ロード
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // ▼ 修正: 選択中のプレイヤーIDを取得して絞り込む ▼
      const activePlayerId = await AsyncStorage.getItem('activePlayerId');
      
      let query = supabase.from('players').select('*').eq('parent_id', user.id);
      if (activePlayerId) {
        query = query.eq('id', activePlayerId);
      } else {
        query = query.limit(1);
      }

      const { data: players } = await query;
      const player = players && players.length > 0 ? players[0] : null;

      if (player) {
        setPlayerId(player.id);
        setPlayerName(player.display_name || player.name); // 名前も取得
        setGoalYearly(player.goal_yearly || '');
        setGoalMonthly(player.goal_monthly || '');

        const { data: quests } = await supabase
          .from('quests')
          .select('*')
          .eq('player_id', player.id)
          .eq('is_completed', true)
          .order('created_at', { ascending: false })
          .limit(5);
        setCompletedQuests(quests || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addQuest = async () => {
    if (!questTitle.trim() || !playerId) return;
    setLoading(true);
    const { error } = await supabase.from('quests').insert({
      title: questTitle,
      xp_reward: parseInt(xpReward) || 10,
      is_completed: false,
      player_id: playerId,
    });
    setLoading(false);
    if (!error) {
      Alert.alert('成功', 'クエストを追加しました', [
        { text: 'OK', onPress: () => setQuestTitle('') }
      ]);
    } else {
      Alert.alert('エラー', error.message);
    }
  };

  const addReward = async () => {
    if (!rewardTitle.trim() || !rewardLevel || !playerId) return;
    setLoading(true);
    const { error } = await supabase.from('rewards').insert({
      player_id: playerId,
      target_level: parseInt(rewardLevel),
      title: rewardTitle,
    });
    setLoading(false);
    if (!error) {
      Alert.alert('成功', `Lv.${rewardLevel}のご褒美を設定しました`, [
        { text: 'OK', onPress: () => { setRewardTitle(''); setRewardLevel(''); } }
      ]);
    } else {
      Alert.alert('エラー', error.message);
    }
  };

  const updateGoals = async () => {
    if (!playerId) return;
    setLoading(true);
    const { error } = await supabase
      .from('players')
      .update({ goal_yearly: goalYearly, goal_monthly: goalMonthly })
      .eq('id', playerId);
    setLoading(false);
    if (!error) {
      Alert.alert('成功', '目標を更新しました');
    } else {
      Alert.alert('エラー', error.message);
    }
  };

  const handleClose = () => {
    router.replace('/drawer');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          
          <View style={styles.adBanner}>
            <Text style={styles.adText}>広告エリア (320x50)</Text>
          </View>

          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={40} color="#00D4FF" />
            <View style={{marginLeft: 10}}>
              <Text style={styles.title}>ギルド管理画面</Text>
              {/* 現在誰を管理しているか表示 */}
              <Text style={styles.subtitle}>Target: {playerName}</Text>
            </View>
          </View>

          {/* クエスト追加 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📜 新規クエスト発注</Text>
            <TextInput style={styles.input} placeholder="クエスト名" value={questTitle} onChangeText={setQuestTitle} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="報酬XP (例:10)" keyboardType="numeric" value={xpReward} onChangeText={setXpReward} />
              <TouchableOpacity style={styles.addButton} onPress={addQuest} disabled={loading}>
                <Text style={styles.buttonText}>追加</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ご褒美追加 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎁 ご褒美設定</Text>
            <Text style={styles.note}>5の倍数レベルは豪華にしよう！</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { width: 80 }]} placeholder="Lv" keyboardType="numeric" value={rewardLevel} onChangeText={setRewardLevel} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="ご褒美の内容" value={rewardTitle} onChangeText={setRewardTitle} />
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={addReward} disabled={loading}>
              <Text style={styles.buttonText}>ご褒美を登録</Text>
            </TouchableOpacity>
          </View>

          {/* 目標設定 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 目標設定</Text>
            <Text style={styles.label}>年間の目標</Text>
            <TextInput style={styles.input} placeholder="例：自転車に乗れるようになる" value={goalYearly} onChangeText={setGoalYearly} />
            <Text style={styles.label}>今月の目標</Text>
            <TextInput style={styles.input} placeholder="例：毎日7時に起きる" value={goalMonthly} onChangeText={setGoalMonthly} />
            <TouchableOpacity style={styles.actionButton} onPress={updateGoals} disabled={loading}>
              <Text style={styles.buttonText}>目標を更新</Text>
            </TouchableOpacity>
          </View>

          {/* 履歴 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ 最近完了したクエスト</Text>
            {completedQuests.map((q) => (
              <View key={q.id} style={styles.historyItem}>
                <Text style={styles.historyText}>{q.title}</Text>
                <Text style={styles.historyXp}>+{q.xp_reward} XP</Text>
              </View>
            ))}
            {completedQuests.length === 0 && <Text style={{ color: '#999' }}>履歴はありません</Text>}
          </View>

          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>閉じる</Text>
          </TouchableOpacity>

          <View style={[styles.adBanner, { marginTop: 20 }]}>
            <Text style={styles.adText}>広告エリア (320x50)</Text>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 50 },
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666' },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  note: { fontSize: 12, color: '#FF74B1', marginBottom: 8 },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#fafafa', marginBottom: 10 },
  addButton: { backgroundColor: '#00D4FF', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 8, height: 50 },
  actionButton: { backgroundColor: '#333', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyText: { fontSize: 14, color: '#333' },
  historyXp: { fontSize: 14, color: '#00D4FF', fontWeight: 'bold' },
  closeButton: { alignItems: 'center', padding: 15 },
  closeText: { color: '#666', fontSize: 16 },
  adBanner: {
    width: '100%', height: 60, backgroundColor: '#e0e0e0',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed',
  },
  adText: { color: '#999', fontSize: 12 },
});