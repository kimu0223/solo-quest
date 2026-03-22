import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT = '#00D4FF';

const MOCK_QUESTS = ['📚 宿題をやる', '🦷 歯みがきをする', '🛏️ お片付け'];

const STEPS = [
  {
    highlight: 'quests' as const,
    title: 'クエストをクリアしよう！',
    description: '毎日のお手伝いや宿題がクエストになってるよ。終わったら声で報告しよう！',
  },
  {
    highlight: 'mic' as const,
    title: 'マイクで報告するだけ！',
    description: '「終わったよ！」とマイクに話しかけるだけでOK。難しい入力は一切不要 🎤',
  },
  {
    highlight: 'xp' as const,
    title: 'AIが経験値をくれる！',
    description: 'ギルドマスターのAIが頑張りを評価。経験値が溜まってレベルアップ ⚔️',
  },
];

function glowStyle(highlight: string, key: string) {
  if (highlight !== key) return {};
  return {
    borderColor: ACCENT,
    borderWidth: 2,
    shadowColor: ACCENT,
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 14,
  };
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const isLast = step === STEPS.length - 1;
  const { highlight, title, description } = STEPS[step];

  const handleGuest = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      await AsyncStorage.setItem('isGuestUser', 'true');
      router.replace('/onboarding');
    } catch {
      Alert.alert('エラー', 'ゲストログインに失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      {/* ── モックアプリ画面 ── */}
      <View style={styles.mockScreen}>

        {/* XPバー・プレイヤー情報 */}
        <View style={[styles.mockCard, styles.playerCard, glowStyle(highlight, 'xp')]}>
          <View>
            <Text style={styles.mockName}>サトシ</Text>
            <Text style={styles.mockLevel}>Lv.3</Text>
          </View>
          <View style={styles.xpSection}>
            <Text style={styles.xpLabel}>XP 65 / 100</Text>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: '65%' }]} />
            </View>
          </View>
        </View>

        {/* クエスト一覧 */}
        <View style={[styles.mockCard, glowStyle(highlight, 'quests')]}>
          <Text style={styles.mockCardTitle}>⚔️ 今日のクエスト</Text>
          {MOCK_QUESTS.map((q, i) => (
            <View key={i} style={styles.questRow}>
              <View style={styles.checkbox} />
              <Text style={styles.questText}>{q}</Text>
            </View>
          ))}
        </View>

        {/* 鑑定ボタン */}
        <View style={[styles.micWrapper, glowStyle(highlight, 'mic')]}>
          <Ionicons name="mic" size={22} color="#000" />
          <Text style={styles.micLabel}>鑑定開始</Text>
        </View>

      </View>

      {/* ── ステップドット ── */}
      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === step && { backgroundColor: ACCENT, width: 20 }]}
          />
        ))}
      </View>

      {/* ── ツールチップ ── */}
      <View style={styles.tooltip}>
        <Text style={styles.tooltipTitle}>{title}</Text>
        <Text style={styles.tooltipDesc}>{description}</Text>

        {!isLast ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(step + 1)}>
            <Text style={styles.nextBtnText}>次へ →</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.authArea}>
            <TouchableOpacity
              style={styles.signupBtn}
              onPress={() => router.replace('/auth/login')}
            >
              <Text style={styles.signupBtnText}>アカウントを作成する</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestBtn}
              onPress={handleGuest}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#888" />
              ) : (
                <Text style={styles.guestBtnText}>ゲストとして試してみる</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A15' },

  // ── Mock screen ──
  mockScreen: {
    flex: 3,
    paddingHorizontal: 20,
    paddingTop: 16,
    justifyContent: 'center',
    gap: 12,
  },
  mockCard: {
    backgroundColor: '#12121A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mockName: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  mockLevel: { color: ACCENT, fontSize: 12, marginTop: 2 },
  xpSection: { flex: 1, marginLeft: 16 },
  xpLabel: { color: '#888899', fontSize: 11, marginBottom: 4 },
  xpBarBg: { height: 6, backgroundColor: '#1E1E2E', borderRadius: 3 },
  xpBarFill: { height: 6, backgroundColor: ACCENT, borderRadius: 3 },
  mockCardTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
  questRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: {
    width: 16, height: 16, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#888899',
    marginRight: 10,
  },
  questText: { color: '#ccc', fontSize: 13 },
  micWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    borderRadius: 30,
    paddingVertical: 12,
    gap: 8,
    alignSelf: 'center',
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  micLabel: { color: '#000', fontWeight: 'bold', fontSize: 14 },

  // ── Dots ──
  dots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 14, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },

  // ── Tooltip ──
  tooltip: {
    flex: 2,
    paddingHorizontal: 28,
    paddingTop: 4,
    paddingBottom: 8,
  },
  tooltipTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  tooltipDesc: {
    color: '#888899',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  nextBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  nextBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },

  // ── Auth buttons (last step) ──
  authArea: { gap: 12 },
  signupBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  signupBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  guestBtn: {
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  guestBtnText: { color: '#888', fontSize: 13 },
});
