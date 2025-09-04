import Link from 'next/link';
import { Bell, User, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/lib/firebase/auth-provider';
import { db } from '@/lib/firebase/config';
import { supabase } from '@/lib/supabase/config';
import NotificationsButton from '@/components/shared/NotificationsButton';

export default function ClubHeader() {
  const [lang, setLang] = useState('ar');
  const [darkMode, setDarkMode] = useState(false);
  const [logo, setLogo] = useState('/club-avatar.png');
  const { user } = useAuth();

  useEffect(() => {
    const htmlLang = document.documentElement.lang;
    setLang(htmlLang || 'ar');
    const savedMode = localStorage.getItem('club-dark-mode');
    if (savedMode === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('club-dark-mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('club-dark-mode', 'false');
    }
  }, [darkMode]);

  // دالة لتحويل مسار Supabase إلى رابط كامل
  const getSupabaseImageUrl = (path) => {
    if (!path) return '/club-avatar.png';
    if (path.startsWith('http')) return path;
    const { data: { publicUrl } } = supabase.storage.from('clubavatar').getPublicUrl(path);
    return publicUrl || path;
  };

  // جلب شعار النادي من Firestore مع الاستماع للتحديثات
  useEffect(() => {
    if (!user?.uid) {
      setLogo('/club-avatar.png');
      return;
    }

    console.log('🎨 ClubHeader: بدء جلب لوجو النادي للمستخدم:', user.uid);

    const clubRef = doc(db, 'clubs', user.uid);
    
    // استخدام onSnapshot للاستماع للتحديثات الفورية
    const unsubscribe = onSnapshot(clubRef, (clubDoc) => {
      try {
        if (clubDoc.exists()) {
          const data = clubDoc.data();
          console.log('🎨 ClubHeader: بيانات النادي:', { logo: data.logo });
          
          if (data.logo) {
            const logoUrl = getSupabaseImageUrl(data.logo);
            console.log('🎨 ClubHeader: تحديث اللوجو إلى:', logoUrl);
            setLogo(logoUrl);
          } else {
            console.log('🎨 ClubHeader: لا يوجد لوجو، استخدام الافتراضي');
            setLogo('/club-avatar.png');
          }
        } else {
          console.log('🎨 ClubHeader: وثيقة النادي غير موجودة');
          setLogo('/club-avatar.png');
        }
      } catch (error) {
        console.error('❌ ClubHeader: خطأ في معالجة بيانات النادي:', error);
        setLogo('/club-avatar.png');
      }
    }, (error) => {
      console.error('❌ ClubHeader: خطأ في الاستماع لتحديثات النادي:', error);
      setLogo('/club-avatar.png');
    });

    // تنظيف المستمع عند إلغاء التثبيت
    return () => {
      console.log('🎨 ClubHeader: إيقاف الاستماع لتحديثات اللوجو');
      unsubscribe();
    };
  }, [user?.uid]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="شعار النادي" 
            className="w-10 h-10 rounded-full border-2 border-green-400 shadow object-cover" 
            onError={(e) => {
              console.log('❌ ClubHeader: فشل تحميل اللوجو، استخدام الافتراضي');
              e.target.src = "/club-avatar.png";
            }}
          />
          <span className="text-xl font-bold tracking-tight text-green-700 dark:text-green-300">منصة النادي</span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationsButton />
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-600" />}
          </button>
          <Link href="/dashboard/club/profile" className="hover:text-green-600 dark:hover:text-green-300">
            <User className="w-7 h-7" />
          </Link>
        </div>
      </div>
    </header>
  );
} 
