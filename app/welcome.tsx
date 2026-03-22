import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT = '#00D4FF';
const BG = '#0A0A15';
const CARD = '#12121A';
const BORDER = '#1E1E2E';

const MOCK_QUESTS = [
  { title: '📚 宿題をやる', xp: 30 },
  { title: '🦷 歯みがきをする', xp: 20 },
  { title: '🛏️ お片付け', xp: 20 },
];

// ─── Step 1: ホーム画面 ───────────────────────────────────────
function SceneHome() {
  return (
    <View style={scene.container}>
      {/* ヘッダー */}
      <View style={scene.header}>
        <Ionicons name="menu" size={28} color="#fff" />
        <View>
          <Text style={scene.playerName}>サトシ</Text>
          <Text style={scene.levelText}>Lv.3</Text>
        </View>
        <Ionicons name="settings-sharp" size={24} color="#555" />
      </View>

      {/* XPバー */}
      <View style={scene.xpCard}>
        <Text style={scene.xpLabel}>次のレベルまで 35 XP</Text>
        <View style={scene.xpBarBg}>
          <View style={[scene.xpBarFill, { width: '65%', backgroundColor: ACCENT }]} />
        </View>
        <Text style={scene.xpSub}>本日の鑑定可能回数: 3 / 3</Text>
      </View>

      {/* クエスト一覧（ハイライト） */}
      <View style={[scene.card, scene.highlightBorder]}>
        <Text style={scene.cardTitle}>⚔️ 今日のクエスト</Text>
        {MOCK_QUESTS.map((q, i) => (
          <View key={i} style={scene.questRow}>
            <View style={scene.checkbox} />
            <Text style={scene.questText}>{q.title}</Text>
            <Text style={scene.questXp}>{q.xp} XP</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Step 2: 録音中 ───────────────────────────────────────────
function SceneRecording() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.25, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={scene.container}>
      <View style={scene.header}>
        <Ionicons name="menu" size={28} color="#fff" />
        <View>
          <Text style={scene.playerName}>サトシ</Text>
          <Text style={scene.levelText}>Lv.3</Text>
        </View>
        <Ionicons name="settings-sharp" size={24} color="#555" />
      </View>

      <View style={[scene.card, { marginTop: 12 }]}>
        <Text style={scene.cardTitle}>⚔️ 今日のクエスト</Text>
        {MOCK_QUESTS.map((q, i) => (
          <View key={i} style={scene.questRow}>
            <View style={scene.checkbox} />
            <Text style={scene.questText}>{q.title}</Text>
            <Text style={scene.questXp}>{q.xp} XP</Text>
          </View>
        ))}
      </View>

      {/* 録音中マイクボタン（パルスアニメ） */}
      <View style={scene.micArea}>
        <Animated.View style={[scene.micPulse, { transform: [{ scale: pulse }] }]} />
        <View style={[scene.micBtn, scene.highlightBorder, { borderRadius: 50 }]}>
          <Ionicons name="mic" size={32} color="#000" />
        </View>
        <Text style={scene.micCaption}>録音中… 🔴</Text>
      </View>
    </View>
  );
}

// ─── Step 3: AI鑑定結果モーダル ───────────────────────────────
function SceneResult() {
  return (
    <View style={scene.container}>
      {/* 背景（暗め） */}
      <View style={scene.modalOverlay} />

      {/* 結果カード */}
      <View style={[scene.resultCard, scene.highlightBorder]}>
        <Text style={scene.rankLabel}>✨ 鑑定結果</Text>
        <View style={[scene.rankBadge, { backgroundColor: '#FFD700' }]}>
          <Text style={scene.rankText}>S</Text>
        </View>
        <Text style={scene.xpGained}>+ 100 XP</Text>
        <Text style={scene.commentText}>
          「見事じゃ！宿題もしっかり終え、素晴らしい報告だったのう！この調子で続けるがよい！」
        </Text>
        <View style={scene.closeBtnMock}>
          <Text style={scene.closeBtnText}>閉じる</Text>
        </View>
      </View>
    </View>
  );
}

// ─── メイン ──────────────────────────────────────────────────
const STEPS = [
  {
    scene: <SceneHome />,
    title: 'クエストをクリアしよう！',
    description: '毎日のお手伝いや宿題がクエストに。終わったら声でギルドマスターに報告しよう！',
  },
  {
    scene: <SceneRecording />,
    title: 'マイクで報告するだけ！',
    description: 'ボタンを押して「終わったよ！」と話しかけるだけ。難しい入力は一切不要 🎤',
  },
  {
    scene: <SceneResult />,
    title: 'AIが即座に評価してくれる！',
    description: 'ギルドマスターのAIが頑張りを判定。SランクでXPが大量ゲット！レベルアップを目指せ ⚔️',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const isLast = step === STEPS.length - 1;

  const goNext = () => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -20, duration: 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
    setStep(step + 1);
  };

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
    <View style={styles.container}>
      {/* アプリ画面シーン（全画面） */}
      <Animated.View style={[styles.scene, { transform: [{ translateY: slideAnim }] }]}>
        {STEPS[step].scene}
      </Animated.View>

      {/* 下部オーバーレイカード */}
      <SafeAreaView style={styles.overlay} edges={['bottom']}>
        {/* ステップドット */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && { backgroundColor: ACCENT, width: 20 }]}
            />
          ))}
        </View>

        <Text style={styles.title}>{STEPS[step].title}</Text>
        <Text style={styles.desc}>{STEPS[step].description}</Text>

        {!isLast ? (
          <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
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
      </SafeAreaView>
    </View>
  );
}

