'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Grid,
  List,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';

// ===== CONTEXT للتحكم في التخطيط =====
interface LayoutContextType {
  isSidebarOpen: boolean;
  isHeaderExpanded: boolean;
  isSearchOpen: boolean;
  toggleSidebar: () => void;
  toggleHeader: () => void;
  toggleSearch: () => void;
  closeAll: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within MobileLayoutProvider');
  }
  return context;
};

// ===== PROVIDER للتحكم في الحالة =====
interface MobileLayoutProviderProps {
  children: React.ReactNode;
}

export const MobileLayoutProvider: React.FC<MobileLayoutProviderProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleHeader = () => setIsHeaderExpanded(!isHeaderExpanded);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const closeAll = () => {
    setIsSidebarOpen(false);
    setIsHeaderExpanded(false);
    setIsSearchOpen(false);
  };

  return (
    <LayoutContext.Provider value={{
      isSidebarOpen,
      isHeaderExpanded,
      isSearchOpen,
      toggleSidebar,
      toggleHeader,
      toggleSearch,
      closeAll
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

// ===== المكون الرئيسي للتخطيط =====
interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  showAddButton?: boolean;
  onAddClick?: () => void;
  onBackClick?: () => void;
  accountType?: string;
}

export default function MobileLayout({
  children,
  title = "لوحة التحكم",
  showBackButton = false,
  showSearch = true,
  showAddButton = false,
  onAddClick,
  onBackClick,
  accountType = 'player'
}: MobileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { 
    isSidebarOpen, 
    isHeaderExpanded, 
    isSearchOpen,
    toggleSidebar, 
    toggleHeader, 
    toggleSearch, 
    closeAll 
  } = useLayout();

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

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

  // إغلاق القوائم عند تغيير الصفحة
  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  // إغلاق القوائم عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.mobile-layout') && !target.closest('.sidebar') && !target.closest('.header')) {
        closeAll();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeAll]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const getUserDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'المستخدم';
  };

  // ===== القائمة الجانبية =====
  const Sidebar = () => (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAll}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 z-50 shadow-2xl sidebar"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white/10 backdrop-blur-sm border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{getUserDisplayName()}</h3>
                  <p className="text-white/70 text-sm">{accountType}</p>
                </div>
              </div>
              <button
                onClick={closeAll}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <SidebarItem
                icon={Home}
                title="الرئيسية"
                href="/dashboard"
                active={pathname === '/dashboard'}
              />
              <SidebarItem
                icon={User}
                title="الملف الشخصي"
                href="/dashboard/profile"
                active={pathname === '/dashboard/profile'}
              />
              <SidebarItem
                icon={Bell}
                title="الإشعارات"
                href={`/dashboard/${userData?.accountType || 'player'}/notifications`}
                active={pathname.includes('/notifications')}
              />
              <SidebarItem
                icon={Settings}
                title="الإعدادات"
                href="/dashboard/settings"
                active={pathname === '/dashboard/settings'}
              />
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/20">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 p-3 text-white hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // ===== الهيدر =====
  const Header = () => (
    <motion.header
      layout
      className="fixed top-0 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-30 header"
    >
      <div className="flex items-center justify-between p-4">
        {/* Left */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            title="القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {showBackButton && (
            <button
              onClick={onBackClick || (() => router.back())}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-1">
          {showSearch && (
            <button
              onClick={toggleSearch}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target"
              title="البحث"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
          
          {showAddButton && (
            <button
              onClick={onAddClick}
              className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors touch-target"
              title="إضافة جديد"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={toggleHeader}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            title="الملف الشخصي"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Expanded Header */}
      <AnimatePresence>
        {isHeaderExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 bg-gray-50"
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 p-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  الإعدادات
                </button>
                <button 
                  onClick={handleSignOut}
                  className="flex-1 p-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 bg-white"
          >
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="البحث..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );

  // ===== الفوتر =====
  const Footer = () => (
    <motion.footer
      layout
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30"
    >
      <div className="flex items-center justify-around p-2">
        <FooterItem
          icon={Home}
          title="الرئيسية"
          href="/dashboard"
          active={pathname === '/dashboard'}
        />
        <FooterItem
          icon={Grid}
          title="القائمة"
          href="/dashboard/list"
          active={pathname === '/dashboard/list'}
        />
        <FooterItem
          icon={Bell}
          title="الإشعارات"
          href={`/dashboard/${userData?.accountType || 'player'}/notifications`}
          active={pathname.includes('/notifications')}
        />
        <FooterItem
          icon={User}
          title="الملف"
          href="/dashboard/profile"
          active={pathname === '/dashboard/profile'}
        />
      </div>
      
      {/* إضافة مساحة للوجو في الأسفل */}
      <div className="px-4 py-2 border-t border-gray-100 logo-section">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 space-y-2 sm:space-y-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start space-x-2">
            <span>الحلم</span>
            <span>el7lm</span>
            <span>جميع الحقوق محفوظة</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="font-medium">Mesk El7lm</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );

  return (
    <div className="mobile-layout min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      
      {/* Main Content */}
      <main className="pt-20 pb-32 px-4">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}

// ===== المكونات المساعدة =====
interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  href: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, title, href, active }) => {
  const router = useRouter();
  const { closeAll } = useLayout();

  const handleClick = () => {
    router.push(href);
    closeAll();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
        active 
          ? 'bg-white/20 text-white' 
          : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{title}</span>
    </button>
  );
};

interface FooterItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  href: string;
  active?: boolean;
}

const FooterItem: React.FC<FooterItemProps> = ({ icon: Icon, title, href, active }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
        active 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      <Icon className="w-5 h-5 mb-1" />
      <span className="text-xs">{title}</span>
    </button>
  );
};
