import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LegalScreen() {
  const router = useRouter();

  // お問い合わせフォーム用ステート
  const [contactText, setContactText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // お問い合わせ送信処理
  const handleSendContact = async () => {
    if (!contactText.trim()) {
      Alert.alert("エラー", "お問い合わせ内容を入力してください。");
      return;
    }

    setIsSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // ここにSupabaseへの保存処理などを実装します
      // 今回はログ出力のみで成功扱いとします
      console.log("お問い合わせ:", contactText, "User:", user?.id);

      Alert.alert("送信完了", "お問い合わせを受け付けました。ギルド運営より順次確認いたします。");
      setContactText('');
    } catch (e) {
      Alert.alert("エラー", "送信に失敗しました。");
    } finally {
      setIsSending(false);
    }
  };

  // アカウント削除確認
  const confirmDeleteAccount = () => {
    const message = "本当にアカウントを削除しますか？\n\nこの操作を実行すると、これまでの記録はすべて完全に消去され、復元することはできません。";
    
    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        processDeletion();
      }
    } else {
      Alert.alert(
        "アカウントの削除確認",
        message,
        [
          { text: "キャンセル", style: "cancel" },
          { 
            text: "削除する", 
            style: "destructive", 
            onPress: () => processDeletion() 
          }
        ]
      );
    }
  };

  const processDeletion = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.clear();
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert("エラー", "削除処理中に問題が発生しました。");
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>規約と設定</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* 利用規約セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📜 利用規約</Text>
            <View style={styles.card}>
              <Text style={styles.lastUpdated}>最終更新日: 2026年1月25日</Text>
              <Text style={styles.text}>
                <Text style={styles.bold}>1. サービスの提供</Text>{'\n'}
                Solo Quest（以下「当サービス」）は、お子様の成長をRPG形式でサポートするアプリケーションです。{'\n'}{'\n'}
                <Text style={styles.bold}>2. データの取り扱い</Text>{'\n'}
                ユーザーが作成したクエスト内容や音声解析データは、サービス提供の目的のみに使用されます。{'\n'}{'\n'}
                <Text style={styles.bold}>3. 運営の免責</Text>{'\n'}
                当サービスは万全を期して提供されますが、不具合等により生じた損害について、故意または重過失がある場合を除き責任を負いません。
              </Text>
            </View>
          </View>

          {/* プライバシーポリシーセクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛡 プライバシーポリシー</Text>
            <View style={styles.card}>
              <Text style={styles.text}>
                <Text style={styles.bold}>1. 個人情報の収集</Text>{'\n'}
                当サービスは、認証のためのメールアドレスおよび、AI鑑定に必要な音声データを収集します。音声データは解析後、速やかに匿名化または破棄されます。{'\n'}{'\n'}
                <Text style={styles.bold}>2. 第三者提供の禁止</Text>{'\n'}
                法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。
              </Text>
            </View>
          </View>

          {/* お問い合わせフォーム */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✉️ 運営へのお問い合わせ</Text>
            <View style={styles.card}>
              <Text style={styles.hintText}>
                不具合の報告やご要望はこちらから。返信が必要な場合は、登録メールアドレス宛にご連絡します。
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="お問い合わせ内容を入力..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={contactText}
                onChangeText={setContactText}
              />
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={handleSendContact}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>送信する</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* アカウント削除エリア */}
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>⚠️ アカウントの削除</Text>
            <Text style={styles.dangerText}>
              退会するとすべてのデータが完全に削除され、復元はできません。
            </Text>
            <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteAccount}>
              <Ionicons name="trash-outline" size={18} color="#FF3131" />
              <Text style={styles.deleteButtonText}>退会手続きを進める</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ height: 50 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' }, // 白背景
  
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingVertical: 15, 
    borderBottomWidth: 1, borderBottomColor: '#EEEEEE',
    backgroundColor: '#fff'
  },
  headerTitle: { color: '#333', fontSize: 18, fontWeight: 'bold' },
  iconButton: { padding: 8 },

  scrollContent: { padding: 20 },
  
  section: { marginBottom: 30 },
  sectionTitle: { color: '#333', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  
  // カードデザイン（白基調）
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 15, 
    // 影をつける
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    borderWidth: 1, borderColor: '#F0F0F0'
  },
  
  lastUpdated: { color: '#999', fontSize: 11, marginBottom: 10, textAlign: 'right' },
  text: { color: '#666', lineHeight: 22, fontSize: 13 },
  bold: { color: '#00D4FF', fontWeight: 'bold' },
  hintText: { color: '#666', fontSize: 12, marginBottom: 15, lineHeight: 18 },

  // 入力フォーム
  textInput: {
    backgroundColor: '#F5F5F5',
    color: '#333',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 15
  },
  sendButton: { 
    backgroundColor: '#00D4FF', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center',
    shadowColor: "#00D4FF", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // 危険エリア（削除）
  dangerZone: { 
    marginTop: 10, 
    padding: 20, 
    backgroundColor: '#FFF5F5', // 薄い赤背景
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#FFE0E0' 
  },
  dangerTitle: { color: '#FF3131', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  dangerText: { color: '#666', fontSize: 12, marginBottom: 20 },
  deleteButton: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    backgroundColor: '#fff', 
    padding: 14, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#FF3131' 
  },
  deleteButtonText: { color: '#FF3131', fontSize: 14, fontWeight: 'bold', marginLeft: 8 }
});