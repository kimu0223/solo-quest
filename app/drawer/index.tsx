import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  LogBox // ★追加: ログ制御用
  ,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import CircularProgress from 'react-native-circular-progress-indicator';

// ★追加: 無駄な警告ログを無視する設定
LogBox.ignoreLogs([
  '[Reanimated] `createAnimatedPropAdapter` is no longer necessary',
  'Expo AV has been deprecated',
]);

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  // State
  const [player, setPlayer] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [nextReward, setNextReward] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // AI鑑定結果用
  const [showResultModal, setShowResultModal] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  useEffect(() => {
    fetchData();
    return () => {
      if (recording) {
        try { recording.stopAndUnloadAsync(); } catch (e) {}
      }
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
    try {
      if (recording) {
        try { await recording.stopAndUnloadAsync(); } catch (e) {}
        setRecording(undefined);
      }
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('マイクの許可が必要です');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  };

  const stopAndAppraise = async () => {
    if (!recording) return;
    setIsRecording(false);
    setIsAnalyzing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(undefined);

      if (!uri) throw new Error('No recording URI');

      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

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
      if (err.message && err.message.includes("deprecated")) {
         Alert.alert("エラー", "録音データの読み込みに失敗しました。");
      } else {
         Alert.alert('エラー', '鑑定中に問題が発生しました。');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeWithGemini = async (base64Audio: string) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ inlineData: { mimeType: 'audio/mp4', data: base64Audio } }]
            }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  transcript: { type: "STRING" },
                  rank: { type: "STRING", enum: ["S", "A", "B", "C", "RETRY"] },
                  comment: { type: "STRING" },
                  xp: { type: "INTEGER" }
                }
              }
            },
            systemInstruction: {
              parts: [{ text: `
                あなたは子供の成長を見守る冒険ギルドの鑑定士です。
                提出された音声を聞いて、子供が「今日の出来事」や「頑張ったこと」を話していたら評価してください。
                JSONで返してください。
              ` }]
            }
          })
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const jsonText = data.candidates[0].content.parts[0].text;
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("Gemini Error:", error);
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
          inActiveStrokeColor={'#333'}
          title={`${progress}%`}
          titleColor={'#fff'}
          titleStyle={{ fontWeight: 'bold' }}
        />
        <Text style={styles.nextLevelText}>次のレベルまで {100 - progress} XP</Text>
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
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      )}
      
      <Text style={styles.sectionTitle}>📜 現在のクエスト</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: manaColor + '22' }]}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.statusBox}>
          <Text style={styles.playerName}>{player?.display_name || '勇者'}</Text>
          <Text style={styles.levelText}>Lv.{player?.level || 1}</Text>
        </View>
        <TouchableOpacity onPress={handleSettingsPress} style={styles.iconButton}>
          <Ionicons name="settings-sharp" size={24} color="#666" />
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
              <Text style={styles.questXp}>報酬: {item.xp_reward} XP</Text>
            </View>
            
            <TouchableOpacity onPress={() => handleCompleteQuest(item)} style={styles.checkButton}>
              <Ionicons name="ellipse-outline" size={32} color="#666" />
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
            style={[styles.micButton, isRecording && styles.micButtonActive]}
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
              <Text style={styles.xpAwardText}>+ {aiResult?.xp} XP ゲット！</Text>
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
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#333'
  },
  statusBox: { alignItems: 'center' },
  playerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  levelText: { color: '#FFD700', fontSize: 20, fontWeight: '900' },
  iconButton: { padding: 8 },

  goalsContainer: { marginHorizontal: 20, marginTop: 20 },
  goalCard: { backgroundColor: '#1E1E2E', padding: 12, borderRadius: 8, borderLeftWidth: 4 },
  goalLabel: { color: '#999', fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
  goalText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  xpSection: { alignItems: 'center', marginVertical: 20 },
  nextLevelText: { color: '#888', marginTop: 10, fontSize: 12 },

  nextRewardCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E2E', 
    marginHorizontal: 20, marginBottom: 20, padding: 12, borderRadius: 12, 
    borderWidth: 1, gap: 12 
  },
  rewardIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  rewardLabel: { color: '#888', fontSize: 10, fontWeight: 'bold' },
  rewardTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 10 },

  questCard: {
    backgroundColor: '#1E1E2E', marginHorizontal: 20, marginBottom: 10, padding: 15,
    borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 15
  },
  questIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  questTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  questXp: { color: '#aaa', fontSize: 12 },
  checkButton: { padding: 5 },

  emptyContainer: { alignItems: 'center', marginTop: 20 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptySubText: { color: '#666', marginTop: 5 },

  micContainer: {
    position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center'
  },
  micButton: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#00D4FF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#00D4FF", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10
  },
  micButtonActive: { backgroundColor: '#FF3131', transform: [{ scale: 1.1 }] },
  micText: { color: '#ccc', marginTop: 10, fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  resultCard: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center' },
  resultTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  rankBadge: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  rankText: { fontSize: 40, fontWeight: '900', color: '#fff' },
  commentText: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#333' },
  xpAwardText: { fontSize: 20, fontWeight: 'bold', color: '#00D4FF', marginBottom: 30 },
  closeButton: { paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});