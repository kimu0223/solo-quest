import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0A0A15',
  primary: '#00D4FF',
  text: '#FFFFFF',
  subText: '#A0A0A0',
  border: 'rgba(0, 212, 255, 0.2)',
};

export default function CustomDrawerContent(props: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('エラー', 'ログアウトに失敗しました');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={['#1A1A2E', '#0A0A15']} style={StyleSheet.absoluteFill} />
      
      {/* ヘッダー部分 */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.logoCircle}>
          <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>SOLO QUEST</Text>
        <Text style={styles.subtitle}>GUILD MENU</Text>
      </View>

      {/* メニューリスト */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 20 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* フッター - ログアウトボタン */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>v1.0.0 Alpha</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 30,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: 'Orbitron_700Bold',
    letterSpacing: 2,
  },
  subtitle: {
    color: COLORS.subText,
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Orbitron_400Regular',
    letterSpacing: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
    width: '100%',
    gap: 8,
  },
  logoutText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footerText: {
    color: COLORS.subText,
    fontSize: 10,
    fontFamily: 'Orbitron_400Regular',
  }
});