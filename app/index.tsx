import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  
  // ★変更箇所1：型に '/welcome' を追加し、初期値を '/welcome' に変更
  const [initialRoute, setInitialRoute] = useState<'/welcome' | '/auth/login' | '/drawer' | '/onboarding'>('/welcome');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 1. セッションがあるか確認（変更なし）
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 2. 勇者データが端末にあるか確認（変更なし）
        const activePlayerId = await AsyncStorage.getItem('activePlayerId');
        if (activePlayerId) {
          setInitialRoute('/drawer'); // ホームへ
        } else {
          setInitialRoute('/onboarding'); // 勇者登録へ
        }
      } else {
        // ★変更箇所2：未ログイン時の行き先をログイン画面ではなくウェルカム画面へ
        setInitialRoute('/welcome'); 
      }
    } catch (e) {
      console.log(e);
      // ★変更箇所3：エラー時の行き先もウェルカム画面へ
      setInitialRoute('/welcome');
    } finally {
      setIsLoading(false); // （変更なし）
    }
  };

  if (isLoading) {
    // ローディング画面（変更なし）
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  // 判定したルートへ飛ばす（変更なし）
  return <Redirect href={initialRoute} />;
}