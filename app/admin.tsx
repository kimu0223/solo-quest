import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false); // 更新用
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');

  // 入力フォームの状態
  const [questTitle, setQuestTitle] = useState('');
  const [xpReward, setXpReward] = useState('10');
  const [rewardLevel, setRewardLevel] = useState('');
  const [rewardTitle, setRewardTitle] = useState('');
  const [goalYearly, setGoalYearly] = useState('');
  const [goalMonthly, setGoalMonthly] = useState('');

  const [completedQuests, setCompletedQuests] = useState<any[]>([]);
  const [appraisalLogs, setAppraisalLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const activePlayerId = await AsyncStorage.getItem('activePlayerId');
      let query = supabase.from('players').select('*').eq('parent_id', user.id);
      if (activePlayerId) query = query.eq('id', activePlayerId);
      else query = query.limit(1);

      const { data: players } = await query;
      const player = players && players.length > 0 ? players[0] : null;

      if (player) {
        setPlayerId(player.id);
        setPlayerName(player.display_name || player.name);
        setGoalYearly(player.goal_yearly || '');
        setGoalMonthly(player.goal_monthly || '');

        // 完了済みクエスト履歴取得
        const { data: quests } = await supabase
          .from('quests')
          .select('*')
          .eq('player_id', player.id)
          .eq('is_completed', true)
          .order('created_at', { ascending: false })
          .limit(5);
        setCompletedQuests(quests || []);

        // AI鑑定ログ取得 (件数を10件に増やしました)
        const { data: logs } = await supabase
          .from('appraisal_logs')
          .select('*')
          .eq('player_id', player.id)
          .order('created_at', { ascending: false })
          .limit(10);
        setAppraisalLogs(logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  // クエスト追加
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
      Alert.alert('成功', 'クエストを追加しました');
      setQuestTitle('');
      // fetchDataは呼ばずとも次回ロードで反映されるが、即時反映したい場合は呼んでもOK
    } else {
      Alert.alert('エラー', error.message);
    }
  };

  // ご褒美設定
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
      Alert.alert('成功', `Lv.${rewardLevel}のご褒美を設定しました`);
      setRewardTitle('');
      setRewardLevel('');
    } else {
      Alert.alert('エラー', error.message);
    }
  };

  // 目標更新
  const updateGoals = async () => {
    if (!playerId) return;
    setLoading(true);
    const { error } = await supabase
      .from('players')
      .update({ goal_yearly: goalYearly, goal_monthly: goalMonthly })
      .eq('id', playerId);
    setLoading(false);
    if (!error) Alert.alert('成功', '目標を更新しました');
    else Alert.alert('エラー', error.message);
  };

  // ★追加: ランクに応じた色を返す関数
  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'S': return '#FFD700'; // Gold
      case 'A': return '#FF4500'; // OrangeRed
      case 'B': return '#1E90FF'; // DodgerBlue
      case 'RETRY': return '#999';
      default: return '#999';
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
      >
        <View style={styles.container}>
          
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={40} color="#00D4FF" />
            <View style={{marginLeft: 10}}>
              <Text style={styles.title}>ギルド管理画面</Text>
              <Text style={styles.subtitle}>Target: {playerName}</Text>
            </View>
          </View>

          {/* ▼ リッチになったAI鑑定履歴セクション ▼ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎙️ AI鑑定履歴 (最新10件)</Text>
            {appraisalLogs.length === 0 ? (
              <Text style={styles.emptyText}>まだ履歴がありません</Text>
            ) : (
              appraisalLogs.map((log) => (
                <View key={log.id} style={styles.logCard}>
                  {/* ヘッダー部分：日付とランク */}
                  <View style={styles.logHeader}>
                    <Text style={styles.logDate}>
                      {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                    <View style={[styles.rankBadge, { backgroundColor: getRankColor(log.ai_rank) }]}>
                      <Text style={styles.rankText}>{log.ai_rank}</Text>
                    </View>
                  </View>
                  
                  {/* 子供の発言 */}
                  <View style={styles.bubbleContainer}>
                    <Text style={styles.transcriptLabel}>🗣️ {playerName}:</Text>
                    <Text style={styles.transcriptText}>{log.transcript}</Text>
                  </View>

                  {/* AIのコメント（ここが重要！） */}
                  <View style={[styles.bubbleContainer, styles.aiBubble]}>
                    <Text style={styles.transcriptLabel}>🤖 AIマスター:</Text>
                    <Text style={styles.aiCommentText}>{log.ai_comment}</Text>
                  </View>
                  
                  {/* 獲得XP */}
                  <Text style={styles.logXp}>獲得: +{log.xp_awarded || 0} XP</Text>
                </View>
              ))
            )}
          </View>

          {/* 1. クエスト発注 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📜 新規クエスト発注</Text>
            <TextInput style={styles.input} placeholder="クエスト名" value={questTitle} onChangeText={setQuestTitle} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="報酬XP" keyboardType="numeric" value={xpReward} onChangeText={setXpReward} />
              <TouchableOpacity style={styles.addButton} onPress={addQuest} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>追加</Text>}
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. ご褒美設定 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎁 ご褒美設定</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { width: 60 }]} placeholder="Lv" keyboardType="numeric" value={rewardLevel} onChangeText={setRewardLevel} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="ご褒美の内容" value={rewardTitle} onChangeText={setRewardTitle} />
              <TouchableOpacity style={styles.addButton} onPress={addReward}>
                <Text style={styles.buttonText}>設定</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. 目標設定 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 目標更新</Text>
            <TextInput style={styles.input} placeholder="年間の目標" value={goalYearly} onChangeText={setGoalYearly} />
            <TextInput style={styles.input} placeholder="今月の目標" value={goalMonthly} onChangeText={setGoalMonthly} />
            <TouchableOpacity style={styles.saveButton} onPress={updateGoals}>
              <Text style={styles.buttonText}>目標を保存する</Text>
            </TouchableOpacity>
          </View>

          {/* 5. 完了済みクエスト */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ 完了済みクエスト（直近5件）</Text>
            {completedQuests.map((q) => (
              <View key={q.id} style={styles.historyItem}>
                <Text style={styles.historyText}>{q.title}</Text>
                <Text style={styles.historyXp}>+{q.xp_reward} XP</Text>
              </View>
            ))}
            {completedQuests.length === 0 && <Text style={styles.emptyText}>完了したクエストはありません</Text>}
          </View>

          <TouchableOpacity onPress={() => router.replace('/drawer')} style={styles.closeButton}>
            <Text style={styles.closeText}>ホームに戻る</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 50 },
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666' },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  // ▼ ログカードのリッチスタイル ▼
  logCard: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  logDate: { fontSize: 12, color: '#999' },
  rankBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 6, minWidth: 30, alignItems: 'center' },
  rankText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  bubbleContainer: { marginBottom: 6 },
  aiBubble: { marginTop: 4, paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: '#00D4FF', backgroundColor: '#f0faff', paddingVertical: 4, borderRadius: 4 },
  transcriptLabel: { fontSize: 10, color: '#999', marginBottom: 2 },
  transcriptText: { fontSize: 14, color: '#333', lineHeight: 20 },
  aiCommentText: { fontSize: 14, color: '#005577', fontStyle: 'italic', lineHeight: 20, fontWeight: '500' },
  logXp: { fontSize: 12, color: '#FFD700', fontWeight: 'bold', textAlign: 'right', marginTop: 5 },

  // その他共通
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#fafafa', marginBottom: 10 },
  addButton: { backgroundColor: '#00D4FF', paddingHorizontal: 15, justifyContent: 'center', borderRadius: 8, height: 45 },
  saveButton: { backgroundColor: '#333', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyText: { fontSize: 14, color: '#333' },
  historyXp: { fontSize: 14, color: '#00D4FF', fontWeight: 'bold' },
  emptyText: { color: '#999', fontSize: 12, textAlign: 'center', padding: 10 },
  closeButton: { alignItems: 'center', padding: 15, backgroundColor: '#eee', borderRadius: 30, marginTop: 10 },
  closeText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});