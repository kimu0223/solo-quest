import ChildLockModal from '@/components/ChildLockModal';
import { analyzeVoiceReport } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const explosionRef = useRef<any>(null);
  
  const scaleAnim = useRef(new Animated.Value(0)).current; 

  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('勇者');
  const [manaColor, setManaColor] = useState('#00D4FF');
  const [playerLevel, setPlayerLevel] = useState(1);
  const [totalXp, setTotalXp] = useState(0);
  
  // ★追加: 次のご褒美情報
  const [nextReward, setNextReward] = useState<any>(null);
  
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isAppraising, setIsAppraising] = useState(false);
  const [appraisalResult, setAppraisalResult] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showChildLock, setShowChildLock] = useState(false);

  // サウンド再生関数
  async function playSound(type: 'complete' | 'levelup') {
    try {
      const soundFiles: Record<string, any> = {
        'complete': require('../../assets/sounds/complete.mp3'),
        'levelup': require('../../assets/sounds/levelup.mp3'),
      };
      const soundPath = soundFiles[type];
      if (!soundPath) return;
      const { sound } = await Audio.Sound.createAsync(soundPath);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) { console.log('サウンド再生スキップ:', error); }
  }

  const fetchQuestsAndPlayer = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const storedPlayerId = await AsyncStorage.getItem('activePlayerId');
      let query = supabase.from('players').select('*').eq('parent_id', user.id);
      
      if (storedPlayerId) query = query.eq('id', storedPlayerId);
      else query = query.order('created_at', { ascending: false }).limit(1);
      
      const { data: players } = await query;
      const player = players && players.length > 0 ? players[0] : null;

      if (player) {
        setActivePlayerId(player.id);
        await AsyncStorage.setItem('activePlayerId', player.id);
        setPlayerName(player.display_name || player.name);
        setPlayerLevel(player.level);
        setTotalXp(player.total_xp || 0);
        setManaColor(player.mana_color || '#00D4FF');
        
        // クエスト取得
        const { data: questsData } = await supabase
          .from('quests')
          .select('*')
          .eq('player_id', player.id)
          .eq('is_completed', false)
          .order('created_at', { ascending: false });
        setQuests(questsData || []);

        // ★追加: 次のご褒美を取得
        const { data: rewardsData } = await supabase
          .from('rewards')
          .select('*')
          .eq('player_id', player.id)
          .gt('target_level', player.level) // 現在のレベルより上
          .order('target_level', { ascending: true }) // 一番近いもの
          .limit(1);
        
        if (rewardsData && rewardsData.length > 0) {
          setNextReward(rewardsData[0]);
        } else {
          setNextReward(null);
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchQuestsAndPlayer(); }, [fetchQuestsAndPlayer]));

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert("マイクの許可が必要です", "設定からマイクの使用を許可してください。");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) { console.error(err); }
  }

  async function stopAndAppraise() {
    if (!recording) return;
    
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    
    if (uri && activePlayerId) {
      setIsAppraising(true);
      try {
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const isRetry = retryCount > 0;
        const result = await analyzeVoiceReport(base64Audio, "今日がんばったこと", isRetry);
        
        setAppraisalResult(result);
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();

        if (result.rank === 'RETRY') {
          setRetryCount(prev => prev + 1);
          playSound('complete');
          setIsAppraising(false);
          return;
        }

        setRetryCount(0);
        const xpGained = result.xp_bonus || 0;
        const newTotalXp = totalXp + xpGained;
        
        const newLevel = Math.floor(newTotalXp / 100) + 1;
        const isLevelUp = newLevel > playerLevel;

        await supabase.from('players').update({
          total_xp: newTotalXp,
          level: newLevel,
        }).eq('id', activePlayerId);

        await supabase.from('appraisal_logs').insert({
          player_id: activePlayerId, 
          transcript: result.transcript, 
          ai_rank: result.rank, 
          ai_comment: result.comment,
          xp_awarded: xpGained
        });

        setTotalXp(newTotalXp);
        setPlayerLevel(newLevel);

        if (explosionRef.current) explosionRef.current.start();
        playSound(isLevelUp ? 'levelup' : 'complete');

        if (isLevelUp) {
          Alert.alert("🎉 レベルアップ！", `Lv.${playerLevel} → Lv.${newLevel} になったぞ！`);
          // レベルアップしたらご褒美情報も再取得すべきだが、簡易的にリロードを促す
          fetchQuestsAndPlayer();
        }

      } catch (e) { 
        console.error(e);
        Alert.alert("通信エラー", "魔力が足りないようだ…（鑑定失敗）"); 
      } finally { 
        setIsAppraising(false); 
      }
    }
  }

  const xpForNextLevel = 100;
  const currentLevelXp = totalXp % xpForNextLevel;
  const progressPercent = (currentLevelXp / xpForNextLevel) * 100;

  return (
    <View style={styles.container}>
      <ConfettiCannon count={200} origin={{x: -10, y: 0}} autoStart={false} ref={explosionRef} fadeOut={true} />
      
      <View style={[styles.header, { backgroundColor: manaColor + '33' }]}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>冒険の記録</Text>
        <TouchableOpacity onPress={() => setShowChildLock(true)} style={styles.iconButton}>
          <Ionicons name="settings-sharp" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.statusSection}>
          <Text style={styles.heroText}>{playerName}</Text>
          <View style={[styles.levelBadge, { backgroundColor: manaColor }]}>
            <Text style={styles.levelText}>Lv.{playerLevel}</Text>
          </View>
        </View>
        
        <View style={styles.xpBarContainer}>
          <Text style={styles.xpText}>あと {xpForNextLevel - currentLevelXp} XP でレベルアップ</Text>
          <View style={styles.xpBarBackground}>
            <View style={[styles.xpBarFill, { width: `${progressPercent}%`, backgroundColor: manaColor }]} />
          </View>
        </View>

        {/* ★追加: 次のご褒美表示エリア */}
        {nextReward && (
          <TouchableOpacity 
            style={[styles.nextRewardCard, { borderColor: manaColor }]}
            onPress={() => router.push('/drawer/rewards')}
          >
            <View style={styles.nextRewardIcon}>
              <Text style={{fontSize: 20}}>🎁</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.nextRewardLabel}>次のご褒美 (Lv.{nextReward.target_level})</Text>
              <Text style={styles.nextRewardTitle} numberOfLines={1}>{nextReward.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        )}

        <View style={styles.aiSection}>
          <Text style={styles.aiLabel}>✨ 声で報告してXPゲット！</Text>
          <TouchableOpacity 
            style={[styles.micButton, recording ? styles.micActive : { borderColor: manaColor }]}
            onPressIn={startRecording}
            onPressOut={stopAndAppraise}
            disabled={isAppraising}
          >
            {isAppraising ? (
              <ActivityIndicator color={manaColor} size="large" />
            ) : (
              <Ionicons name={recording ? "stop-circle" : "mic"} size={40} color={recording ? "#FF3131" : manaColor} />
            )}
          </TouchableOpacity>
          <Text style={styles.micHint}>
            {recording ? "はなしてね..." : isAppraising ? "鑑定中..." : "ボタンを押して「やったこと」を話そう"}
          </Text>
        </View>

        <Text style={styles.sectionHeader}>現在のクエスト</Text>
        <FlatList
          data={quests}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>クエストはありません。ゆっくり休もう。</Text>}
          renderItem={({ item }) => (
            <View style={styles.questCard}>
              <Text style={styles.questTitle}>{item.title}</Text>
              <Ionicons name="ellipse-outline" size={24} color={manaColor} />
            </View>
          )}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchQuestsAndPlayer} />}
        />
      </View>

      <Modal visible={!!appraisalResult} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.rankTitle}>AI鑑定結果</Text>
            
            <View style={[styles.rankCircle, appraisalResult?.rank === 'RETRY' && { borderColor: '#FFA500' }]}>
              <Text style={[styles.rankText, { color: appraisalResult?.rank === 'RETRY' ? '#FFA500' : manaColor }]}>
                {appraisalResult?.rank === 'RETRY' ? '?' : appraisalResult?.rank}
              </Text>
            </View>
            
            <Text style={styles.commentText}>{appraisalResult?.comment}</Text>
            
            {appraisalResult?.rank !== 'RETRY' && (
              <View style={styles.xpReward}>
                <Text style={styles.xpLabel}>獲得XP</Text>
                <Text style={styles.xpValue}>+{appraisalResult?.xp_bonus}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.closeBtn, { backgroundColor: appraisalResult?.rank === 'RETRY' ? '#FFA500' : manaColor }]} 
              onPress={() => {
                setAppraisalResult(null);
                scaleAnim.setValue(0);
              }}
            >
              <Text style={styles.closeBtnText}>
                {appraisalResult?.rank === 'RETRY' ? 'もう一度！' : '閉じる'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <ChildLockModal 
        visible={showChildLock}
        onClose={() => setShowChildLock(false)}
        onSuccess={() => {
          setShowChildLock(false);
          router.push('/admin');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  iconButton: { padding: 8 },
  content: { flex: 1, padding: 20 },
  statusSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  heroText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginRight: 10 },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  levelText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  xpBarContainer: { marginBottom: 15 }, // 少し詰めました
  xpText: { color: '#888', fontSize: 12, marginBottom: 5, textAlign: 'right' },
  xpBarBackground: { height: 12, backgroundColor: '#333', borderRadius: 6, overflow: 'hidden' },
  xpBarFill: { height: '100%', borderRadius: 6 },
  
  // ★追加スタイル: 次のご褒美カード
  nextRewardCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E2E', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderStyle: 'dashed' },
  nextRewardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  nextRewardLabel: { color: '#aaa', fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  nextRewardTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  aiSection: { alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 20, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  aiLabel: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  micButton: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A15', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 8 },
  micActive: { borderColor: '#FF3131', backgroundColor: '#300' },
  micHint: { color: '#888', fontSize: 12, marginTop: 15 },
  sectionHeader: { color: '#aaa', fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  questCard: { backgroundColor: '#1E1E2E', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#333' },
  questTitle: { color: '#fff', fontSize: 16 },
  emptyText: { color: '#555', textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#1E1E2E', borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  rankTitle: { color: '#aaa', fontSize: 14, marginBottom: 10, letterSpacing: 2 },
  rankCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#fff' },
  rankText: { fontSize: 48, fontWeight: '900', textShadowColor: 'rgba(255, 255, 255, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  commentText: { fontSize: 18, textAlign: 'center', color: '#fff', marginBottom: 20, lineHeight: 26, fontWeight: 'bold' },
  xpReward: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 30, backgroundColor: '#333', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  xpLabel: { color: '#aaa', fontSize: 14, marginRight: 8 },
  xpValue: { color: '#FFD700', fontSize: 24, fontWeight: 'bold' },
  closeBtn: { paddingHorizontal: 50, paddingVertical: 14, borderRadius: 30 },
  closeBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});