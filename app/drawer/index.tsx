import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Quest {
  id: string;
  title: string;
  xp_reward: number;
  is_completed: boolean;
}

interface Player {
  id: string;
  level: number;
  total_xp: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // State管理
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [gateQuestion, setGateQuestion] = useState({ a: 0, b: 0 });
  const [gateAnswer, setGateAnswer] = useState('');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  // 画面フォーカス時にクエストを再取得
  useFocusEffect(
    useCallback(() => {
      fetchQuestsAndPlayer();
    }, [])
  );

  // クエストとプレイヤー情報を取得
  const fetchQuestsAndPlayer = async () => {
    try {
      setLoading(true);
      
      // 1. ログイン中のユーザーを取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('エラー', 'ログインしていません');
        return;
      }

      // 2. そのユーザーに紐づくプレイヤー（子供）を取得
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('id, level, total_xp')
        .eq('parent_id', user.id)
        .limit(1)
        .single();

      if (playerError || !playerData) {
        console.log('プレイヤーデータなし:', playerError);
        setQuests([]);
        setPlayer(null);
        setLoading(false);
        return;
      }

      setPlayer(playerData);

      // 3. そのプレイヤーの未完了クエストを取得
      const { data: questsData, error: questsError } = await supabase
        .from('quests')
        .select('*')
        .eq('player_id', playerData.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false });

      if (questsError) {
        console.error('クエスト取得エラー:', questsError);
        setQuests([]);
      } else {
        setQuests(questsData || []);
      }
    } catch (error) {
      console.error('fetchQuestsAndPlayer error:', error);
      Alert.alert('エラー', 'クエスト一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // クエスト完了処理
  const completeQuest = async (questId: string) => {
    try {
      // 完了対象のクエストを検索
      const questToComplete = quests.find(q => q.id === questId);
      if (!questToComplete || !player) {
        Alert.alert('エラー', 'クエストまたはプレイヤー情報が見つかりません');
        return;
      }

      // 1. クエストを完了状態に更新
      const { error: questError } = await supabase
        .from('quests')
        .update({ is_completed: true })
        .eq('id', questId);

      if (questError) {
        Alert.alert('エラー', 'クエストの完了に失敗しました');
        return;
      }

      // 2. プレイヤーの経験値を更新
      const newTotalXP = player.total_xp + questToComplete.xp_reward;
      const nextLevelXP = 100 * Math.pow(player.level, 2);
      
      // レベルアップしたかチェック
      let newLevel = player.level;
      if (newTotalXP >= nextLevelXP) {
        newLevel = player.level + 1;
      }

      const { error: playerError } = await supabase
        .from('players')
        .update({ 
          total_xp: newTotalXP,
          level: newLevel,
        })
        .eq('id', player.id);

      if (playerError) {
        Alert.alert('エラー', 'プレイヤーデータの更新に失敗しました');
        return;
      }

      // 3. ローカルステートを更新
      setQuests(quests.filter(q => q.id !== questId));
      setPlayer({
        ...player,
        total_xp: newTotalXP,
        level: newLevel,
      });

      // レベルアップしたか確認
      if (newLevel > player.level) {
        Alert.alert('🎉 レベルアップ！', `おめでとう！レベル${newLevel}に到達しました！`);
      } else {
        Alert.alert('成功', `クエストを完了しました！(+${questToComplete.xp_reward} XP)`);
      }
    } catch (error) {
      console.error('completeQuest error:', error);
      Alert.alert('エラー', 'クエスト完了処理に失敗しました');
    }
  };

  // ハンバーガーメニューを開く処理
  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  // 門番：計算問題を作成してモーダルを開く
  const openGate = () => {
    const a = Math.floor(Math.random() * 8) + 2; // 2~9
    const b = Math.floor(Math.random() * 8) + 2; // 2~9
    setGateQuestion({ a, b });
    setGateAnswer('');
    setIsGateOpen(true);
  };

  // 門番：答え合わせ
  const checkGateAnswer = () => {
    const correctAnswer = gateQuestion.a * gateQuestion.b;
    if (parseInt(gateAnswer) === correctAnswer) {
      setIsGateOpen(false);
      // 正解したらdrawer内のadmin画面へ遷移
      router.push('/drawer/admin'); 
    } else {
      Alert.alert('ちがうよ！', '計算まちがい。出直してこい！');
      setGateAnswer('');
    }
  };

  return (
    <View style={styles.container}>
      {/* カスタムヘッダー */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>冒険の記録</Text>

        <TouchableOpacity onPress={openGate} style={styles.iconButton}>
          <Ionicons name="settings-sharp" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.heroText}>今日のやることを確認して達成をしよう</Text>
        <Text style={styles.subText}>クエストをクリアしてレベルアップしよう。</Text>
        
        {/* プレイヤーレベル表示 */}
        {player && (
          <View style={styles.playerInfoCard}>
            <View style={styles.levelSection}>
              <Text style={styles.levelLabel}>現在のレベル</Text>
              <Text style={styles.levelValue}>Lv. {player.level}</Text>
            </View>
            <View style={styles.xpSection}>
              <Text style={styles.xpLabel}>現在の経験値</Text>
              <Text style={styles.xpValue}>{player.total_xp} XP</Text>
            </View>
            <View style={styles.nextLevelSection}>
              <Text style={styles.nextLevelLabel}>次のレベルまで</Text>
              <Text style={styles.nextLevelValue}>
                {Math.max(0, 100 * Math.pow(player.level, 2) - player.total_xp)} XP
              </Text>
            </View>
          </View>
        )}
        
        {/* クエストリスト */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D4FF" />
          </View>
        ) : quests.length > 0 ? (
          <FlatList
            data={quests}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
            renderItem={({ item }) => (
              <View style={styles.questCard}>
                <View style={styles.questContent}>
                  <Text style={styles.questTitle}>{item.title}</Text>
                  <Text style={styles.questXP}>報酬: {item.xp_reward} XP</Text>
                </View>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => completeQuest(item.id)}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#39FF14" />
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <View style={styles.placeholderCard}>
            <Text style={{color: '#666'}}>クエストはまだありません。管理者から新しいクエストを追加してもらいましょう！</Text>
          </View>
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
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setIsGateOpen(false)}
            >
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>ギルドマスター確認</Text>
            <Text style={styles.questionText}>
              {gateQuestion.a} × {gateQuestion.b} = ?
            </Text>

            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={gateAnswer}
              onChangeText={setGateAnswer}
              placeholder="答えを入力"
              autoFocus
            />

            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={checkGateAnswer}
            >
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#1A1A2E',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  iconButton: { padding: 8, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 20 },
  heroText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subText: { color: '#aaa', fontSize: 14, marginBottom: 30 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questCard: {
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00D4FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questContent: {
    flex: 1,
  },
  questTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  questXP: {
    color: '#00D4FF',
    fontSize: 12,
  },
  completeButton: {
    padding: 8,
  },
  placeholderCard: {
    backgroundColor: '#222',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed'
  },
  playerInfoCard: {
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  levelSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelLabel: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelValue: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  xpSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpLabel: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  xpValue: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextLevelSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextLevelLabel: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextLevelValue: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
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