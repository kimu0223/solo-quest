import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, useRootNavigationState, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const checkAuthAndNavigate = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // ログイン済み → ホーム画面へ
        router.replace('/drawer');
      } else {
        // ログインしていない → ログイン画面へ
        router.replace('/auth/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    if (!navigationState?.key) return;

    checkAuthAndNavigate();
  }, [navigationState?.key, checkAuthAndNavigate]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Slot />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}