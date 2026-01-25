import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LegalScreen() {
  const navigation = useNavigation();

  // ハンバーガーメニューを開く関数
  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* メニューボタンを追加 */}
        <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>利用規約・ポリシー</Text>
        {/* 右側のバランス用ダミー */}
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>利用規約</Text>
          <Text style={styles.text}>
            1. はじめに{'\n'}
            本アプリ「Solo Quest」は、親子間のコミュニケーションと子供の自律的な成長を支援する目的で提供されます。{'\n'}{'\n'}
            2. 免責事項{'\n'}
            本アプリの使用により生じたいかなる損害についても、開発者は責任を負いません。{'\n'}{'\n'}
            3. アカウント管理{'\n'}
            パスワード等の管理はユーザー自身の責任で行ってください。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>プライバシーポリシー</Text>
          <Text style={styles.text}>
            1. 収集する情報{'\n'}
            本アプリは、サービスの提供に必要な範囲で、以下の情報を収集することがあります。{'\n'}
            ・ユーザー名、子供のニックネーム{'\n'}
            ・クエストの実施記録{'\n'}{'\n'}
            2. 情報の利用目的{'\n'}
            収集した情報は、アプリ機能の提供、改善のためにのみ利用されます。{'\n'}{'\n'}
            3. 第三者への提供{'\n'}
            法令に基づく場合を除き、同意なく第三者に個人情報を提供することはありません。
          </Text>
        </View>
        
        {/* 下部の余白 */}
        <View style={{ height: 50 }} />
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
  section: { marginBottom: 40 },
  sectionTitle: { color: '#00D4FF', fontSize: 20, fontWeight: 'bold', marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#00D4FF', paddingLeft: 10 },
  text: { color: '#ccc', lineHeight: 24, fontSize: 14 },
});