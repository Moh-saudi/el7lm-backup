import Link from 'next/link';
import { Bell, User, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/lib/firebase/auth-provider';
import { db } from '@/lib/firebase/config';
import { supabase } from '@/lib/supabase/config';
import NotificationsButton from '@/components/shared/NotificationsButton';

const getSupabaseImageUrl = (path) => {
  if (!path) return '/images/user-avatar.svg';
  if (path.startsWith('http')) return path;
  
  // قائمة الـ buckets للبحث فيها
  const bucketsToCheck = ['trainer', 'avatars', 'wallet', 'clubavatar'];
  
  // تحديد bucket بناءً على اسم الملف أولاً
  let preferredBucket = 'trainer'; // افتراضي للمدربين
  
  if (path.includes('wallet') || path.startsWith('wallet')) {
    preferredBucket = 'wallet';
  } else if (path.includes('avatar') || path.startsWith('avatar')) {
    preferredBucket = 'avatars';
  } else if (path.includes('clubavatar') || path.startsWith('clubavatar')) {
    preferredBucket = 'clubavatar';
  }
  
  // وضع الـ bucket المفضل في المقدمة
  const orderedBuckets = [preferredBucket, ...bucketsToCheck.filter(b => b !== preferredBucket)];
  
  // جرب كل bucket حتى نجد الملف
  for (const bucketName of orderedBuckets) {
    try {
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(path);
      if (publicUrl) {
        return publicUrl;
      }
    } catch (error) {
      continue;
    }
  }
  
  // إذا لم نجد في أي bucket، استخدم الافتراضي
  const { data: { publicUrl } } = supabase.storage.from('trainer').getPublicUrl(path);
  return publicUrl || '/images/user-avatar.svg';
};

export default function TrainerHeader() {
  const [lang, setLang] = useState('ar');
  const [darkMode, setDarkMode] = useState(false);
  const [logo, setLogo] = useState('/images/default-avatar.png');
  const { user } = useAuth();

  useEffect(() => {
    const htmlLang = document.documentElement.lang;
    setLang(htmlLang || 'ar');
    const savedMode = localStorage.getItem('trainer-dark-mode');
    if (savedMode === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('trainer-dark-mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('trainer-dark-mode', 'false');
    }
  }, [darkMode]);

  // جلب صورة المدرب من Firestore مع التحديث الفوري
  useEffect(() => {
    if (!user?.uid) return;

    const trainerRef = doc(db, 'trainers', user.uid);
    const unsubscribe = onSnapshot(trainerRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // استخدام profile_photo بدلاً من logo
        const logoUrl = getSupabaseImageUrl(data.profile_photo);
        setLogo(logoUrl);
      }
    }, (error) => {
      console.log('خطأ في جلب صورة المدرب:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="صورة المدرب" className="w-10 h-10 rounded-full border-2 border-cyan-400 shadow" />
          <span className="text-xl font-bold tracking-tight text-cyan-700 dark:text-cyan-300">منصة المدربين</span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationsButton />
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-600" />}
          </button>
          <Link href="/dashboard/trainer/notifications" className="relative hover:text-cyan-600 dark:hover:text-cyan-300">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </Link>
          <Link href="/dashboard/trainer/profile" className="hover:text-cyan-600 dark:hover:text-cyan-300">
            <User className="w-7 h-7" />
          </Link>
        </div>
      </div>
    </header>
  );
} 
