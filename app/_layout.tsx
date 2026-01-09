import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  // アンカーを drawer に設定
  initialRouteName: 'drawer',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* drawerフォルダを読み込む設定 */}
        <Stack.Screen name="drawer" options={{ headerShown: false }} />
        
        {/* 以前の(tabs)は削除済みなので記述しない */}
        
        <Stack.Screen name="admin" options={{ title: 'ギルドマスターの部屋', presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}