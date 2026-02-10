import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

const MANA_COLORS = [
  { name: 'ネイビー', value: '#1A1A2E' },
  { name: 'ライトブルー', value: '#00D4FF' },
  { name: 'ピンク', value: '#FF74B1' },
  { name: 'グリーン', value: '#39FF14' },
  { name: 'レッド', value: '#FF3131' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [heroName, setHeroName] = useState('');
  const [selectedColor, setSelectedColor] = useState(MANA_COLORS[1].value);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // ★ここが修正ポイント
  // 画面が開いた瞬間に「セッションの状態」を監視し始めます
  useEffect(() => {
    // 1. 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // セッションがなければログイン画面へ
        Alert.alert('再ログインが必要です', '有効なログイン情報が見つかりません。');
        router.replace('/auth/login');
      } else {
        // セッションがあれば準備完了
        setInitializing(false);
      }
    });

    // 2. セッション状態の変化も監視（途中でログアウトした場合など）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // router.replace('/auth/login'); // ※ループ防止のためここはコメントアウト推奨
      } else {
        setInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createHero = async () => {
    if (!heroName.trim()) {
      Alert.alert('エラー', '勇者のなまえを入力してください');
      return;
    }
    setLoading(true);

    try {
      // ユーザー情報の取得（セッション確認済みなので安全）
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('ログインセッションが無効です。再ログインしてください。');
      }

      // 勇者の新規作成
      const { data: newPlayer, error } = await supabase.from('players').insert({
        parent_id: user.id,
        name: heroName,
        display_name: heroName,
        mana_color: selectedColor,
        level: 1,
        total_xp: 0
      }).select().single();

      if (error) throw error;

      if (newPlayer) {
        await AsyncStorage.setItem('activePlayerId', newPlayer.id);
        router.replace('/drawer');
      }

    } catch (e: any) {
      console.error(e);
      Alert.alert('エラー', e.message);
      if (e.message.includes('セッション') || e.message.includes('無効')) {
        router.replace('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // ★読み込み中はローディング画面を出し続ける（これでエラーを防ぐ）
  if (initializing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00D4FF" />
        <Text style={{ color: '#fff', marginTop: 20 }}>ギルドに接続中...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>新たな勇者を登録せよ</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>勇者のなまえ</Text>
            <TextInput
              style={[styles.input, { borderColor: selectedColor }]}
              placeholder="例: サトシ"
              placeholderTextColor="#666"
              value={heroName}
              onChangeText={setHeroName}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>マナ・カラーを選択</Text>
            <View style={styles.colorGrid}>
              {MANA_COLORS.map((color) => {
                const isSelected = selectedColor === color.value;
                return (
                  <TouchableOpacity
                    key={color.value}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color.value },
                      isSelected ? styles.selectedBorder : styles.transparentBorder
                    ]}
                    onPress={() => setSelectedColor(color.value)}
                  />
                );
              })}
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: selectedColor }]} 
            onPress={createHero} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>登録完了</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: '#121212' },
  container: { flex: 1, padding: 40, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 40 },
  inputContainer: { marginBottom: 30 },
  label: { color: '#fff', marginBottom: 10, fontSize: 14, fontWeight: 'bold' },
  input: { backgroundColor: '#1E1E2E', color: '#fff', padding: 15, borderRadius: 8, fontSize: 16, borderWidth: 2 },
  colorGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  colorCircle: { width: 45, height: 45, borderRadius: 22.5, marginBottom: 10, borderWidth: 3 },
  selectedBorder: { borderColor: '#fff' },
  transparentBorder: { borderColor: 'transparent' },
  button: { padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});