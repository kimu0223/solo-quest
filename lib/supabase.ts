import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// .env から値を読み込みます
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// これがアプリ全体で使う「Supabaseくん」本体になります
export const supabase = createClient(supabaseUrl, supabaseAnonKey);