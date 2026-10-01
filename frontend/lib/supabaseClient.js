import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://demo-solo-traveler.supabase.co';

const supabaseUrl = rawSupabaseUrl
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/+$/, '');

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key-placeholder';

export const isSupabaseConfigured = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL &&
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('demo-solo-traveler') &&
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'demo-anon-key-placeholder'
);
console.log('[Supabase] configured:', isSupabaseConfigured);
console.log('[Supabase] URL:', supabaseUrl);

// Resilient storage wrapper compatible with React Native, Web, and Test environments
const safeStorage = AsyncStorage?.getItem
  ? AsyncStorage
  : (AsyncStorage?.default?.getItem ? AsyncStorage.default : {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    });

const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
const memoryStorage = {};

const storageAdapter = {
  getItem: async (key) => {
    if (!isWeb && typeof navigator === 'undefined') return memoryStorage[key] || null;
    try {
      return await safeStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    if (!isWeb && typeof navigator === 'undefined') {
      memoryStorage[key] = value;
      return;
    }
    try {
      await safeStorage.setItem(key, value);
    } catch {}
  },
  removeItem: async (key) => {
    if (!isWeb && typeof navigator === 'undefined') {
      delete memoryStorage[key];
      return;
    }
    try {
      await safeStorage.removeItem(key);
    } catch {}
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb,
  },
});

export default supabase;
