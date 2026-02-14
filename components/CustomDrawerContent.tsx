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
  activeBg: 'rgba(0, 212, 255, 0.15)',
};

type Player = {
  id: string;
  name: string;
  mana_color: string;
};

export default function CustomDrawerContent(props: any) {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);

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
        .select('id, name, mana_color')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });

      setPlayers(playersData || []);
      const currentId = await AsyncStorage.getItem('activePlayerId');
      setActivePlayerId(currentId);
    } catch (e) {
      console.error('Drawer fetch error:', e);
    }
  };

  const handleSwitchPlayer = async (playerId: string) => {
    if (activePlayerId === playerId) return;
    await AsyncStorage.setItem('activePlayerId', playerId);
    setActivePlayerId(playerId);
    props.navigation.closeDrawer();
    router.replace('/drawer');
  };

  const handleLogout = async () => {
    Alert.alert('ログアウト', '冒険の記録を終了しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.clear(); 
            await supabase.auth.signOut();
            router.replace('/auth/login');
          } catch (e) {
            router.replace('/auth/login');
          }
        }
      }
    ]);
  };

  // ★ここが人数制限ロジック
  const handleAddUser = () => {
    // 2人以上の場合はブロックする
    if (players.length >= 2) {
      Alert.alert(
        'パーティ人数制限',
        '無料プランで登録できる勇者は2名までです。\n3人目以降の登録機能は現在準備中です。',
        [
          { text: 'OK', onPress: () => {} }
        ]
      );
    } else {
      props.navigation.closeDrawer();
      router.push('/onboarding');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={['#1A1A2E', '#0A0A15']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.title}>SOLO QUEST</Text>
          <Text style={styles.subtitle}>GUILD MENU</Text>
        </View>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View style={styles.menuList}>
          <DrawerItemList {...props} />
        </View>

        <View style={styles.divider} />

        <View style={styles.switchSection}>
          <Text style={styles.sectionLabel}>勇者を選択 ({players.length}/2)</Text>
          {players.map((player) => {
            const isActive = activePlayerId === player.id;
            return (
              <TouchableOpacity
                key={player.id}
                style={[styles.playerItem, isActive && styles.activePlayerItem]}
                onPress={() => handleSwitchPlayer(player.id)}
              >
                <View style={[styles.playerAvatar, { backgroundColor: player.mana_color || '#333' }]}>
                  <Ionicons name="person" size={14} color="#fff" />
                </View>
                <Text style={[styles.playerName, isActive && styles.activePlayerName]}>
                  {player.name}
                </Text>
                {isActive && <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            );
          })}
          
          <TouchableOpacity onPress={handleAddUser} style={styles.addBtn}>
            <View style={styles.addIconCircle}>
              <Ionicons name="add" size={20} color={COLORS.text} />
            </View>
            <Text style={styles.addText}>新しい勇者を登録</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      <View style={styles.footerSection}>
        <TouchableOpacity onPress={() => router.push('/drawer/legal')} style={styles.footerLink}>
          <Text style={styles.legalText}>利用規約・ポリシー</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#FF3131" />
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { 
    padding: 20, 
    paddingTop: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border,
    marginBottom: 10
  },
  logoCircle: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: 'rgba(0, 212, 255, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15,
    borderWidth: 1, 
    borderColor: COLORS.primary 
  },
  title: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { color: COLORS.primary, fontSize: 10, letterSpacing: 2 },
  
  menuList: { paddingHorizontal: 10 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 15, marginHorizontal: 20 },

  switchSection: { paddingHorizontal: 20 },
  sectionLabel: { color: '#666', fontSize: 12, marginBottom: 10, fontWeight: 'bold' },
  
  playerItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)'
  },
  activePlayerItem: { 
    backgroundColor: COLORS.activeBg,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  playerAvatar: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    marginRight: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  playerName: { color: COLORS.subText, fontSize: 14, fontWeight: '600' },
  activePlayerName: { color: COLORS.text, fontWeight: 'bold' },
  
  addBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingVertical: 8 },
  addIconCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  addText: { color: '#aaa', fontSize: 14 },
  
  footerSection: { padding: 20, borderTopWidth: 1, borderTopColor: '#333' },
  footerLink: { marginBottom: 15 },
  legalText: { color: '#666', fontSize: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center' },
  logoutText: { color: '#FF3131', marginLeft: 10, fontWeight: 'bold' },
});