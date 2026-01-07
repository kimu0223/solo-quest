import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const COLORS = {
  background: '#0A0A15',
  primary: '#00D4FF',
  text: '#FFFFFF',
  subText: '#A0A0A0',
  border: 'rgba(0, 212, 255, 0.2)',
};

export default function CustomDrawerContent(props: any) {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={['#1A1A2E', '#0A0A15']} style={StyleSheet.absoluteFill} />
      
      {/* ヘッダー部分 */}
      <View style={styles.header}>
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

      {/* フッター */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0.0 Alpha</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 30,
    paddingTop: 60,
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
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.subText,
    fontSize: 10,
    fontFamily: 'Orbitron_400Regular',
  }
});