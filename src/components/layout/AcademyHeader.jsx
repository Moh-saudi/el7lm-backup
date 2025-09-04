import Link from 'next/link';
import { User, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/lib/firebase/auth-provider';
import { db } from '@/lib/firebase/config';
import { supabase } from '@/lib/supabase/config';
import UnifiedNotificationsButton from '@/components/shared/UnifiedNotificationsButton';
import EnhancedMessageButton from '@/components/shared/EnhancedMessageButton';

const getSupabaseImageUrl = (path) => {
  if (!path) return '/images/club-avatar.png';
  if (path.startsWith('http')) return path;
  const { data: { publicUrl } } = supabase.storage.from('academy').getPublicUrl(path);
  return publicUrl || '/images/club-avatar.png';
};

export default function AcademyHeader() {
  const [lang, setLang] = useState('ar');
  const [darkMode, setDarkMode] = useState(false);
  const [logo, setLogo] = useState('/images/club-avatar.png');
  const { user } = useAuth();

  useEffect(() => {
    const htmlLang = document.documentElement.lang;
    setLang(htmlLang || 'ar');
    const savedMode = localStorage.getItem('academy-dark-mode');
    if (savedMode === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('academy-dark-mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('academy-dark-mode', 'false');
    }
  }, [darkMode]);

  // جلب شعار الأكاديمية من Firestore مع التحديث الفوري
  useEffect(() => {
    if (!user?.uid) return;

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    const fetchLogo = () => {
      const academyRef = doc(db, 'academies', user.uid);
      
      return onSnapshot(academyRef, 
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            const logoUrl = getSupabaseImageUrl(data.logo);
            setLogo(logoUrl);
          }
        }, 
        (error) => {
          console.error('خطأ في جلب شعار الأكاديمية:', error);
          
          // إعادة المحاولة في حالة الفشل
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(() => {
              console.log(`إعادة محاولة جلب الشعار (${retryCount}/${maxRetries})`);
              unsubscribe();
              setupListener();
            }, retryDelay);
          }
        }
      );
    };

    let unsubscribe = () => {};
    
    const setupListener = () => {
      try {
        unsubscribe = fetchLogo();
      } catch (error) {
        console.error('خطأ في إعداد مراقب الشعار:', error);
      }
    };

    setupListener();
    return () => unsubscribe();
  }, [user]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="شعار الأكاديمية" className="w-10 h-10 rounded-full border-2 border-orange-400 shadow" />
          <span className="text-xl font-bold tracking-tight text-orange-700 dark:text-orange-300">منصة الأكاديميات</span>
        </div>
        <div className="flex items-center gap-4">
          <UnifiedNotificationsButton />
          <EnhancedMessageButton />
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-600" />}
          </button>
          <Link href="/dashboard/academy/profile" className="hover:text-orange-600 dark:hover:text-orange-300">
            <User className="w-7 h-7" />
          </Link>
        </div>
      </div>
    </header>
  );
} 
