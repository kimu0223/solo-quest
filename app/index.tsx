import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert, FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// クエストの型定義
type Quest = {
  id: string;
  title: string;
  xp_reward: number;
  is_completed: boolean;
};

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  
  // ゲートキーパー用のState
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [gateQuestion, setGateQuestion] = useState({ a: 0, b: 0 });
  const [gateAnswer, setGateAnswer] = useState('');

  // クエスト・プレイヤー用State
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playerName, setPlayerName] = useState('勇者');

  // ハンバーガーメニューを開く
  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  // ▼▼▼ データ取得ロジック ▼▼▼
  const fetchQuests = async () => {
    try {
      // 1. ログインユーザー取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. プレイヤー（子供）情報取得
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('id, display_name')
        .eq('parent_id', user.id)
        .limit(1)
        .single();

      if (playerError || !player) {
        console.log('プレイヤーが見つかりません');
        setLoading(false);
        return;
      }

      setPlayerName(player.display_name);

      // 3. 未完了のクエストを取得
      const { data: questsData, error: questsError } = await supabase
        .from('quests')
        .select('*')
        .eq('player_id', player.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false });

      if (questsError) {
        console.error(questsError);
      } else {
        setQuests(questsData || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 画面が表示されるたびにデータを再取得（管理画面から戻った時など）
  useFocusEffect(
    useCallback(() => {
      fetchQuests();
    }, [])
  );

  // 引っ張って更新
  const onRefresh = () => {
    setRefreshing(true);
    fetchQuests();
  };

  // ▼▼▼ クエスト完了処理 ▼▼▼
  const completeQuest = async (id: string, title: string, xp: number) => {
    Alert.alert(
      "クエスト完了！",
      `「${title}」を達成しましたか？\n報酬: ${xp} XP`,
      [
        { text: "まだ", style: "cancel" },
        { 
          text: "やった！", 
          onPress: async () => {
            // DB更新
            const { error } = await supabase
              .from('quests')
              .update({ is_completed: true })
              .eq('id', id);

            if (error) {
              Alert.alert("エラー", "更新に失敗しました");
            } else {
              // 成功したらリストから削除（ローカル更新）
              setQuests(current => current.filter(q => q.id !== id));
              // TODO: Day 9でここにXP加算処理とアニメーションを追加
            }
          } 
        }
      ]
    );
  };

  // ▼▼▼ ゲートキーパーロジック（変更なし） ▼▼▼
  const openGate = () => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    setGateQuestion({ a, b });
    setGateAnswer('');
    setIsGateOpen(true);
  };

  const checkGateAnswer = () => {
    const correctAnswer = gateQuestion.a * gateQuestion.b;
    if (parseInt(gateAnswer) === correctAnswer) {
      setIsGateOpen(false);
      router.push('/admin'); 
    } else {
      Alert.alert('ちがうよ！', '計算まちがい。出直してこい！');
      setGateAnswer('');
    }
  };

  // ▼▼▼ リストアイテムのレンダリング ▼▼▼
  const renderQuestItem = ({ item }: { item: Quest }) => (
    <TouchableOpacity 
      style={styles.questCard}
      onPress={() => completeQuest(item.id, item.title, item.xp_reward)}
    >
      <View style={styles.questInfo}>
        <Text style={styles.questTitle}>{item.title}</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>{item.xp_reward} XP</Text>
        </View>
      </View>
      <Ionicons name="ellipse-outline" size={28} color="#aaa" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>冒険の記録</Text>
        <TouchableOpacity onPress={openGate} style={styles.iconButton}>
          <Ionicons name="settings-sharp" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* メインコンテンツ */}
      <View style={styles.content}>
        <Text style={styles.heroText}>{playerName}、ようこそ！</Text>
        <Text style={styles.subText}>今日のクエストをクリアしよう。</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#00D4FF" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={quests}
            renderItem={renderQuestItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>現在クエストはありません</Text>
                <Text style={styles.emptySubText}>ギルドマスター（親）に頼んでみよう！</Text>
              </View>
            }
          />
        )}
      </View>

      {/* 門番モーダル */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isGateOpen}
        onRequestClose={() => setIsGateOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsGateOpen(false)}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>ギルドマスター確認</Text>
            <Text style={styles.questionText}>{gateQuestion.a} × {gateQuestion.b} = ?</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={gateAnswer}
              onChangeText={setGateAnswer}
              placeholder="答えを入力"
              autoFocus
            />
            <TouchableOpacity style={styles.confirmButton} onPress={checkGateAnswer}>
              <Text style={styles.confirmButtonText}>解除</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#1A1A2E',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  iconButton: { padding: 8 },
  content: { flex: 1, padding: 20 },
  heroText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subText: { color: '#aaa', fontSize: 14, marginBottom: 20 },
  
  // リスト関連スタイル
  listContent: { paddingBottom: 20 },
  questCard: {
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: '#00D4FF',
  },
  questInfo: { flex: 1 },
  questTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  xpBadge: { 
    backgroundColor: 'rgba(0, 212, 255, 0.1)', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 4 
  },
  xpText: { color: '#00D4FF', fontSize: 12, fontWeight: 'bold' },
  
  // 空の状態
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySubText: { color: '#666', fontSize: 14 },

  // モーダル
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 24, alignItems: 'center', elevation: 5,
  },
  closeButton: { position: 'absolute', top: 10, right: 10, padding: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  questionText: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: {
    width: '100%', height: 50, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, paddingHorizontal: 10, fontSize: 20, textAlign: 'center', marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#00D4FF', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25,
  },
  confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});