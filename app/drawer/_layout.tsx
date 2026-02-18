import CustomDrawerContent from '@/components/CustomDrawerContent';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import React, { useCallback, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
  const [themeColor, setThemeColor] = useState('#00D4FF'); // デフォルトは水色

  // 画面が開くたびに、現在選択されている勇者のマナカラーを取得する機能
  useFocusEffect(
    useCallback(() => {
      const fetchActiveColor = async () => {
        try {
          const activeId = await AsyncStorage.getItem('activePlayerId');
          if (activeId) {
            const { data } = await supabase.from('players').select('mana_color').eq('id', activeId).single();
            if (data?.mana_color) setThemeColor(data.mana_color);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchActiveColor();
    }, [])
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        // カスタムメニューに取得したテーマカラーを渡す
        drawerContent={(props) => <CustomDrawerContent {...props} themeColor={themeColor} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#0A0A15', // ★ここをクリーム色から深いダークネイビーに変更
            width: 280,
          },
          // 選択中の色をマナカラーに変更（1Aは薄い背景にするための透明度）
          drawerActiveBackgroundColor: themeColor + '1A',
          drawerActiveTintColor: themeColor,
          drawerInactiveTintColor: '#888899', // ダークネイビーに馴染むグレーに変更
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'ホーム',
            title: 'ホーム',
          }}
        />
        <Drawer.Screen
          name="rewards"
          options={{
            drawerLabel: 'ご褒美の宝物庫',
            title: 'ご褒美',
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: 'ギルドカード',
            title: 'プロフィール',
          }}
        />
        
        {/* ファイルは存在するが、メニューリストからは隠す設定 */}
        <Drawer.Screen
          name="legal"
          options={{
            drawerItemStyle: { display: 'none' }
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}