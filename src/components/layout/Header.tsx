'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Menu, 
  X, 
  Search, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-provider';
// تم إلغاء LanguageSwitcher مؤقتاً
import InteractionNotifications from '@/components/notifications/InteractionNotifications';
import NotificationIcon from '@/components/notifications/NotificationIcon';
import { useMobileSidebar } from './MobileSidebarManager';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

interface HeaderProps {
  variant?: 'default' | 'minimal' | 'dashboard';
  showLanguageSwitcher?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  title?: string;
}

export default function Header({ 
  variant = 'default', 
  showLanguageSwitcher = true, 
  showNotifications = true, 
  showUserMenu = true,
  title 
}: HeaderProps) {
  const router = useRouter();
  const { user, userData, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const { toggleMobileSidebar } = useMobileSidebar();

  // كشف نوع الجهاز
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const getUserAvatar = () => {
    if (user?.photoURL) {
      return user.photoURL;
    }
    return user?.displayName?.charAt(0)?.toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'المستخدم';
  };

  // إغلاق القوائم عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu') && !target.closest('.mobile-menu')) {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'minimal') {
    return (
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            {showLanguageSwitcher && (
              <div>تم إلغاء مبدل اللغة مؤقتاً</div>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* الجانب الأيسر */}
          <div className="flex items-center space-x-4">
            {/* زر القائمة الجانبية للموبايل */}
            <button
              onClick={toggleMobileSidebar}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors touch-target"
              title="القائمة الجانبية"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* الشعار */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm md:text-base">E</span>
              </div>
              {!isMobile && (
                <span className="text-lg md:text-xl font-bold text-gray-900">El7lm</span>
              )}
            </div>

            {/* العنوان */}
            {title && !isMobile && (
              <div className="hidden md:block border-r border-gray-300 pr-4">
                <h1 className="text-lg font-medium text-gray-900">{title}</h1>
              </div>
            )}
          </div>

          {/* الجانب الأوسط - البحث */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* الجانب الأيمن */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* البحث في الموبايل */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors touch-target"
              title="البحث"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* الإشعارات */}
            {showNotifications && (
              <NotificationIcon />
            )}

            {/* مبدل اللغة */}
            {showLanguageSwitcher && (
              <div className="hidden md:block">
                <div>تم إلغاء مبدل اللغة مؤقتاً</div>
              </div>
            )}

            {/* قائمة المستخدم */}
            {showUserMenu && user && (
              <div className="relative user-menu">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={getUserDisplayName()}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm md:text-base">
                        {getUserAvatar()}
                      </span>
                    )}
                  </div>
                  {!isMobile && (
                    <>
                      <span className="text-sm md:text-base font-medium text-gray-900">
                        {getUserDisplayName()}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </>
                  )}
                </button>

                {/* قائمة المستخدم المنسدلة */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 mt-2 w-48 md:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            router.push('/dashboard/profile');
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-target"
                        >
                          <User className="w-4 h-4 mr-3" />
                          الملف الشخصي
                        </button>
                        
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            router.push('/dashboard/settings');
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-target"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          الإعدادات
                        </button>
                        
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            router.push('/dashboard/messages');
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-target"
                        >
                          <MessageSquare className="w-4 h-4 mr-3" />
                          الرسائل
                        </button>
                        
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            router.push('/support');
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-target"
                        >
                          <HelpCircle className="w-4 h-4 mr-3" />
                          المساعدة
                        </button>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleSignOut();
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors touch-target"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* زر القائمة للموبايل */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors touch-target"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* قائمة الموبايل */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4 mobile-menu"
            >
              {/* البحث في الموبايل */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="البحث..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* مبدل اللغة في الموبايل */}
              {showLanguageSwitcher && (
                <div className="mb-4">
                  <div>تم إلغاء مبدل اللغة مؤقتاً</div>
                </div>
              )}

              {/* روابط سريعة */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push('/dashboard/profile');
                  }}
                  className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                >
                  <User className="w-4 h-4 mr-3" />
                  الملف الشخصي
                </button>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push('/dashboard/settings');
                  }}
                  className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  الإعدادات
                </button>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push('/dashboard/messages');
                  }}
                  className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                >
                  <MessageSquare className="w-4 h-4 mr-3" />
                  الرسائل
                </button>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push(`/dashboard/${userData?.accountType || 'player'}/notifications`);
                  }}
                  className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                >
                  <Bell className="w-4 h-4 mr-3" />
                  الإشعارات
                </button>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push('/support');
                  }}
                  className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                >
                  <HelpCircle className="w-4 h-4 mr-3" />
                  المساعدة
                </button>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-target"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  تسجيل الخروج
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* إشعارات التفاعل */}
      <InteractionNotifications />
    </header>
  );
} 
