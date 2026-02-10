import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 追加
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // ★追加: プレイヤーが存在するか確認して振り分ける関数
  const checkPlayerAndRedirect = async (userId: string) => {
    try {
      // プレイヤーデータがあるか確認
      const { data: players } = await supabase
        .from('players')
        .select('id')
        .eq('parent_id', userId)
        .limit(1);

      if (players && players.length > 0) {
        // プレイヤーがいればIDを保存してホームへ
        await AsyncStorage.setItem('activePlayerId', players[0].id);
        router.replace('/drawer'); 
      } else {
        // いなければオンボーディング（勇者作成）へ
        router.replace('/onboarding');
      }
    } catch (e) {
      console.error(e);
      // エラー時は安全のためオンボーディングへ
      router.replace('/onboarding');
    }
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // --- サインアップ処理 ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // セッションが確立されたら（自動ログイン成功）、オンボーディングへ
        if (data.session) {
          Alert.alert('成功', 'アカウントを作成しました！勇者を作りに行こう！');
          router.replace('/onboarding');
        } else {
          // メール確認が必要な設定の場合などはここに来る
          Alert.alert('確認', '確認メールを送信しました。メール内のリンクをクリックしてログインしてください。');
          setIsSignUp(false); // ログインモードに戻す
        }

      } else {
        // --- ログイン処理 ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // ログイン成功後、プレイヤーの有無をチェックして遷移
          await checkPlayerAndRedirect(data.user.id);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert('エラー', error.message || '処理に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Ionicons name="game-controller-outline" size={60} color="#00D4FF" style={{ marginBottom: 15 }} />
          <Text style={styles.title}>Solo Quest</Text>
          <Text style={styles.subtitle}>冒険ゲーム・学習プラットフォーム</Text>
        </View>

        {/* フォーム */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {isSignUp ? 'アカウント作成' : 'ログイン'}
          </Text>

          <Text style={styles.label}>メールアドレス</Text>
          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={styles.label}>パスワード</Text>
          <TextInput
            style={styles.input}
            placeholder="パスワードを入力"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? 'アカウント作成' : 'ログイン'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            setIsSignUp(!isSignUp);
            setEmail('');
            setPassword('');
          }}>
            <Text style={styles.toggleText}>
              {isSignUp
                ? 'アカウントをお持ちですか？ ログイン'
                : 'アカウントをお持ちでないですか？ 作成'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 情報テキスト */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>このアプリについて</Text>
          <Text style={styles.infoText}>
            🎮 <Text style={styles.infoBold}>Solo Quest</Text> は、子どもたちの学習を楽しくサポートするゲーム・学習プラットフォームです。
          </Text>
          <Text style={styles.infoText}>
            👨‍👩‍👧 親御さんがクエスト（課題）を作成し、お子さんはゲーム感覚でクエストをこなします。
          </Text>
          <Text style={styles.infoText}>
            ⭐ レベルアップしたり、バッジを獲得したりしながら、楽しく学習できます！
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
  },
  form: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  label: {
    color: '#00D4FF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#0A0A15',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    color: '#fff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#00D4FF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggleText: {
    color: '#00D4FF',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
  },
  infoSection: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00D4FF',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    color: '#aaa',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  infoBold: {
    color: '#00D4FF',
    fontWeight: 'bold',
  },
});