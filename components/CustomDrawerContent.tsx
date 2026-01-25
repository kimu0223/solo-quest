import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  background: '#0A0A15',
  primary: '#00D4FF',
  text: '#FFFFFF',
  subText: '#A0A0A0',
  border: 'rgba(0, 212, 255, 0.2)',
};

export default function CustomDrawerContent(props: any) {
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchPlayers();
    }, [])
  );

  const fetchPlayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });

      setPlayers(playersData || []);
      const currentId = await AsyncStorage.getItem('activePlayerId');
      setActivePlayerId(currentId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSwitchPlayer = async (playerId: string) => {
    await AsyncStorage.setItem('activePlayerId', playerId);
    setActivePlayerId(playerId);
    props.navigation.closeDrawer();
    
    // ▼ 修正: replace を使ってスタックをリセットし、確実に全画面を再読み込みさせる
    router.replace('/drawer');
  };

  const handleLogout = async () => {
    Alert.alert('ログアウト', '冒険の記録を終了しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          // 確実に順番に実行
          await supabase.auth.signOut();
          await AsyncStorage.clear(); 
          router.replace('/auth/login');
        }
      }
    ]);
  };

  const handleAddUser = () => {
    if (players.length >= 2) {
      Alert.alert('プレミアム機能', '勇者を3人以上登録するには、ギルド拡張パス（¥500）が必要です。', [
        { text: 'やめる', style: 'cancel' },
        { text: '購入する (¥500)', onPress: () => router.push('/onboarding') }
      ]);
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={['#1A1A2E', '#0A0A15']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>SOLO QUEST</Text>
        <Text style={styles.subtitle}>GUILD MENU</Text>
      </View>

      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <View style={styles.switchSection}>
          <Text style={styles.sectionLabel}>勇者を切り替える</Text>
          {players.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={[styles.playerItem, activePlayerId === player.id && styles.activePlayerItem]}
              onPress={() => handleSwitchPlayer(player.id)}
            >
              <View style={[styles.playerAvatar, { backgroundColor: player.mana_color || '#333' }]} />
              <Text style={[styles.playerName, activePlayerId === player.id && styles.activePlayerName]}>
                {player.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={handleAddUser} style={styles.addBtn}>
            <Ionicons name="add" size={16} color={COLORS.subText} />
            <Text style={styles.addText}>新しく追加</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      <View style={styles.footerSection}>
        <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.subText} />
          <Text style={styles.menuText}>ログアウト</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/drawer/legal')} style={styles.menuItem}>
          <Text style={styles.legalText}>利用規約・ポリシー</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 30, paddingTop: 60, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  logoCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0, 212, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: COLORS.primary },
  title: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  subtitle: { color: COLORS.subText, fontSize: 10, letterSpacing: 2 },
  switchSection: { marginTop: 20, paddingHorizontal: 20 },
  sectionLabel: { color: '#555', fontSize: 11, marginBottom: 10, fontWeight: 'bold' },
  playerItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginBottom: 5 },
  activePlayerItem: { backgroundColor: 'rgba(0, 212, 255, 0.15)' },
  playerAvatar: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  playerName: { color: COLORS.subText, fontSize: 14 },
  activePlayerName: { color: COLORS.primary, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingLeft: 10 },
  addText: { color: '#555', fontSize: 13, marginLeft: 5 },
  footerSection: { padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  menuText: { color: COLORS.subText, marginLeft: 10 },
  legalText: { color: '#444', fontSize: 11 },
});