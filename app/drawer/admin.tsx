import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView, Platform, ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';

export default function AdminScreen() {
  const router = useRouter();
  const [questTitle, setQuestTitle] = useState('');
  const [xpReward, setXpReward] = useState('10'); // デフォルト報酬は10XP
  const [loading, setLoading] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  // 画面ロード時に、対象となる子供（勇者）のIDを取得する
  useEffect(() => {
    const fetchPlayer = async () => {
      // 1. ログイン中の親ユーザーを取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('エラー', 'ログインしていません');
        router.back();
        return;
      }

      // 2. その親に紐づくプレイヤー（子供）を取得
      // MVPでは「最初の1人」を対象とする
      const { data: player, error } = await supabase
        .from('players')
        .select('id')
        .eq('parent_id', user.id)
        .limit(1)
        .single();

      if (error || !player) {
        Alert.alert('エラー', '勇者データが見つかりません。ホーム画面に戻って作成してください。');
        console.error(error);
      } else {
        setPlayerId(player.id);
      }
    };

    fetchPlayer();
  }, [router]);

  const addQuest = async () => {
    if (!questTitle.trim()) {
      Alert.alert('エラー', 'クエスト名を入力してください');
      return;
    }
    if (!playerId) {
      Alert.alert('エラー', '勇者データが読み込めていません');
      return;
    }

    setLoading(true);
    
    // DBにクエストを追加
    const { error } = await supabase.from('quests').insert({
      title: questTitle,
      xp_reward: parseInt(xpReward) || 10,
      is_completed: false,
      player_id: playerId,
    });

    setLoading(false);

    if (error) {
      Alert.alert('エラー', 'クエストの追加に失敗しました');
      console.error(error);
    } else {
      Alert.alert('成功', '新しいクエストを追加しました！');
      setQuestTitle(''); // 入力欄をクリア
      setXpReward('10'); // 報酬をリセット
      // 1秒後にホーム画面へ戻る（アラート閉じるのを待つため）
      setTimeout(() => {
        router.push('/drawer/index');
      }, 1000);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* ヘッダー的な部分 */}
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={60} color="#00D4FF" style={{ marginBottom: 10 }} />
            <Text style={styles.title}>ギルドマスターの部屋</Text>
            <Text style={styles.subtitle}>新たなクエストを発注しよう</Text>
          </View>

          {/* 入力フォーム */}
          <View style={styles.form}>
            <Text style={styles.label}>クエスト名</Text>
            <TextInput
              style={styles.input}
              placeholder="例：算数プリント1枚"
              placeholderTextColor="#999"
              value={questTitle}
              onChangeText={setQuestTitle}
            />

            <Text style={styles.label}>報酬 (XP)</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={xpReward}
              onChangeText={setXpReward}
            />

            <TouchableOpacity 
              style={[styles.addButton, loading && styles.disabledButton]} 
              onPress={addQuest}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>クエスト追加</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20, paddingTop: 60, alignItems: 'center' },
  header: { marginBottom: 30, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  form: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 12, 
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20, backgroundColor: '#fafafa',
  },
  addButton: {
    backgroundColor: '#00D4FF', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    padding: 15, borderRadius: 30, marginTop: 10,
  },
  disabledButton: { backgroundColor: '#aaa' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  backButton: { marginTop: 30, padding: 10 },
  backButtonText: { color: '#666', fontSize: 16 },
});
