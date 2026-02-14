import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quest' | 'reward'>('quest');

  // 目標用State
  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [yearlyGoal, setYearlyGoal] = useState('');

  // クエスト用State
  const [quests, setQuests] = useState<any[]>([]);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestXp, setNewQuestXp] = useState('10');

  // ご褒美用State
  const [rewards, setRewards] = useState<any[]>([]);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardLevel, setNewRewardLevel] = useState('5');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 目標データの取得（親IDに紐づく最初のプレイヤーのデータを代表として表示）
      const { data: players } = await supabase
        .from('players')
        .select('*')
        .eq('parent_id', user.id);
      
      if (players && players.length > 0) {
        // フォームが空の時だけセット（入力中の上書き防止）
        if (!monthlyGoal) setMonthlyGoal(players[0].goal_monthly || '');
        if (!yearlyGoal) setYearlyGoal(players[0].goal_yearly || '');
      }

      if (activeTab === 'quest') {
        const { data } = await supabase
          .from('quests')
          .select(`*, players (name)`)
          .eq('is_completed', false)
          .order('created_at', { ascending: false });
        setQuests(data || []);
      } else {
        const { data } = await supabase
          .from('rewards')
          .select(`*, players (name)`)
          .order('target_level', { ascending: true });
        setRewards(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // --- 目標更新処理 ---
  const handleUpdateGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 親IDに紐づく全プレイヤーの目標を一括更新
      const { error } = await supabase
        .from('players')
        .update({
          goal_monthly: monthlyGoal,
          goal_yearly: yearlyGoal
        })
        .eq('parent_id', user.id);

      if (error) throw error;
      Alert.alert("保存完了", "目標を更新しました！\nトップページに反映されます。");
    } catch (e) {
      Alert.alert("エラー", "更新に失敗しました");
      console.error(e);
    }
  };

  // --- クエスト追加処理 ---
  const handleAddQuest = async () => {
    if (!newQuestTitle.trim()) {
      Alert.alert("エラー", "クエスト名を入力してください");
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: players } = await supabase.from('players').select('id').eq('parent_id', user.id);
      if (!players || players.length === 0) {
        Alert.alert("エラー", "勇者が登録されていません");
        return;
      }

      const newItems = players.map(p => ({
        player_id: p.id,
        title: newQuestTitle,
        xp_reward: parseInt(newQuestXp) || 10,
        is_completed: false
      }));

      const { error } = await supabase.from('quests').insert(newItems);
      if (error) throw error;

      Alert.alert("完了", "勇者たちにクエストを配信しました！");
      setNewQuestTitle('');
      fetchData();
    } catch (e) {
      Alert.alert("エラー", "追加に失敗しました");
    }
  };

  const handleDeleteQuest = async (id: string) => {
    await supabase.from('quests').delete().eq('id', id);
    fetchData();
  };

  // --- ご褒美追加処理 ---
  const handleAddReward = async () => {
    if (!newRewardTitle.trim()) {
      Alert.alert("エラー", "ご褒美名を入力してください");
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: players } = await supabase.from('players').select('id').eq('parent_id', user.id);
      if (!players || players.length === 0) return;

      const newItems = players.map(p => ({
        player_id: p.id,
        title: newRewardTitle,
        target_level: parseInt(newRewardLevel) || 5,
        is_unlocked: false
      }));

      const { error } = await supabase.from('rewards').insert(newItems);
      if (error) throw error;

      Alert.alert("完了", "宝物庫にご褒美を追加しました！");
      setNewRewardTitle('');
      fetchData();
    } catch (e) {
      Alert.alert("エラー", "追加に失敗しました");
    }
  };

  const handleDeleteReward = async (id: string) => {
    await supabase.from('rewards').delete().eq('id', id);
    fetchData();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ギルド管理画面</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* タブ切り替え */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'quest' && styles.activeTab]}
            onPress={() => setActiveTab('quest')}
          >
            <Text style={[styles.tabText, activeTab === 'quest' && styles.activeTabText]}>📜 クエスト・目標</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'reward' && styles.activeTab]}
            onPress={() => setActiveTab('reward')}
          >
            <Text style={[styles.tabText, activeTab === 'reward' && styles.activeTabText]}>🎁 ご褒美</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          {activeTab === 'quest' ? (
            /* === クエスト・目標管理 === */
            <View>
              {/* 1. 目標設定セクション */}
              <View style={[styles.inputCard, { borderColor: '#FF74B1' }]}>
                <Text style={[styles.cardTitle, { color: '#FF74B1' }]}>目標設定</Text>
                <Text style={styles.subText}>トップページに表示される目標を設定します</Text>
                
                <Text style={styles.label}>📅 今月の目標</Text>
                <TextInput
                  style={styles.input}
                  placeholder="例：毎日7時に起きる"
                  placeholderTextColor="#666"
                  value={monthlyGoal}
                  onChangeText={setMonthlyGoal}
                />
                
                <Text style={styles.label}>🚩 今年の目標</Text>
                <TextInput
                  style={styles.input}
                  placeholder="例：逆上がりを成功させる"
                  placeholderTextColor="#666"
                  value={yearlyGoal}
                  onChangeText={setYearlyGoal}
                />
                
                <TouchableOpacity style={[styles.addButton, { backgroundColor: '#FF74B1' }]} onPress={handleUpdateGoals}>
                  <Ionicons name="save" size={20} color="#000" />
                  <Text style={styles.addButtonText}>目標を保存する</Text>
                </TouchableOpacity>
              </View>

              {/* 2. クエスト作成セクション */}
              <View style={styles.inputCard}>
                <Text style={styles.cardTitle}>クエスト作成</Text>
                <Text style={styles.subText}>全員にクエストを一括配信します</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="内容（例：お風呂掃除）"
                  placeholderTextColor="#666"
                  value={newQuestTitle}
                  onChangeText={setNewQuestTitle}
                />
                <View style={styles.row}>
                  <Text style={styles.label}>報酬XP:</Text>
                  <TextInput
                    style={[styles.input, styles.shortInput]}
                    placeholder="10"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={newQuestXp}
                    onChangeText={setNewQuestXp}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddQuest}>
                    <Ionicons name="add-circle" size={20} color="#000" />
                    <Text style={styles.addButtonText}>配信</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.sectionTitle}>進行中のクエスト</Text>
              {quests.map((q) => (
                <View key={q.id} style={styles.itemCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{q.title}</Text>
                    <Text style={styles.itemSub}>{q.players?.name} / {q.xp_reward}XP</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteQuest(q.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={20} color="#FF3131" />
                  </TouchableOpacity>
                </View>
              ))}
              {quests.length === 0 && <Text style={styles.emptyText}>クエストはありません</Text>}
            </View>
          ) : (
            /* === ご褒美管理 === */
            <View>
              <View style={[styles.inputCard, { borderColor: '#FFD700' }]}>
                <Text style={[styles.cardTitle, { color: '#FFD700' }]}>ご褒美の追加</Text>
                <Text style={styles.subText}>レベル達成時のご褒美を設定します</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="ご褒美（例：ゲーム1時間）"
                  placeholderTextColor="#666"
                  value={newRewardTitle}
                  onChangeText={setNewRewardTitle}
                />
                <View style={styles.row}>
                  <Text style={styles.label}>解放Lv:</Text>
                  <TextInput
                    style={[styles.input, styles.shortInput]}
                    placeholder="5"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={newRewardLevel}
                    onChangeText={setNewRewardLevel}
                  />
                  <TouchableOpacity style={[styles.addButton, { backgroundColor: '#FFD700' }]} onPress={handleAddReward}>
                    <Ionicons name="gift" size={20} color="#000" />
                    <Text style={styles.addButtonText}>追加</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.sectionTitle}>登録済みのご褒美</Text>
              {rewards.map((r) => (
                <View key={r.id} style={styles.itemCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{r.title}</Text>
                    <Text style={styles.itemSub}>{r.players?.name} / Lv.{r.target_level}で解放</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteReward(r.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={20} color="#FF3131" />
                  </TouchableOpacity>
                </View>
              ))}
              {rewards.length === 0 && <Text style={styles.emptyText}>ご褒美は設定されていません</Text>}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#333' 
  },
  backButton: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  tabContainer: { flexDirection: 'row', padding: 15, gap: 10 },
  tabButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#222', alignItems: 'center' },
  activeTab: { backgroundColor: '#333', borderWidth: 1, borderColor: '#666' },
  tabText: { color: '#666', fontWeight: 'bold' },
  activeTabText: { color: '#fff' },

  content: { padding: 20 },
  
  inputCard: { backgroundColor: '#1E1E2E', padding: 20, borderRadius: 12, marginBottom: 30, borderWidth: 1, borderColor: '#333' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  subText: { color: '#888', fontSize: 12, marginBottom: 15 },
  input: { backgroundColor: '#0A0A15', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#444', marginBottom: 15 },
  
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { color: '#fff', fontWeight: 'bold', marginBottom: 5 },
  shortInput: { width: 60, marginBottom: 0, textAlign: 'center' },
  addButton: { flex: 1, flexDirection: 'row', backgroundColor: '#00D4FF', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 5 },
  addButtonText: { color: '#000', fontWeight: 'bold' },

  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', padding: 15, borderRadius: 8, marginBottom: 10 },
  itemTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  itemSub: { color: '#888', fontSize: 12, marginTop: 4 },
  deleteBtn: { padding: 10 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },
});