// ─── Scene styles ─────────────────────────────────────────────
const scene = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, paddingHorizontal: 16, paddingTop: 50 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  playerName: { color: '#fff', fontSize: 15, fontWeight: 'bold', textAlign: 'right' },
  levelText: { color: ACCENT, fontSize: 12, textAlign: 'right' },
  xpCard: {
    backgroundColor: CARD, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: BORDER, marginBottom: 12,
  },
  xpLabel: { color: '#888899', fontSize: 11, marginBottom: 6 },
  xpBarBg: { height: 6, backgroundColor: BORDER, borderRadius: 3, marginBottom: 4 },
  xpBarFill: { height: 6, borderRadius: 3 },
  xpSub: { color: '#ff4500', fontSize: 11, marginTop: 2 },
  card: {
    backgroundColor: CARD, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  highlightBorder: {
    borderColor: ACCENT,
    borderWidth: 2,
    shadowColor: ACCENT,
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 12,
  },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
  questRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: {
    width: 16, height: 16, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#555', marginRight: 10,
  },
  questText: { flex: 1, color: '#ccc', fontSize: 13 },
  questXp: { color: ACCENT, fontSize: 11, fontWeight: 'bold' },

  // Recording scene
  micArea: { alignItems: 'center', marginTop: 30 },
  micPulse: {
    position: 'absolute',
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: ACCENT + '33',
  },
  micBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: ACCENT,
    justifyContent: 'center', alignItems: 'center',
  },
  micCaption: { color: '#ff4444', fontSize: 13, marginTop: 16, fontWeight: 'bold' },

  // Result scene
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  resultCard: {
    margin: 20, marginTop: 60,
    backgroundColor: CARD, borderRadius: 20, padding: 24,
    alignItems: 'center',
  },
  rankLabel: { color: '#888899', fontSize: 13, marginBottom: 12 },
  rankBadge: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  rankText: { fontSize: 36, fontWeight: 'bold', color: '#000' },
  xpGained: { color: '#FFD700', fontSize: 22, fontWeight: 'bold', marginBottom: 14 },
  commentText: { color: '#ccc', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  closeBtnMock: {
    backgroundColor: '#1E1E2E', borderRadius: 20,
    paddingVertical: 10, paddingHorizontal: 40,
  },
  closeBtnText: { color: '#888', fontSize: 13 },
});

// ─── Main styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scene: { flex: 1 },

  overlay: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10,10,21,0.92)',
    borderTopWidth: 1, borderTopColor: BORDER,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8,
  },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },

  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  desc: { color: '#888899', fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 20 },

  nextBtn: {
    backgroundColor: ACCENT, paddingVertical: 14,
    borderRadius: 30, alignItems: 'center', marginBottom: 8,
  },
  nextBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },

  authArea: { gap: 10, marginBottom: 4 },
  signupBtn: {
    backgroundColor: ACCENT, paddingVertical: 14,
    borderRadius: 30, alignItems: 'center',
  },
  signupBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  guestBtn: {
    paddingVertical: 12, borderRadius: 30,
    alignItems: 'center', borderWidth: 1, borderColor: '#333',
  },
  guestBtnText: { color: '#888', fontSize: 13 },
});
