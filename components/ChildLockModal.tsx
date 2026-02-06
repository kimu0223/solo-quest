import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ChildLockModal({ visible, onClose, onSuccess }: Props) {
  const [answer, setAnswer] = useState('');
  const [problem, setProblem] = useState({ a: 7, b: 8 }); // 初期値
  const [error, setError] = useState(false);

  // モーダルが開くたびに新しい問題を作る
  useEffect(() => {
    if (visible) {
      generateProblem();
      setAnswer('');
      setError(false);
    }
  }, [visible]);

  const generateProblem = () => {
    // 3〜9の段から出題（簡単すぎず、難しすぎない）
    const a = Math.floor(Math.random() * 7) + 3;
    const b = Math.floor(Math.random() * 7) + 3;
    setProblem({ a, b });
  };

  const handleCheck = () => {
    const userAnswer = parseInt(answer);
    const correctAnswer = problem.a * problem.b;

    if (userAnswer === correctAnswer) {
      onSuccess(); // 正解！
      onClose();   // 閉じる
    } else {
      setError(true); // ブブー！
      setAnswer('');
      // 間違えたら問題を変えるスパルタ仕様
      generateProblem();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={32} color="#fff" />
          </View>
          
          <Text style={styles.title}>保護者用ゲート</Text>
          <Text style={styles.subtitle}>
            管理画面に進むには、{'\n'}以下の問題を解いてください。
          </Text>

          <View style={styles.problemBox}>
            <Text style={styles.problemText}>
              {problem.a} × {problem.b} = ?
            </Text>
          </View>

          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="答えを入力"
            keyboardType="number-pad"
            value={answer}
            onChangeText={(text) => {
              setAnswer(text);
              setError(false);
            }}
            maxLength={3}
            autoFocus={visible} // 開いたらすぐ入力可能に
          />

          {error && <Text style={styles.errorText}>不正解です！</Text>}

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>やめる</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleCheck} style={styles.submitButton}>
              <Text style={styles.submitText}>解除する</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: -50, // 上に飛び出させる
    borderWidth: 4,
    borderColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  problemBox: {
    backgroundColor: '#f0f4f8',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e1e8ed',
  },
  problemText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#333',
    letterSpacing: 2,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#FF4500',
    backgroundColor: '#FFF0F0',
  },
  errorText: {
    color: '#FF4500',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#eee',
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#00D4FF',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});