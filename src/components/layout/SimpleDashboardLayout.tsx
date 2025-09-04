'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { SimpleSidebarProvider } from '@/lib/context/SimpleSidebarContext';
import SimpleHeader from './SimpleHeader';
import SimpleSidebar from './SimpleSidebar';

interface SimpleDashboardLayoutProps {
  children: React.ReactNode;
  accountType?: string;
  title?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

const SimpleDashboardLayout: React.FC<SimpleDashboardLayoutProps> = ({
  children,
  accountType = 'player',
  title = "El7lm Platform",
  showSearch = true,
  searchPlaceholder = "ابحث عن أي شيء..."
}) => {
  const { user, userData, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">يرجى تسجيل الدخول</h1>
          <p className="text-gray-600">يجب تسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>
      </div>
    );
  }

  const effectiveAccountType = (userData?.accountType as string) || accountType;

  return (
    <SimpleSidebarProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" style={{ direction: 'rtl' }}>
        
        {/* الهيدر المبسط */}
        <SimpleHeader
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder}
          title={title}
        />
        
        {/* المحتوى الرئيسي */}
        <div className="flex flex-1 min-h-0" style={{ direction: 'rtl' }}>
          
          {/* القائمة الجانبية المبسطة */}
          <SimpleSidebar
            accountType={effectiveAccountType}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
          
          {/* المحتوى الرئيسي */}
          <main 
            className={`flex-1 min-h-0 overflow-auto transition-all duration-300 ease-in-out ${
              collapsed ? 'mr-20' : 'mr-[280px]'
            }`}
            style={{ direction: 'rtl' }}
          >
            {/* مساحة للهيدر */}
            <div className="pt-20">
              {/* مساحة للفوتر */}
              <div className="pb-4">
                <div className="w-full min-h-full">
                  {/* Container للمحتوى */}
                  <div className="min-h-full p-6">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SimpleSidebarProvider>
  );
};

export default SimpleDashboardLayout;
