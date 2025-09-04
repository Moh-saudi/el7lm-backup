'use client';

import { createBrowserClient } from '@supabase/ssr';

// تعريف أسماء buckets التخزين في Supabase
export const STORAGE_BUCKETS = {
  PROFILE_IMAGES: 'profile-images',
  ADDITIONAL_IMAGES: 'additional-images',
  PLAYER_AVATAR: 'player-avatar',
  PLAYER_ADDITIONAL_IMAGES: 'player-additional-images',
  VIDEOS: 'videos',
  DOCUMENTS: 'documents',
  PLAYER_VIDEOS: 'player-videos',
  CLUB_VIDEOS: 'club-videos',
  ACADEMY_VIDEOS: 'academy-videos',
  ADS: 'ads' // Bucket جديد للإعلانات
};

// تصدير عنوان وAPI key الخاص بـ Supabase - Updated with working credentials
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekyerljzfokqimbabzxm.supabase.co';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVreWVybGp6Zm9rcWltYmFienhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTcyODMsImV4cCI6MjA2MjIzMzI4M30.Xd6Cg8QUISHyCG-qbgo9HtWUZz6tvqAqG6KKXzuetBY';

// إنشاء عميل Supabase (مرة واحدة لكل سياق متصفح)
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export const supabase = (() => {
  if (typeof window === 'undefined') {
    // Server-side: create new instance
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  
  // Client-side: use singleton pattern
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseInstance;
})();

// دالة للحصول على عميل Supabase مع المصادقة
export const getSupabaseClient = () => supabase;

// دالة للتحقق من اتصال Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('test').select('*').limit(1);
    return !error || error.code === 'PGRST116'; // PGRST116 = table doesn't exist (which is fine)
  } catch (error) {
    console.warn('Supabase connection test failed:', error);
    return false;
  }
};

// Types for better TypeScript support
export interface SupabaseUploadResponse {
  url?: string;
  error?: string;
  path?: string;
}

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
}

export default {
  supabase,
  getSupabaseClient,
  checkSupabaseConnection,
  STORAGE_BUCKETS
};
