import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 画面上部のデフォルトヘッダーをすべて非表示にする設定 */}
    </Stack>
  );
}