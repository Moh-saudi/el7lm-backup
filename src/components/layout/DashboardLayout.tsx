'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSidebar } from './SidebarProvider';
import UnifiedSidebar from './UnifiedSidebar';
import MobileMenuButton from './MobileMenuButton';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isOpen, toggleSidebar, isMobile } = useSidebar();
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // كشف حجم الشاشة تلقائياً
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
        setSidebarCollapsed(false);
      } else if (width < 1024) {
        setScreenSize('tablet');
        setSidebarCollapsed(true);
      } else {
        setScreenSize('desktop');
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // تحديد عرض المحتوى الرئيسي
  const getMainContentMargin = () => {
    if (isMobile) return 'w-full';
    if (!isOpen) {
      if (screenSize === 'tablet') return 'mr-16';
      return 'mr-20';
    }
    if (sidebarCollapsed) {
      if (screenSize === 'tablet') return 'mr-16';
      return 'mr-20';
    }
    if (screenSize === 'tablet') return 'mr-64';
    return 'mr-80';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <UnifiedSidebar 
        isOpen={isOpen} 
        onToggle={toggleSidebar} 
        isMobile={isMobile} 
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${getMainContentMargin()}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-4">
              <MobileMenuButton />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">لوحة التحكم</h1>
                <p className="text-sm text-gray-600">مرحباً بك في منصة الحلم</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* يمكن إضافة أزرار إضافية هنا مثل الإشعارات */}
            </div>
          </div>
        </header>

        {/* Hidden Toggle Button - يظهر فقط عندما يكون السايدبار مغلقاً */}
        {!isMobile && !isOpen && (
          <>
            {/* زر في الأعلى تحت الهيدر */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-20 right-4 z-40"
            >
              <Button
                onClick={toggleSidebar}
                size="sm"
                variant="outline"
                className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 rounded-full w-10 h-10 p-0"
              >
                <Menu className="w-4 h-4 text-gray-600" />
              </Button>
            </motion.div>

            {/* زر في الجانب الأيسر من الشاشة */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40"
            >
              <Button
                onClick={toggleSidebar}
                size="sm"
                variant="outline"
                className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 rounded-full w-10 h-10 p-0"
              >
                <Menu className="w-4 h-4 text-gray-600" />
              </Button>
            </motion.div>
          </>
        )}

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
