import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// ... (MANA_COLORSは同じなので省略せずに書きます)
const MANA_COLORS = [
  { name: 'Navy', code: '#1A1A2E' }, { name: 'Mana Blue', code: '#00D4FF' },
  { name: 'Pink', code: '#FF007A' }, { name: 'Green', code: '#00FFAB' }, { name: 'Red', code: '#FF4D4D' },
];

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);

  // 録音・再生用
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  // 認証・登録用
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#00D4FF');
  const [newQuestTitle, setNewQuestTitle] = useState('');

  // ★追加：親モード管理用
  const [isAdminMode, setIsAdminMode] = useState(false); // 親モードかどうか
  const [showGateModal, setShowGateModal] = useState(false); // 計算ドリルモーダル
  const [gateAnswer, setGateAnswer] = useState(''); // 計算の答え入力

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session: initSession } } = await supabase.auth.getSession();
      setSession(initSession);
      if (initSession) await fetchPlayer(initSession.user.id);
      setLoading(false);
    };
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) await fetchPlayer(currentSession.user.id);
      else { setPlayer(null); setQuests([]); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchPlayer(userId: string) {
    const { data: pData } = await supabase.from('players').select('*').eq('parent_id', userId).maybeSingle();
    if (pData) {
      setPlayer(pData);
      const { data: qData } = await supabase.from('quests').select('*').eq('player_id', pData.id).order('created_at', { ascending: false });
      if (qData) setQuests(qData);
    }
    setLoading(false);
  }

  // 録音開始
  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') await requestPermission();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) { Alert.alert("エラー", "録音を開始できませんでした"); }
  }

  // 録音停止
  async function stopRecording() {
    setRecording(undefined);
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordedUri(uri);
    Alert.alert("報告完了", "音声データを作成しました（今はまだAIには送りません）");
  }

  async function addQuest() {
    if (!newQuestTitle) return;
    const { data, error } = await supabase.from('quests').insert([{ player_id: player.id, title: newQuestTitle, xp_reward: 30 }]).select().single();
    if (error) Alert.alert("エラー", error.message);
    else { setQuests([data, ...quests]); setNewQuestTitle(''); }
  }

  // ★変更：レベルアップ判定を追加
  async function completeQuest(questId: string, xpReward: number) {
    // 1. まずDB更新
    await supabase.from('quests').update({ is_completed: true }).eq('id', questId);
    
    // 2. 現在のレベルと新しいXPを計算
    const currentLevel = player.level;
    const newXP = player.total_xp + xpReward;
    const calcLevel = Math.floor(newXP / 100) + 1; // 新しいレベルを計算

    // 3. プレイヤー情報を更新
    const { data: updatedPlayer } = await supabase
      .from('players')
      .update({ total_xp: newXP, level: calcLevel })
      .eq('id', player.id)
      .select()
      .single();

    if (updatedPlayer) {
      setPlayer(updatedPlayer);
      
      // ★ ここでレベルアップ判定！
      if (calcLevel > currentLevel) {
        Alert.alert(
          "🎉 LEVEL UP! 🎉",
          `${player.name} は Lv.${calcLevel} になった！\n最大HPとやる気が上がった！（気がする）`
        );
      } else {
        // 通常の完了メッセージ
        Alert.alert("クエスト達成！", `${xpReward} XP を獲得しました！`);
      }
    }
    
    setQuests(quests.map(q => q.id === questId ? { ...q, is_completed: true } : q));
  }

  // ★追加：親モードへの切り替え（計算チェック）
  function checkGateAnswer() {
    if (gateAnswer === '21') { // 3 x 7 の答え
      setIsAdminMode(true);
      setShowGateModal(false);
      setGateAnswer('');
      Alert.alert("ギルドマスター認証", "管理者モードになりました。クエストを追加できます。");
    } else {
      Alert.alert("ブブー！", "計算が違います。あなたは子供ですね？");
      setGateAnswer('');
    }
  }

  // ローディング
  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#00D4FF" /></View>;

  // ログイン前 or プレイヤー未作成
  if (!session || !player) {
    return (
      <View style={styles.container}>
        {!session ? (
          <View style={{width:'100%', alignItems:'center'}}>
             <Text style={styles.title}>🛡️ Solo Quest</Text>
             <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none"/>
             <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry/>
             <TouchableOpacity style={styles.submitButton} onPress={async()=>{
                const {error} = await supabase.auth.signInWithPassword({email, password});
                if(error) Alert.alert("Login Error", error.message);
             }}><Text style={styles.buttonText}>ログイン</Text></TouchableOpacity>
             <TouchableOpacity style={[styles.submitButton, {marginTop:10, backgroundColor:'#333'}]} onPress={async()=>{
                const {error} = await supabase.auth.signUp({email, password});
                if(error) Alert.alert("Signup Error", error.message);
                else Alert.alert("成功", "確認メールを見てね");
             }}><Text style={styles.buttonText}>新規登録</Text></TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{alignItems:'center', width:'100%'}}>
            <Text style={styles.title}>勇者の登録</Text>
            <TextInput style={styles.input} placeholder="勇者のなまえ" value={playerName} onChangeText={setPlayerName} />
            <View style={styles.colorGrid}>
              {MANA_COLORS.map(c => (
                <TouchableOpacity key={c.code} style={[styles.colorCircle, {backgroundColor: c.code}, selectedColor===c.code && {borderColor:'white', borderWidth:3}]} onPress={()=>setSelectedColor(c.code)}/>
              ))}
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={async()=>{
               const {data} = await supabase.from('players').insert([{parent_id: session.user.id, name: playerName, mana_color: selectedColor}]).select().single();
               if(data) setPlayer(data);
            }}><Text style={styles.buttonText}>冒険を始める</Text></TouchableOpacity>
          </ScrollView>
        )}
      </View>
    );
  }

  // ★ メイン画面
  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { borderColor: player.mana_color }]}>
        <Text style={[styles.playerTitle, { color: player.mana_color }]}>🛡️ {player.name}</Text>
        <Text style={styles.statsText}>Lv.{player.level} | Total XP: {player.total_xp}</Text>
      </View>

      {/* 録音エリア */}
      <View style={styles.recordingArea}>
        <Text style={styles.instructionText}>クエスト報告（音声）</Text>
        <TouchableOpacity
          style={[styles.recordButton, { backgroundColor: recording ? '#FF4D4D' : player.mana_color }]}
          onPress={recording ? stopRecording : startRecording}
        >
          <Text style={styles.recordButtonText}>{recording ? '■ 停止' : '● 報告する'}</Text>
        </TouchableOpacity>
      </View>

      {/* ★ 変更：親モードの時だけ入力欄を表示 */}
      {isAdminMode ? (
        <View style={styles.adminArea}>
          <Text style={{color: '#aaa', marginBottom: 5}}>🔧 ギルドマスターモード中</Text>
          <View style={styles.questInputContainer}>
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="クエスト追加" placeholderTextColor="#666" value={newQuestTitle} onChangeText={setNewQuestTitle} />
            <TouchableOpacity style={styles.addButton} onPress={addQuest}><Text style={styles.buttonText}>＋</Text></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setIsAdminMode(false)}><Text style={{color: '#FF4D4D', marginTop: 5}}>管理者モードを終了</Text></TouchableOpacity>
        </View>
      ) : (
        /* 親モードじゃない時は「保護者エリア」ボタンを表示 */
        <TouchableOpacity style={styles.gateButton} onPress={() => setShowGateModal(true)}>
          <Text style={styles.gateButtonText}>⚙️ 保護者エリア</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={quests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.questCard, item.is_completed && styles.completedCard]}>
            <Text style={[styles.questText, item.is_completed && styles.completedText]}>{item.title}</Text>
            {!item.is_completed && (
              <TouchableOpacity style={styles.completeButton} onPress={() => completeQuest(item.id, item.xp_reward)}>
                <Text style={styles.completeButtonText}>完了</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* ★ 追加：計算ドリルモーダル */}
      <Modal visible={showGateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>親認証ゲート</Text>
            <Text style={styles.modalText}>3 × 7 ＝ ？</Text>
            <TextInput 
              style={styles.modalInput} 
              keyboardType="number-pad" 
              value={gateAnswer} 
              onChangeText={setGateAnswer}
              autoFocus
            />
            <View style={{flexDirection:'row', gap:10}}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor:'#333'}]} onPress={() => setShowGateModal(false)}>
                <Text style={styles.buttonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={checkGateAnswer}>
                <Text style={styles.buttonText}>認証</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.logoutButton} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.logoutText}>ログアウト</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... 前回のスタイル維持
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center', padding: 20 },
  mainContainer: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 60 },
  header: { borderBottomWidth: 2, paddingBottom: 15, marginBottom: 20 },
  playerTitle: { fontSize: 24, fontWeight: 'bold' },
  statsText: { color: '#aaa', fontSize: 16 },
  
  recordingArea: { marginBottom: 20, alignItems: 'center', padding: 20, backgroundColor: '#1e1e1e', borderRadius: 15 },
  instructionText: { color: '#ccc', marginBottom: 10 },
  recordButton: { width: '100%', padding: 20, borderRadius: 12, alignItems: 'center' },
  recordButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

  // ★ 追加：親モード周りのスタイル
  adminArea: { marginBottom: 20, padding: 10, borderWidth: 1, borderColor: '#333', borderRadius: 10, alignItems: 'center' },
  gateButton: { marginBottom: 20, alignSelf: 'flex-end', padding: 10 },
  gateButtonText: { color: '#666', fontSize: 12 },
  
  // ★ 追加：モーダルスタイル
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#222', padding: 20, borderRadius: 15, alignItems: 'center' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  modalText: { color: '#fff', fontSize: 24, marginBottom: 20 },
  modalInput: { width: '100%', backgroundColor: '#333', color: '#fff', padding: 15, borderRadius: 8, fontSize: 20, textAlign: 'center', marginBottom: 20 },
  modalButton: { flex: 1, padding: 15, backgroundColor: '#00D4FF', borderRadius: 8, alignItems: 'center' },

  // ... 以下既存
  questInputContainer: { flexDirection: 'row', gap: 10, width: '100%' },
  addButton: { backgroundColor: '#00D4FF', width: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  questCard: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  completedCard: { opacity: 0.5, backgroundColor: '#000' },
  questText: { color: '#fff', fontSize: 18, fontWeight: '500' },
  completedText: { textDecorationLine: 'line-through' },
  completeButton: { backgroundColor: '#00D4FF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  completeButtonText: { color: '#fff', fontWeight: 'bold' },
  logoutButton: { marginTop: 20, padding: 15, alignItems: 'center' },
  logoutText: { color: '#666' },
  
  // ログイン・登録画面用
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
  input: { width: '100%', backgroundColor: '#1e1e1e', color: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  submitButton: { width: '100%', backgroundColor: '#00D4FF', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginBottom: 30 },
  colorCircle: { width: 50, height: 50, borderRadius: 25 },
});