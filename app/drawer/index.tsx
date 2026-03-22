import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  LogBox,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import CircularProgress from 'react-native-circular-progress-indicator';

LogBox.ignoreLogs([
  '[Reanimated] `createAnimatedPropAdapter` is no longer necessary',
]);

const DAILY_LIMIT = 3;

// ダークネイビーの世界観のカラーパレット
const COLORS = {
  background: '#0A0A15',
  cardBg: '#12121A',
  border: '#1E1E2E',
  text: '#FFFFFF',
  subText: '#888899',
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const [player, setPlayer] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [nextReward, setNextReward] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [showResultModal, setShowResultModal] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [dailyCount, setDailyCount] = useState(0);

  useEffect(() => {
    fetchData();
    checkDailyLimit();
    return () => {
      try {
        if (recorder.isRecording) {
          recorder.stop();
        }
      } catch (e) {}
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const activePlayerId = await AsyncStorage.getItem('activePlayerId');
      
      let query = supabase.from('players').select('*').eq('parent_id', user.id);
      if (activePlayerId) query = query.eq('id', activePlayerId);
      else query = query.limit(1);

      const { data: players } = await query;
      
      if (players && players.length > 0) {
        const currentPlayer = players[0];
        setPlayer(currentPlayer);
        await AsyncStorage.setItem('activePlayerId', currentPlayer.id);

        const { data: questsData } = await supabase
          .from('quests')
          .select('*')
          .eq('player_id', currentPlayer.id)
          .eq('is_completed', false)
          .order('created_at', { ascending: false });
        
        setQuests(questsData || []);

        const { data: rewardsData } = await supabase
          .from('rewards')
          .select('*')
          .eq('player_id', currentPlayer.id)
          .gt('target_level', currentPlayer.level)
          .order('target_level', { ascending: true })
          .limit(1);
        
        if (rewardsData && rewardsData.length > 0) {
          setNextReward(rewardsData[0]);
        } else {
          setNextReward(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkDailyLimit = async () => {
    try {
      const today = new Date().toDateString();
      const savedDate = await AsyncStorage.getItem('lastUsageDate');
      const savedCount = await AsyncStorage.getItem('dailyUsageCount');

      if (savedDate !== today) {
        await AsyncStorage.setItem('lastUsageDate', today);
        await AsyncStorage.setItem('dailyUsageCount', '0');
        setDailyCount(0);
      } else {
        setDailyCount(parseInt(savedCount || '0', 10));
      }
    } catch (e) {
      console.error("Limit check error:", e);
    }
  };

  const incrementDailyCount = async () => {
    try {
      const newCount = dailyCount + 1;
      setDailyCount(newCount);
      await AsyncStorage.setItem('dailyUsageCount', newCount.toString());
    } catch (e) {
      console.error("Increment error:", e);
    }
  };

  const handleCompleteQuest = async (quest: any) => {
    Alert.alert(
      "クエスト完了！",
      `「${quest.title}」を完了にして、${quest.xp_reward} XPを受け取りますか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "受け取る！",
          onPress: async () => {
            try {
              const { error } = await supabase.from('quests').update({ is_completed: true }).eq('id', quest.id);
              if (error) throw error;
              await giveExperience(quest.xp_reward);
              setQuests((prev) => prev.filter((q) => q.id !== quest.id));
              Alert.alert("やったね！", `${quest.xp_reward} XP ゲット！`);
            } catch (e) {
              console.error(e);
              Alert.alert("エラー", "通信エラーが発生しました");
            }
          }
        }
      ]
    );
  };

  const startRecording = async () => {
    if (dailyCount >= DAILY_LIMIT) {
      Alert.alert(
        "本日の回数終了",
        "無料プランでは1日3回までです。\nプレミアムプランで無制限に話そう！\n（※現在は開発中につき制限のみ動作します）",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('マイクの許可が必要です');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  };

  const stopAndAppraise = async () => {
    if (!recorder.isRecording) return;
    setIsRecording(false);
    setIsAnalyzing(true);

    try {
      await recorder.stop();
      const uri = recorder.uri;

      if (!uri) throw new Error('No recording URI');

      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      await incrementDailyCount();

      const result = await analyzeWithGemini(base64Audio);
      
      if (result) {
        setAiResult(result);
        setShowResultModal(true);
        if (result.rank !== 'RETRY') {
           await giveExperience(result.xp);
        }
      } else {
        Alert.alert('鑑定失敗', 'うまく聞き取れませんでした。もう一度試してね！');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('エラー', '鑑定中に問題が発生しました。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeWithGemini = async (base64Audio: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('appraise-audio', {
        body: { base64Audio, playerId: player?.id },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Appraise Error:", error);
      return null;
    }
  };

  const giveExperience = async (amount: number) => {
    if (!player) return;
    const newTotalXp = (player.total_xp || 0) + amount;
    const newLevel = Math.floor(newTotalXp / 100) + 1; 
    await supabase.from('players').update({ total_xp: newTotalXp, level: newLevel }).eq('id', player.id);
    setPlayer({ ...player, total_xp: newTotalXp, level: newLevel });
  };

  const handleSettingsPress = () => {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    
    if (Platform.OS === 'web') {
      const answer = window.prompt(`${num1} × ${num2} = ?`);
      if (answer === String(num1 * num2)) {
         router.push('/admin');
      }
    } else {
      Alert.prompt(
        "保護者確認",
        `${num1} × ${num2} = ?`,
        [
          { text: "キャンセル", style: "cancel" },
          { 
            text: "OK", 
            onPress: (text) => {
              if (text === String(num1 * num2)) {
                router.push('/admin');
              } else {
                Alert.alert("不正解", "大人の人に聞いてね！");
              }
            }
          }
        ],
        "plain-text"
      );
    }
  };

  const manaColor = player?.mana_color || '#00D4FF';
  const progress = (player?.total_xp % 100) || 0;

  const renderListHeader = () => (
    <View>
      {(player?.goal_monthly || player?.goal_yearly) && (
        <View style={styles.goalsContainer}>
          {player?.goal_monthly ? (
            <View style={[styles.goalCard, { borderLeftColor: manaColor }]}>
              <Text style={styles.goalLabel}>📅 今月の目標</Text>
              <Text style={styles.goalText}>{player.goal_monthly}</Text>
            </View>
          ) : null}
          {player?.goal_yearly ? (
            <View style={[styles.goalCard, { borderLeftColor: '#FFD700', marginTop: 8 }]}>
              <Text style={styles.goalLabel}>🚩 今年の目標</Text>
              <Text style={styles.goalText}>{player.goal_yearly}</Text>
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.xpSection}>
        <CircularProgress
          value={progress}
          maxValue={100}
          radius={70}
          activeStrokeColor={manaColor}
          inActiveStrokeColor={COLORS.border}
          title={`${progress}%`}
          titleColor={COLORS.text}
          titleStyle={{ fontWeight: 'bold' }}
        />
        <Text style={styles.nextLevelText}>次のレベルまで {100 - progress} XP</Text>
        <Text style={styles.limitText}>
           本日の鑑定可能回数: {Math.max(0, DAILY_LIMIT - dailyCount)} / {DAILY_LIMIT}
        </Text>
      </View>

      {nextReward && (
        <TouchableOpacity 
          style={[styles.nextRewardCard, { borderColor: manaColor }]}
          onPress={() => router.push('/drawer/rewards')}
        >
          <View style={[styles.rewardIconBox, { backgroundColor: manaColor + '33' }]}>
            <Text style={{ fontSize: 24 }}>🔒</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rewardLabel}>次のご褒美 (Lv.{nextReward.target_level})</Text>
            <Text style={styles.rewardTitle}>{nextReward.title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.subText} />
        </TouchableOpacity>
      )}
      
      <Text style={styles.sectionTitle}>📜 現在のクエスト</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.statusBox}>
          <Text style={styles.playerName}>{player?.display_name || 'プレイヤー'}</Text>
          <Text style={styles.levelText}>Lv.{player?.level || 1}</Text>
        </View>
        <TouchableOpacity onPress={handleSettingsPress} style={styles.iconButton}>
          <Ionicons name="settings-sharp" size={24} color={COLORS.subText} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={quests}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchData}
        ListHeaderComponent={renderListHeader}
        renderItem={({ item }) => (
          <View style={styles.questCard}>
            <View style={[styles.questIcon, { backgroundColor: manaColor }]}>
              <Ionicons name="document-text" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.questTitle}>{item.title}</Text>
              {/* ★ここが変更点！時間の表示を追加しました */}
              <Text style={styles.questXp}>
                報酬: {item.xp_reward} XP
                {item.time_limit ? ` / ⏳ 目標: ${item.time_limit}分` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleCompleteQuest(item)} style={styles.checkButton}>
              <Ionicons name="ellipse-outline" size={32} color={COLORS.subText} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>現在クエストはありません</Text>
            <Text style={styles.emptySubText}>今日の冒険を報告してみよう！</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <View style={styles.micContainer}>
        {isAnalyzing ? (
           <ActivityIndicator size="large" color={manaColor} />
        ) : (
          <TouchableOpacity
            style={[
              styles.micButton, 
              { backgroundColor: manaColor }, 
              isRecording && styles.micButtonActive, 
              dailyCount >= DAILY_LIMIT && styles.micButtonDisabled
            ]} 
            onPress={isRecording ? stopAndAppraise : startRecording}
          >
            <Ionicons name={isRecording ? "stop" : "mic"} size={40} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={styles.micText}>
          {isAnalyzing ? "鑑定中..." : isRecording ? "お話し中... (タップで終了)" : "タップして報告する"}
        </Text>
      </View>

      <Modal visible={showResultModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Animatable.View animation="bounceIn" style={styles.resultCard}>
            <Text style={styles.resultTitle}>鑑定結果！</Text>
            <View style={[styles.rankBadge, { backgroundColor: aiResult?.rank === 'S' ? '#FFD700' : manaColor }]}>
              <Text style={styles.rankText}>{aiResult?.rank}</Text>
            </View>
            <Text style={styles.commentText}>"{aiResult?.comment}"</Text>
            {aiResult?.rank !== 'RETRY' && (
              <Text style={[styles.xpAwardText, { color: manaColor }]}>+ {aiResult?.xp} XP ゲット！</Text>
            )}
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: manaColor }]} 
              onPress={() => setShowResultModal(false)}
            >
              <Text style={styles.closeButtonText}>やったね！</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
  header: {
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.background,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  statusBox: { alignItems: 'center' },
  playerName: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  levelText: { color: '#FFD700', fontSize: 20, fontWeight: '900' },
  iconButton: { padding: 8 },

  goalsContainer: { marginHorizontal: 20, marginTop: 20 },
  goalCard: { 
    backgroundColor: COLORS.cardBg, padding: 15, borderRadius: 12, borderLeftWidth: 4,
    marginBottom: 8, borderWidth: 1, borderColor: 'transparent'
  },
  goalLabel: { color: COLORS.subText, fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
  goalText: { color: COLORS.text, fontSize: 14, fontWeight: 'bold' },

  xpSection: { alignItems: 'center', marginVertical: 20 },
  nextLevelText: { color: COLORS.subText, marginTop: 10, fontSize: 12 },
  limitText: { color: '#ff4500', marginTop: 5, fontSize: 12, fontWeight: 'bold' },

  nextRewardCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, 
    marginHorizontal: 20, marginBottom: 20, padding: 12, borderRadius: 12, 
    borderWidth: 1, gap: 12,
  },
  rewardIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  rewardLabel: { color: COLORS.subText, fontSize: 10, fontWeight: 'bold' },
  rewardTitle: { color: COLORS.text, fontSize: 14, fontWeight: 'bold' },

  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 10 },

  questCard: {
    backgroundColor: COLORS.cardBg, marginHorizontal: 20, marginBottom: 10, padding: 15,
    borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 15,
    borderWidth: 1, borderColor: COLORS.border
  },
  questIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  questTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  questXp: { color: COLORS.subText, fontSize: 12 },
  checkButton: { padding: 5 },

  emptyContainer: { alignItems: 'center', marginTop: 20 },
  emptyText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  emptySubText: { color: COLORS.subText, marginTop: 5 },

  micContainer: {
    position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center'
  },
  micButton: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10
  },
  micButtonActive: { backgroundColor: '#FF3131', transform: [{ scale: 1.1 }] },
  micButtonDisabled: { backgroundColor: '#333333', opacity: 0.7 }, 
  micText: { color: COLORS.subText, marginTop: 10, fontSize: 12, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  resultCard: { width: '85%', backgroundColor: COLORS.cardBg, borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  resultTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: COLORS.text },
  rankBadge: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  rankText: { fontSize: 40, fontWeight: '900', color: '#fff' },
  commentText: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: COLORS.text, lineHeight: 24 },
  xpAwardText: { fontSize: 20, fontWeight: 'bold', marginBottom: 30 },
  closeButton: { paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});