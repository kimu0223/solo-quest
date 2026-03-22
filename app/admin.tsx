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
  
  // ★追加：勇者（子供）の選択用State
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'quest' | 'reward'>('quest');

  // 目標用State
  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [yearlyGoal, setYearlyGoal] = useState('');

  // クエスト用State
  const [quests, setQuests] = useState<any[]>([]);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestXp, setNewQuestXp] = useState('10');
  const [newQuestTimeLimit, setNewQuestTimeLimit] = useState('');

  // ご褒美用State
  const [rewards, setRewards] = useState<any[]>([]);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardLevel, setNewRewardLevel] = useState('5');

  // 1. 最初の読み込み（勇者たちのデータを取得）
  useEffect(() => {
    initLoad();
  }, []);

  // 2. 選択された勇者、またはタブが変わった時にデータを取得
  useEffect(() => {
    if (selectedPlayerId) {
      fetchTabData();
    }
  }, [selectedPlayerId, activeTab]);

  const initLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });
      
      if (playersData && playersData.length > 0) {
        setPlayers(playersData);
        setSelectedPlayerId(playersData[0].id); // 最初の勇者をデフォルト選択
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTabData = async () => {
    if (!selectedPlayerId) return;
    try {
      setLoading(true);

      // 選ばれた勇者の目標データを入力欄にセット
      const currentPlayer = players.find(p => p.id === selectedPlayerId);
      if (currentPlayer) {
        setMonthlyGoal(currentPlayer.goal_monthly || '');
        setYearlyGoal(currentPlayer.goal_yearly || '');
      }

      if (activeTab === 'quest') {
        const { data } = await supabase
          .from('quests')
          .select(`*, players (name)`)
          .eq('player_id', selectedPlayerId) // ★全員ではなく、選ばれた勇者だけ！
          .eq('is_completed', false)
          .order('created_at', { ascending: false });
        setQuests(data || []);
      } else {
        const { data } = await supabase
          .from('rewards')
          .select(`*, players (name)`)
          .eq('player_id', selectedPlayerId) // ★全員ではなく、選ばれた勇者だけ！
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
    if (!selectedPlayerId) return;
    try {
      const { error } = await supabase
        .from('players')
        .update({
          goal_monthly: monthlyGoal,
          goal_yearly: yearlyGoal
        })
        .eq('id', selectedPlayerId); // ★選ばれた勇者だけを更新

      if (error) throw error;
      Alert.alert("保存完了", "目標を更新しました！");
      
      // ローカルのデータも更新しておく（タブ切り替え時に消えないようにするため）
      setPlayers(prev => prev.map(p => 
        p.id === selectedPlayerId ? { ...p, goal_monthly: monthlyGoal, goal_yearly: yearlyGoal } : p
      ));
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
    if (!selectedPlayerId) return;
    
    try {
      const { error } = await supabase.from('quests').insert({
        player_id: selectedPlayerId, // ★選ばれた勇者にだけ追加
        title: newQuestTitle,
        xp_reward: parseInt(newQuestXp) || 10,
        time_limit: newQuestTimeLimit ? parseInt(newQuestTimeLimit) : null,
        is_completed: false
      });
      if (error) throw error;

      Alert.alert("完了", "クエストを配信しました！");
      setNewQuestTitle('');
      setNewQuestTimeLimit('');
      fetchTabData();
    } catch (e) {
      Alert.alert("エラー", "追加に失敗しました");
    }
  };

  const handleDeleteQuest = async (id: string) => {
    await supabase.from('quests').delete().eq('id', id);
    fetchTabData();
  };

  // --- ご褒美追加処理 ---
  const handleAddReward = async () => {
    if (!newRewardTitle.trim()) {
      Alert.alert("エラー", "ご褒美名を入力してください");
      return;
    }
    if (!selectedPlayerId) return;
    
    try {
      const { error } = await supabase.from('rewards').insert({
        player_id: selectedPlayerId, // ★選ばれた勇者にだけ追加
        title: newRewardTitle,
        target_level: parseInt(newRewardLevel) || 5,
        is_unlocked: false
      });
      if (error) throw error;

      Alert.alert("完了", "宝物庫にご褒美を追加しました！");
      setNewRewardTitle('');
      fetchTabData();
    } catch (e) {
      Alert.alert("エラー", "追加に失敗しました");
    }
  };

  const handleDeleteReward = async (id: string) => {
    await supabase.from('rewards').delete().eq('id', id);
    fetchTabData();
  };

  // 選択中の勇者のマナカラーを取得（デザイン反映用）
  const activePlayerColor = players.find(p => p.id === selectedPlayerId)?.mana_color || '#00D4FF';

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/drawer')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ギルド管理画面</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ★ 新機能：勇者選択タブ */}
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playerSelectContainer}>
            {players.map(p => (
              <TouchableOpacity 
                key={p.id} 
                style={[
                  styles.playerTab, 
                  selectedPlayerId === p.id && { borderColor: p.mana_color || '#00D4FF', backgroundColor: '#333' }
                ]}
                onPress={() => setSelectedPlayerId(p.id)}
              >
                <Text style={[
                  styles.playerTabText, 
                  selectedPlayerId === p.id && { color: p.mana_color || '#00D4FF', fontWeight: 'bold' }
                ]}>
                  {p.display_name || p.name} の設定
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* メニュータブ切り替え */}
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
            <View>
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
                
                <TouchableOpacity style={[styles.addButton, { backgroundColor: '#FF74B1', marginTop: 10 }]} onPress={handleUpdateGoals}>
                  <Ionicons name="save" size={20} color="#000" />
                  <Text style={styles.addButtonText}>目標を保存する</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputCard}>
                <Text style={styles.cardTitle}>クエスト作成</Text>
                <Text style={styles.subText}>このプレイヤーにクエストを配信します</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="内容（例：お風呂掃除）"
                  placeholderTextColor="#666"
                  value={newQuestTitle}
                  onChangeText={setNewQuestTitle}
                />
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>報酬XP:</Text>
                    <TextInput
                      style={[styles.input, styles.shortInput]}
                      placeholder="10"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={newQuestXp}
                      onChangeText={setNewQuestXp}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>目標時間(分):</Text>
                    <TextInput
                      style={[styles.input, styles.shortInput]}
                      placeholder="任意"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={newQuestTimeLimit}
                      onChangeText={setNewQuestTimeLimit}
                    />
                  </View>
                </View>
                
                <TouchableOpacity style={[styles.addButton, { marginTop: 10 }]} onPress={handleAddQuest}>
                  <Ionicons name="add-circle" size={20} color="#000" />
                  <Text style={styles.addButtonText}>配信</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>進行中のクエスト</Text>
              {quests.map((q) => (
                <View key={q.id} style={styles.itemCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{q.title}</Text>
                    <Text style={styles.itemSub}>
                      {q.xp_reward}XP
                      {q.time_limit ? ` / ⏳ ${q.time_limit}分` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteQuest(q.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={20} color="#FF3131" />
                  </TouchableOpacity>
                </View>
              ))}
              {quests.length === 0 && <Text style={styles.emptyText}>クエストはありません</Text>}
            </View>
          ) : (
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
                    <Text style={styles.itemSub}>Lv.{r.target_level}で解放</Text>
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
  
  // ★追加：勇者選択タブのスタイル
  playerSelectContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5 },
  playerTab: { 
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, 
    borderWidth: 1, borderColor: '#444', backgroundColor: '#1E1E2E', marginRight: 10 
  },
  playerTabText: { color: '#888', fontWeight: 'bold' },

  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5, gap: 10 },
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
  // ★ここを '100%' から 80 に修正しました
  shortInput: { width: 80, marginBottom: 0, textAlign: 'center' },
  addButton: { flexDirection: 'row', backgroundColor: '#00D4FF', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 5 },
  addButtonText: { color: '#000', fontWeight: 'bold' },

  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', padding: 15, borderRadius: 8, marginBottom: 10 },
  itemTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  itemSub: { color: '#888', fontSize: 12, marginTop: 4 },
  deleteBtn: { padding: 10 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },
});