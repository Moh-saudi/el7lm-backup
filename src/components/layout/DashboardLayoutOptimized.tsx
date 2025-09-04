'use client';

import React, { Suspense, memo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { secureConsole } from '@/lib/utils/secure-console';

// استيراد المكونات بشكل ديناميكي مع تحسينات
const Header = dynamic(() => import('./Header'), {
  loading: () => (
    <div className="h-16 bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="w-32 h-8 bg-gray-200 rounded"></div>
    </div>
  ),
  ssr: true // تمكين SSR للأداء الأفضل
});

const Sidebar = dynamic(() => import('./Sidebar'), {
  loading: () => (
    <div className="w-64 bg-gray-100 animate-pulse flex flex-col p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 bg-gray-200 rounded mb-2"></div>
      ))}
    </div>
  ),
  ssr: true
});

const Footer = dynamic(() => import('./Footer'), {
  loading: () => (
    <div className="h-16 bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="w-48 h-6 bg-gray-200 rounded"></div>
    </div>
  ),
  ssr: true
});

import { SidebarProvider } from '@/lib/context/SidebarContext';

// مكون شاشة التحميل محسن
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span className="mr-2 text-gray-600">جاري التحميل...</span>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayoutOptimized = memo(({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();

  // فحص مسار Dashboard مع memoization
  const isDashboardPath = useCallback(() => {
    return pathname.startsWith('/dashboard');
  }, [pathname]);

  // تسجيل الأداء في التطوير فقط
  React.useEffect(() => {
    if (secureConsole.isDev()) {
      const startTime = performance.now();
      secureConsole.log('📊 DashboardLayout render start for:', pathname);
      
      return () => {
        const endTime = performance.now();
        secureConsole.log('⚡ DashboardLayout render time:', `${(endTime - startTime).toFixed(2)}ms`);
      };
    }
  }, [pathname]);

  // إذا لم يكن مسار dashboard، عرض المحتوى مباشرة
  if (!isDashboardPath()) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-gray-50" style={{ direction: 'rtl' }}>
        {/* Header مع Suspense محسن */}
        <Suspense fallback={<LoadingSpinner />}>
          <Header />
        </Suspense>
        
        <div className="flex flex-1 min-h-0 pt-16" style={{ direction: 'ltr' }}>
          {/* Sidebar مع Suspense محسن */}
          <Suspense fallback={<LoadingSpinner />}>
            <Sidebar />
          </Suspense>
          
          {/* المحتوى الرئيسي */}
          <main 
            className="flex-1 min-h-0 overflow-auto transition-all duration-300 ease-in-out"
            style={{ direction: 'rtl' }}
          >
            <div className="w-full max-w-full p-6 mx-auto">
              <div className="min-h-full p-6 bg-white rounded-lg shadow-sm">
                <Suspense fallback={<LoadingSpinner />}>
                  {children}
                </Suspense>
              </div>
            </div>
          </main>
        </div>
        
        {/* Footer مع Suspense محسن */}
        <Suspense fallback={<LoadingSpinner />}>
          <Footer />
        </Suspense>
      </div>
    </SidebarProvider>
  );
});

DashboardLayoutOptimized.displayName = 'DashboardLayoutOptimized';

export default DashboardLayoutOptimized; 
