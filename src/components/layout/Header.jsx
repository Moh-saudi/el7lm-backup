'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  Menu,
  X,
  ChevronDown,
  MessageSquare,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/lib/context/SidebarContext';
import MessageNotifications from '@/components/messaging/MessageNotifications';
import ExternalNotifications from '@/components/messaging/ExternalNotifications';
// تم حذف الترجمة

const Header = () => {
  const language = 'ar';
  const setLanguage = () => {};
  const t = (key) => key;
  const pathname = usePathname();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState('/default-avatar.png');
  const [userName, setUserName] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toggleMobileSidebar } = useSidebar();

  // Check if we're on a player dashboard page
  const isPlayerDashboard = pathname.startsWith('/dashboard/player');

  // Fetch user profile data
  useEffect(() => {
    if (user && isPlayerDashboard) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'players', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Handle profile image
            if (userData?.profile_image) {
              // If profile_image is an object with url
              if (typeof userData.profile_image === 'object' && userData.profile_image.url) {
                setUserProfileImage(userData.profile_image.url);
              }
              // If profile_image is a direct string URL
              else if (typeof userData.profile_image === 'string') {
                setUserProfileImage(userData.profile_image);
              }
            } else {
              // Set default image if no profile image exists
              setUserProfileImage('/default-avatar.png');
            }

            // Set user name
            let displayName = '';
            if (userData?.full_name && userData.full_name !== 'undefined undefined') {
              displayName = userData.full_name;
            } else if (userData?.firstName && userData?.lastName) {
              displayName = `${userData.firstName} ${userData.lastName}`.trim();
            } else if (userData?.name) {
              displayName = userData.name;
            }
            setUserName(displayName || 'header.defaultPlayerName');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set defaults on error
          setUserProfileImage('/default-avatar.png');
        }
      };

      fetchUserData();
    }
  }, [user, isPlayerDashboard, refreshTrigger, t]);

  // Auto-refresh profile image every 30 seconds
  useEffect(() => {
    if (isPlayerDashboard) {
      const interval = setInterval(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isPlayerDashboard]);

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleLoginClick = () => {
    router.push('/auth/login');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getNavItems = () => {
    const isAuthPage = pathname === '/auth/login' || pathname === '/auth/register';
    const isHomePage = pathname === '/';
    
    if (isAuthPage) return [];
    if (isHomePage) {
      return [
        { label: 'header.nav.home', href: '/' },
        { label: 'header.nav.about', href: '/#about' },
        { label: 'header.nav.services', href: '/#services' },
        { label: 'header.nav.contact', href: '/contact' }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  // Check if we're on a dashboard page
  const isDashboardPage = pathname.startsWith('/dashboard');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left Side - Sidebar Toggle & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Sidebar Toggle for Dashboard Pages */}
            {isDashboardPage && (
              <button 
                onClick={toggleMobileSidebar}
                className="p-2 text-gray-600 rounded-lg lg:hidden hover:bg-gray-100 transition-colors duration-200"
                aria-label={'header.menuToggle'}
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            
            {/* Mobile Menu Button for Non-Dashboard Pages */}
            {!isDashboardPage && (
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 rounded-lg lg:hidden hover:bg-gray-100 transition-colors duration-200"
                aria-label={'header.menuToggle'}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
           
          {/* Logo */}
          <div className="flex items-center gap-2">
                          <img src="/el7lm-logo.png" alt={'header.logoAlt'} className="w-auto h-10" />
              <span className="hidden md:block text-xl font-bold text-gray-800">El7lm</span>
          </div>
           
          {/* Search Bar */}
          {isDashboardPage && (
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={'header.searchPlaceholder'}
                  className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Language Toggle Button */}
            <button
              onClick={() => {
                const newLang = language === 'ar' ? 'en' : 'ar';
                setLanguage(newLang);
                localStorage.setItem('el7lm-language', newLang);
                window.location.reload();
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              aria-label={'header.languageToggle'}
            >
              <span className="text-xs font-bold">
                {language === 'en' ? 'عربي' : 'EN'}
              </span>
            </button>
            {/* Dashboard Actions */}
            {isDashboardPage && user && (
              <>
                {/* Unified Notifications */}
                <ExternalNotifications />

                {/* User Profile Image Only */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-200 overflow-hidden">
                    <img
                      src={userProfileImage}
                      alt={userName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/default-avatar.png';
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{userName}</span>
                </div>
              </>
            )}

            {/* Login Button for Non-Dashboard Pages */}
            {!isDashboardPage && !user && (
              <button
                onClick={handleLoginClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                {'header.loginButton'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu for Non-Dashboard Pages */}
        <AnimatePresence>
          {isMobileMenuOpen && !isDashboardPage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 bg-white"
            >
              <nav className="px-4 py-4 space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {!user && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLoginClick();
                    }}
                    className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    تسجيل الدخول
                  </button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header; 
