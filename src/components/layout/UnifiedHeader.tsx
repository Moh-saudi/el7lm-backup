'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Sun, Moon, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { db } from '@/lib/firebase/config';
import { supabase } from '@/lib/supabase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import UnifiedNotificationsButton from '@/components/shared/UnifiedNotificationsButton';
import EnhancedMessageButton from '@/components/shared/EnhancedMessageButton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  accountType: string;
  role: string;
}

interface HeaderProps {
  title?: string;
  logo?: string;
  showNotifications?: boolean;
  showMessages?: boolean;
  showProfile?: boolean;
  customActions?: React.ReactNode;
}

const getSupabaseImageUrl = (path: string) => {
  if (!path) return '/images/default-avatar.png';
  if (path.startsWith('http')) return path;
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
  return publicUrl || '/images/default-avatar.png';
};

const getAccountTypeInfo = (accountType: string) => {
  const types = {
    player: { name: 'لاعب', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    academy: { name: 'أكاديمية', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    club: { name: 'نادي', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    trainer: { name: 'مدرب', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    parent: { name: 'ولي أمر', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
    agent: { name: 'وكيل', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
    admin: { name: 'مدير', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    marketer: { name: 'مسوق', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
  };
  return types[accountType as keyof typeof types] || { name: 'مستخدم', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
};

export default function UnifiedHeader({
  title = "منصة الأكاديميات",
  logo,
  showNotifications = true,
  showMessages = true,
  showProfile = true,
  customActions
}: HeaderProps) {
  const [lang, setLang] = useState('ar');
  const [darkMode, setDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const htmlLang = document.documentElement.lang;
    setLang(htmlLang || 'ar');
    const savedMode = localStorage.getItem('dark-mode');
    if (savedMode === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dark-mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dark-mode', 'false');
    }
  }, [darkMode]);

  // جلب بيانات المستخدم
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserProfile({
          name: data.name || data.displayName || 'مستخدم غير معروف',
          email: data.email || user.email || '',
          avatar: getSupabaseImageUrl(data.avatar),
          accountType: data.accountType || 'player',
          role: data.role || 'user'
        });
      }
      setLoading(false);
    }, (error) => {
      console.error('خطأ في جلب بيانات المستخدم:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const accountTypeInfo = userProfile ? getAccountTypeInfo(userProfile.accountType) : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4">
        {/* الشعار والعنوان */}
        <div className="flex items-center gap-3">
          {logo && (
            <img 
              src={logo} 
              alt="الشعار" 
              className="w-10 h-10 rounded-full border-2 border-orange-400 shadow" 
            />
          )}
                <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-orange-700 dark:text-orange-300">
              {title}
                  </span>
            {userProfile && (
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${accountTypeInfo?.color}`}>
                  {accountTypeInfo?.name}
                </Badge>
                {userProfile.role === 'admin' && (
                  <Badge variant="destructive" className="text-xs">
                    مدير
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* الأزرار والإجراءات */}
        <div className="flex items-center gap-4">
          {/* الإشعارات */}
          {showNotifications && <UnifiedNotificationsButton />}
          
          {/* الرسائل */}
          {showMessages && <EnhancedMessageButton />}
          
          {/* الدعم الفني */}
          
          {/* الإجراءات المخصصة */}
          {customActions}
          
          {/* تبديل الوضع المظلم */}
              <Button 
                variant="ghost" 
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </Button>

          {/* قائمة المستخدم */}
          {showProfile && userProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                    <AvatarFallback>
                      {userProfile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
              </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userProfile.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {userProfile.email}
                    </p>
            </div>
          </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>الملف الشخصي</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>الإعدادات</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 dark:text-red-400"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
} 
