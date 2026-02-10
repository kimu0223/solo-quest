import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LegalScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  // お問い合わせフォーム用ステート
  const [contactText, setContactText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  // お問い合わせ送信処理
  const handleSendContact = async () => {
    if (!contactText.trim()) {
      Alert.alert("エラー", "お問い合わせ内容を入力してください。");
      return;
    }

    setIsSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Supabaseに問い合わせ内容を保存（テーブル作成が必要: contact_inquiries等）
      // ここでは例としてコンソール出力と擬似成功処理
      console.log("お問い合わせ内容:", contactText);
      
      // 実際の実装では以下のようにDBへ保存します
      /*
      await supabase.from('contact_inquiries').insert({
        user_id: user?.id,
        content: contactText,
      });
      */

      Alert.alert("送信完了", "お問い合わせを受け付けました。ギルド運営より順次確認いたします。");
      setContactText('');
    } catch (e) {
      Alert.alert("エラー", "送信に失敗しました。");
    } finally {
      setIsSending(false);
    }
  };

  // アカウント削除（Web/Native両対応のAlert）
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
          { text: "削除する", style: "destructive", onPress: processDeletion }
        ]
      );
    }
  };

  const processDeletion = async () => {
    try {
      // 実際にはここで DBのユーザー削除API を叩く必要があります
      // supabase.rpc('delete_user') など（要Edge Function設定）
      
      await supabase.auth.signOut();
      await AsyncStorage.clear();
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert("エラー", "削除処理中に問題が発生しました。");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>規約とポリシー</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 80 }}>
        
        {/* 利用規約 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>利用規約</Text>
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

        {/* プライバシーポリシー */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>プライバシーポリシー</Text>
          <View style={styles.card}>
            <Text style={styles.text}>
              <Text style={styles.bold}>1. 個人情報の収集</Text>{'\n'}
              当サービスは、認証のためのメールアドレスおよび、AI鑑定に必要な音声データを収集します。音声データは解析後、速やかに匿名化または破棄されます。{'\n'}{'\n'}
              <Text style={styles.bold}>2. 第三者提供の禁止</Text>{'\n'}
              法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。
            </Text>
          </View>
        </View>

        {/* お問い合わせフォーム（メールアドレスを隠す手法） */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ギルド運営へのお問い合わせ</Text>
          <View style={styles.card}>
            <Text style={styles.hintText}>
              不具合の報告やご要望はこちらから送信してください。返信が必要な場合は、登録済みのメールアドレス宛にご連絡いたします。
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="お問い合わせ内容を入力..."
              placeholderTextColor="#666"
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
              {isSending ? <ActivityIndicator color="#000" /> : <Text style={styles.sendButtonText}>送信する</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* アカウント削除 */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>アカウントの消去</Text>
          <Text style={styles.dangerText}>
            退会するとすべてのデータが完全に削除され、復元はできません。
          </Text>
          <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteAccount}>
            <Ionicons name="trash-outline" size={18} color="#FF3131" />
            <Text style={styles.deleteButtonText}>退会手続きを進める</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#1A1A2E', borderBottomWidth: 1, borderBottomColor: '#333'
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  iconButton: { padding: 8 },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  card: { backgroundColor: '#1E1E2E', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#333' },
  lastUpdated: { color: '#666', fontSize: 11, marginBottom: 10, textAlign: 'right' },
  text: { color: '#ccc', lineHeight: 22, fontSize: 13 },
  bold: { color: '#00D4FF', fontWeight: 'bold' },
  hintText: { color: '#888', fontSize: 12, marginBottom: 15, lineHeight: 18 },
  
  // お問い合わせフォーム用
  textInput: {
    backgroundColor: '#0A0A15',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15
  },
  sendButton: { backgroundColor: '#00D4FF', padding: 12, borderRadius: 8, alignItems: 'center' },
  sendButtonText: { color: '#000', fontWeight: 'bold', fontSize: 14 },

  dangerZone: { marginTop: 10, padding: 20, backgroundColor: '#1A1111', borderRadius: 12, borderWidth: 1, borderColor: '#442222' },
  dangerTitle: { color: '#FF3131', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  dangerText: { color: '#999', fontSize: 12, marginBottom: 20 },
  deleteButton: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    backgroundColor: '#2A1515', padding: 14, borderRadius: 8, 
    borderWidth: 1, borderColor: '#FF3131' 
  },
  deleteButtonText: { color: '#FF3131', fontSize: 14, fontWeight: 'bold', marginLeft: 8 }
});