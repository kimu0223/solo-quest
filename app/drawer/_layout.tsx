import CustomDrawerContent from '@/components/CustomDrawerContent';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        // カスタムメニュー（アイコンや勇者切り替え）を使用
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#0A0A15',
            width: 280,
          },
          drawerActiveBackgroundColor: 'rgba(0, 212, 255, 0.1)',
          drawerActiveTintColor: '#00D4FF',
          drawerInactiveTintColor: '#A0A0A0',
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
        
        {/* ★修正: ファイルは存在するが、メニューリストからは隠す設定 */}
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