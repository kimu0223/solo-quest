import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// ダークネイビーの世界観カラー
const COLORS = {
  background: '#0A0A15',
  cardBg: '#12121A',
  border: '#1E1E2E',
  primary: '#00D4FF',
  text: '#FFFFFF',
  subText: '#888899',
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // ★重要なロジックはそのまま維持！
  const checkPlayerAndRedirect = async (userId: string) => {
    try {
      const { data: players } = await supabase
        .from('players')
        .select('id')
        .eq('parent_id', userId)
        .limit(1);

      if (players && players.length > 0) {
        await AsyncStorage.setItem('activePlayerId', players[0].id);
        router.replace('/drawer'); 
      } else {
        router.replace('/onboarding');
      }
    } catch (e) {
      console.error(e);
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
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.session) {
          Alert.alert('成功', 'アカウントを作成しました！勇者を作りに行こう！');
          router.replace('/onboarding');
        } else {
          Alert.alert('確認', '確認メールを送信しました。メール内のリンクをクリックしてログインしてください。');
          setIsSignUp(false);
        }

      } else {
        // --- ログイン処理 ---
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data.user) {
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

  const openLegal = () => {
    router.push('/drawer/legal');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* ★リッチなヘッダー（ロゴとアイコン） */}
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Solo Quest</Text>
          <Text style={styles.subtitle}>冒険ゲーム・学習プラットフォーム</Text>
        </View>

        {/* ★リッチなフォームデザイン */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isSignUp ? 'アカウント作成' : 'ギルドログイン'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>メールアドレス</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.subText} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor={COLORS.subText}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>パスワード</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.subText} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="6文字以上のパスワード"
                placeholderTextColor={COLORS.subText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.mainButton} onPress={handleAuth}>
                <Text style={styles.mainButtonText}>
                  {isSignUp ? 'アカウント作成' : 'ログイン'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.subButton} onPress={() => {
                setIsSignUp(!isSignUp);
                setEmail('');
                setPassword('');
              }}>
                <Text style={styles.subButtonText}>
                  {isSignUp ? 'ログインへ戻る' : '新規アカウント作成'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ★リッチなインフォメーションセクション（お願い文入り） */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.infoTitle}>このアプリについて</Text>
          </View>
          
          <Text style={styles.infoText}>
            🎮 <Text style={{ fontWeight: 'bold', color: '#fff' }}>Solo Quest</Text> は、子どもたちの日常を冒険に変えるタスク管理アプリです。
          </Text>
          <Text style={styles.infoText}>
            👨‍👩‍👧 親御さんがクエスト（お手伝い）を作成し、お子さんが声で報告することで、家族一緒に楽しく習慣化を目指せます！
          </Text>
          
          <View style={styles.divider} />
          
          <View style={styles.infoHeader}>
            <Ionicons name="bulb" size={24} color="#FFD700" />
            <Text style={styles.warningTitle}>アカウント作成のお願い</Text>
          </View>
          <Text style={styles.infoText}>
            現在、安全な家族間のデータ共有や、ギルドのAI鑑定士機能を提供するため、初期にアカウントの作成をお願いしております。
            今後のアップデートでさらなる機能追加を予定しておりますので、ぜひアカウントを作成して冒険にご参加いただけると幸いです！
          </Text>

          {/* 利用規約とプライバシーポリシーへのリンク */}
          <View style={styles.divider} />
          <View style={styles.legalLinksContainer}>
            <TouchableOpacity onPress={openLegal}>
              <Text style={styles.linkText}>利用規約</Text>
            </TouchableOpacity>
            <Text style={{ color: '#555' }}>|</Text>
            <TouchableOpacity onPress={openLegal}>
              <Text style={styles.linkText}>プライバシーポリシー</Text>
            </TouchableOpacity>
          </View>

        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  
  headerContainer: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  logoCircle: { 
    width: 100, height: 100, borderRadius: 50, 
    backgroundColor: COLORS.cardBg, borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10
  },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.text, letterSpacing: 2 },
  subtitle: { fontSize: 14, color: COLORS.primary, marginTop: 4, fontWeight: 'bold' },

  formContainer: { backgroundColor: COLORS.cardBg, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 24, textAlign: 'center' },
  inputGroup: { marginBottom: 20 },
  label: { color: COLORS.text, fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, 
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12 
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: COLORS.text, paddingVertical: 14, fontSize: 16 },

  buttonContainer: { marginTop: 10, gap: 12 },
  mainButton: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  mainButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  subButton: { backgroundColor: 'transparent', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary },
  subButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },

  infoSection: { backgroundColor: '#1A1A24', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  infoTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  infoText: { color: '#AAAAAA', fontSize: 13, lineHeight: 22, marginBottom: 10 },
  divider: { height: 1, backgroundColor: 'rgba(0, 212, 255, 0.2)', marginVertical: 16 },
  warningTitle: { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },
  
  // リンク用スタイル（ここを追加しました！）
  legalLinksContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 5 },
  linkText: { color: COLORS.primary, fontSize: 12, textDecorationLine: 'underline' },
});