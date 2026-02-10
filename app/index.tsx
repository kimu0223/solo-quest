import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'/auth/login' | '/drawer' | '/onboarding'>('/auth/login');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 1. セッションがあるか確認
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 2. 勇者データが端末にあるか確認
        const activePlayerId = await AsyncStorage.getItem('activePlayerId');
        if (activePlayerId) {
          setInitialRoute('/drawer'); // ホームへ
        } else {
          setInitialRoute('/onboarding'); // 勇者登録へ
        }
      } else {
        setInitialRoute('/auth/login'); // ログイン画面へ
      }
    } catch (e) {
      console.log(e);
      setInitialRoute('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  // 判定したルートへ飛ばす
  return <Redirect href={initialRoute} />;
}