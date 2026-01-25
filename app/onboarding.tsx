import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

  const createHero = async () => {
    if (!heroName.trim()) {
      Alert.alert('エラー', '勇者のなまえを入力してください');
      return;
    }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ログインセッションがありません');

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
        Alert.alert('成功', `${heroName}が仲間に加わった！`, [
          { text: '冒険へ', onPress: () => router.replace('/drawer') }
        ]);
      }

    } catch (e: any) {
      Alert.alert('エラー', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>新たな勇者を登録せよ</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>勇者のなまえ</Text>
        <TextInput
          style={styles.input}
          placeholder="例: サトシ"
          placeholderTextColor="#666"
          value={heroName}
          onChangeText={setHeroName}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>マナ・カラーを選択</Text>
        <View style={styles.colorGrid}>
          {MANA_COLORS.map((color) => (
            <TouchableOpacity
              key={color.value}
              style={[styles.colorCircle, { backgroundColor: color.value }, selectedColor === color.value && styles.selectedCircle]}
              onPress={() => setSelectedColor(color.value)}
            />
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={createHero} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'ギルドに申請中...' : '登録完了'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 40, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 40 },
  inputContainer: { marginBottom: 30 },
  label: { color: '#00D4FF', marginBottom: 10, fontSize: 14 },
  input: { backgroundColor: '#1E1E2E', color: '#fff', padding: 15, borderRadius: 8, fontSize: 16 },
  colorGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  colorCircle: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 2, borderColor: 'transparent' },
  selectedCircle: { borderColor: '#fff', borderWidth: 3 },
  button: { backgroundColor: '#00D4FF', padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});