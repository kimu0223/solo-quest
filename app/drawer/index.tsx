import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  
  // ゲートキーパー用のState
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [gateQuestion, setGateQuestion] = useState({ a: 0, b: 0 });
  const [gateAnswer, setGateAnswer] = useState('');

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
      // 正解したらルートにある admin 画面へ遷移
      router.push('/admin'); 
    } else {
      Alert.alert('ちがうよ！', '計算まちがい。出直してこい！');
      setGateAnswer('');
    }
  };

  return (
    <View style={styles.container}>
      {/* カスタムヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>冒険の記録</Text>

        <TouchableOpacity onPress={openGate} style={styles.iconButton}>
          <Ionicons name="settings-sharp" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.heroText}>ようこそ、勇者よ！</Text>
        <Text style={styles.subText}>今日もクエストをクリアしよう。</Text>
        
        {/* ここにLvやXPバー、クエストリストが入ります（Day 8以降） */}
        <View style={styles.placeholderCard}>
          <Text style={{color: '#666'}}>（ここにクエストリストが表示されます）</Text>
        </View>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1A1A2E',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  iconButton: { padding: 8 },
  content: { flex: 1, padding: 20 },
  heroText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subText: { color: '#aaa', fontSize: 14, marginBottom: 30 },
  placeholderCard: {
    backgroundColor: '#222',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed'
  },
  // モーダル用スタイル
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