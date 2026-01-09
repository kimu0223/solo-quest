import CustomDrawerContent from '@/components/CustomDrawerContent';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const COLORS = {
  background: '#0A0A15',
  primary: '#00D4FF',
  text: '#FFFFFF',
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
          drawerInactiveTintColor: COLORS.text,
          drawerLabelStyle: {
            fontFamily: 'Orbitron_400Regular',
            fontSize: 14,
            marginLeft: -20,
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'HOME (冒険)',
            drawerIcon: ({ color }) => <Ionicons name="game-controller-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="rewards"
          options={{
            drawerLabel: 'TREASURY (ご褒美)',
            drawerIcon: ({ color }) => <Ionicons name="gift-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: 'HERO DATA (データ)',
            drawerIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
          }}
        />
        
        {/* GUILD MASTER (管理) はメニューから隠すためコメントアウトしています */}
        {/* <Drawer.Screen
          name="admin"
          options={{
            drawerLabel: 'GUILD MASTER (管理)',
            drawerIcon: ({ color }) => <Ionicons name="settings-outline" size={22} color={color} />,
          }}
        /> 
        */}
      </Drawer>
    </GestureHandlerRootView>
  );
}