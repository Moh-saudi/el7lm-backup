'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider } from '@/lib/context/SidebarContext';
import UnifiedHeader from './UnifiedHeader';
import Footer from './Footer';
import FloatingChatWidget from '../support/FloatingChatWidget';
import EnhancedSidebar from './EnhancedSidebar';
import EnhancedNotifications from '../ui/EnhancedNotifications';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UnifiedDashboardLayoutProps {
  children: React.ReactNode;
  accountType?: string;
  title?: string;
  logo?: string;
  showFooter?: boolean;
  showFloatingChat?: boolean;
}

import WelcomeDialog from './WelcomeDialog';

const UnifiedDashboardLayout: React.FC<UnifiedDashboardLayoutProps> = ({
  children,
  accountType = 'player',
  title = 'لوحة التحكم',
  logo = '/el7lm-logo.png',
  showFooter = true,
  showFloatingChat = true
}) => {
  const { user, userData, loading } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  // Prefer explicitly provided accountType (e.g., admin layout) over user data
  const effectiveAccountType = accountType || (userData?.accountType as string) || 'player';

  // إخفاء عناصر معينة في صفحات الملف الشخصي
  const isProfilePage = pathname.includes('/search/profile/');
  const isReportsPage = pathname.includes('/reports');
  const isEntityProfilePage = pathname.includes('/search/profile/');
  
  // توحيد الشريط الجانبي: لا تُخفِ الشريط في صفحات التقارير إلا للاعب فقط
  const shouldShowSidebar = !isEntityProfilePage && !(isReportsPage && effectiveAccountType === 'player');

  // عرض شاشة تحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // عرض رسالة خطأ إذا لم يكن هناك مستخدم
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-gray-50" style={{ direction: 'rtl' }}>
        {/* الإشعارات المحسنة */}
        <EnhancedNotifications />
        
        {/* الهيدر - ثابت في الأعلى */}
        {!isEntityProfilePage && (
          <UnifiedHeader 
            variant="default"
            showLanguageSwitcher={true}
            showNotifications={true}
            showUserMenu={true}
            title={title}
            logo={logo}
          />
        )}
        
        {/* المحتوى الرئيسي - مع مساحة للهيدر والفوتر */}
        <div className="flex flex-1 min-h-0" style={{ direction: 'rtl' }}>
          {/* القائمة الجانبية المحسنة - ثابتة على اليمين */}
          {shouldShowSidebar && (
            <EnhancedSidebar
              accountType={effectiveAccountType}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              userData={userData}
            />
          )}
          
          {/* المحتوى الرئيسي */}
          <main 
            className={`flex-1 min-h-0 overflow-auto transition-all duration-300 ease-in-out ${
              shouldShowSidebar ? (collapsed ? 'mr-20' : 'mr-64') : ''
            }`}
            style={{ direction: 'rtl' }}
          >
            {/* مساحة للهيدر */}
            <div className={!isEntityProfilePage ? 'pt-16' : ''}>
              {/* مساحة للفوتر */}
              <div className={showFooter ? 'pb-20' : 'pb-4'}>
                <div className="w-full">
                  <div className="min-h-full">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* نافذة الترحيب */}
        <WelcomeDialog user={user} pathname={pathname} onClose={() => {}} />

        {/* الفوتر - ثابت في الأسفل */}
        {showFooter && !isEntityProfilePage && <Footer />}
        
        {/* أيقونة الدعم الفني */}
        {showFloatingChat && <FloatingChatWidget />}
      </div>
    </SidebarProvider>
  );
};

export default UnifiedDashboardLayout;
