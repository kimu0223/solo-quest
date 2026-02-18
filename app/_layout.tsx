import CustomDrawerContent from '@/components/CustomDrawerContent';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const COLORS = {
  background: '#FFFFFF',
  primary: '#00D4FF',
  text: '#333333',
};

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: COLORS.background,
            width: 280,
          },
          drawerActiveTintColor: COLORS.primary,
          drawerInactiveTintColor: '#999999',
          drawerLabelStyle: {
            fontSize: 14,
            marginLeft: 0,
            fontWeight: '600'
          },
          drawerItemStyle: {
            paddingLeft: 10,
            borderRadius: 8,
          },
          drawerActiveBackgroundColor: '#F0F9FF', 
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'ホーム (冒険)',
            drawerIcon: ({ color }) => <Ionicons name="game-controller-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="rewards"
          options={{
            drawerLabel: 'ご褒美の宝物庫',
            drawerIcon: ({ color }) => <Ionicons name="gift-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: 'ギルドカード',
            drawerIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="legal"
          options={{
            drawerLabel: '規約・設定',
            drawerIcon: ({ color }) => <Ionicons name="document-text-outline" size={22} color={color} />,
            drawerItemStyle: { display: 'none' } 
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}