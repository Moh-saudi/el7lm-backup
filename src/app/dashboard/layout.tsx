'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/lib/firebase/auth-provider';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import ResponsiveLayoutWrapper from '@/components/layout/ResponsiveLayout';
import FloatingChatWidget from '@/components/support/FloatingChatWidget';
import OfflineIndicator from '@/components/ui/OfflineIndicator';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userData: authUserData, loading: authLoading } = useAuth();
  const showOfflineBanner = process.env.NEXT_PUBLIC_SHOW_OFFLINE_BANNER === 'true';

  // تحديد نوع الحساب
  const accountType = useMemo(() => {
    if (!authUserData?.accountType) return 'player';
    return authUserData.accountType;
  }, [authUserData?.accountType]);

  // عرض شاشة تحميل إذا كانت المصادقة تحمل
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600 font-medium">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // عرض رسالة خطأ إذا لم يكن هناك مستخدم
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* مؤشر عدم الاتصال */}
      {showOfflineBanner && <OfflineIndicator />}
      
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <ResponsiveLayoutWrapper
        accountType={accountType}
        showSidebar={true}
        showHeader={true}
        showFooter={true}
      >
        {children}
      </ResponsiveLayoutWrapper>
      
      <FloatingChatWidget />
    </>
  );
} 
