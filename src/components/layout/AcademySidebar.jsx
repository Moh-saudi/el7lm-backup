import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { supabase } from '@/lib/supabase/config';
import { Home, User, Users, Trophy, Calendar, Star, Bell, MessageSquare, CreditCard, KeyRound, Menu, LogOut, GraduationCap, Target, BookOpen, Award, MapPin, Settings, Search, Video } from 'lucide-react';
// تم حذف الترجمة

const getSupabaseImageUrl = (path) => {
  if (!path) return '/images/club-avatar.png';
  if (path.startsWith('http')) return path;
  const { data: { publicUrl } } = supabase.storage.from('academy').getPublicUrl(path);
  return publicUrl || '/images/club-avatar.png';
};

export default function AcademySidebar({ collapsed, setCollapsed }) {
  const router = useRouter();
  const { logout, user, userData } = useAuth();
  const t = (key) => key;
  const language = 'ar';
  const [logo, setLogo] = useState('/images/club-avatar.png');
  const [academyName, setAcademyName] = useState('');

  useEffect(() => {
    const htmlLang = document.documentElement.lang;
    // setLang(htmlLang || 'ar'); // This line is removed as per the new_code
  }, []);

  // جلب شعار الأكاديمية من Firestore مع التحديث الفوري
  useEffect(() => {
    if (!user?.uid) return;

    const academyRef = doc(db, 'academies', user.uid);
    const unsubscribe = onSnapshot(academyRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const logoUrl = getSupabaseImageUrl(data.logo);
        setLogo(logoUrl);
        
        // تحديد اسم الأكاديمية من عدة مصادر
        const name = data.academy_name || data.name || data.full_name || userData?.full_name || userData?.name || 'أكاديمية رياضية';
        setAcademyName(name);
      } else {
        // استخدم userData في حالة عدم وجود بيانات الأكاديمية
        const name = userData?.full_name || userData?.name || 'أكاديمية رياضية';
        setAcademyName(name);
      }
    }, (error) => {
      console.log('خطأ في جلب شعار الأكاديمية:', error);
      // في حالة الخطأ، استخدم userData
      const name = userData?.full_name || userData?.name || 'أكاديمية رياضية';
      setAcademyName(name);
    });

    return () => unsubscribe();
  }, [user, userData]);

  // تحديث اسم الأكاديمية عند تغيير userData
  useEffect(() => {
    if (userData && !academyName) {
      const name = userData.full_name || userData.name || 'أكاديمية رياضية';
      setAcademyName(name);
    }
  }, [userData, academyName]);

  const lang = language || 'ar';
  const sidebarDir = lang === 'ar' ? 'rtl' : 'ltr';
  const borderDir = lang === 'ar' ? 'border-l' : 'border-r';

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // عناصر القائمة الجانبية مع الترجمة
  const academyMenuItems = [
    { title: 'sidebar.academy.home', icon: <Home />, path: '/dashboard/academy' },
    { title: 'sidebar.academy.profile', icon: <User />, path: '/dashboard/academy/profile' },
    { title: 'sidebar.academy.students', icon: <Users />, path: '/dashboard/academy/players' },
    { title: 'sidebar.academy.searchPlayers', icon: <Search />, path: '/dashboard/academy/search-players' },
    { title: 'sidebar.academy.playerVideos', icon: <Video />, path: '/dashboard/academy/player-videos' },
    { title: 'sidebar.academy.courses', icon: <BookOpen />, path: '/dashboard/academy/programs' },
    { title: 'sidebar.academy.teams', icon: <Target />, path: '/dashboard/academy/teams' },
    { title: 'sidebar.academy.trainers', icon: <GraduationCap />, path: '/dashboard/academy/coaches' },
    { title: 'sidebar.academy.schedule', icon: <Calendar />, path: '/dashboard/academy/schedule' },
    { title: 'sidebar.academy.tournaments', icon: <Trophy />, path: '/dashboard/academy/tournaments' },
    { title: 'sidebar.academy.performance', icon: <Star />, path: '/dashboard/academy/performance' },
    { title: 'sidebar.academy.reports', icon: <Award />, path: '/dashboard/academy/reports' },
    { title: 'sidebar.academy.facilities', icon: <MapPin />, path: '/dashboard/academy/facilities' },
    { title: 'sidebar.common.notifications', icon: <Bell />, path: '/dashboard/academy/notifications' },
    { title: 'sidebar.common.messages', icon: <MessageSquare />, path: '/dashboard/academy/messages' },
    { title: 'sidebar.academy.bulkPayment', icon: <Users />, path: '/dashboard/academy/bulk-payment' },
    { title: 'sidebar.academy.billing', icon: <Award />, path: '/dashboard/academy/billing' },
    { title: 'sidebar.common.changePassword', icon: <KeyRound />, path: '/dashboard/academy/change-password' },
  ];

  return (
    <aside
      className={`fixed top-16 right-0 bottom-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-900 shadow-lg ${borderDir} border-gray-200 dark:border-gray-800 flex flex-col z-30`}
      style={{ direction: sidebarDir }}
    >
      {/* زر الطي */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <Menu className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </button>
      </div>
      
      {/* شعار وعنوان */}
      {!collapsed && (
        <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
          <img src={logo} alt="شعار الأكاديمية" className="w-32 h-32 rounded-full border-4 border-orange-400 shadow" />
          <div className="mt-2 text-center">
            <div className="text-sm font-medium text-orange-600 dark:text-orange-400">الأكاديمية الرياضية</div>
            <div className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">{academyName}</div>
          </div>
        </div>
      )}
      
      {/* عناصر القائمة */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {academyMenuItems.map((item, idx) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors font-medium text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900 group ${collapsed ? 'justify-center' : ''}`}
            style={{ fontSize: '1.08rem' }}
          >
            <span className={`transition-transform duration-500 ease-out group-hover:scale-105 ${collapsed ? 'mx-auto' : ''}`}
              style={{ color: ['#f97316', '#0ea5e9', '#22c55e', '#eab308', '#a21caf', '#f43f5e'][idx % 6] }}
            >
              {item.icon}
            </span>
            {!collapsed && <span className="truncate">{item.title}</span>}
          </Link>
        ))}
      </nav>

      {/* زر تسجيل الخروج */}
      <div className="p-2 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 p-3 w-full rounded-lg transition-colors font-medium text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900 group ${collapsed ? 'justify-center' : ''}`}
          style={{ fontSize: '1.08rem' }}
        >
          <span className={`transition-transform duration-500 ease-out group-hover:scale-105 ${collapsed ? 'mx-auto' : ''}`} style={{ color: '#ef4444' }}>
            <LogOut />
          </span>
          {!collapsed && <span className="truncate">{'sidebar.common.logout'}</span>}
        </button>
      </div>
    </aside>
  );
} 
