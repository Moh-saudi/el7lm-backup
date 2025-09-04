'use client';

import { useAuth } from '@/lib/firebase/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UseAccountTypeAuthOptions {
  allowedTypes: string[];
  redirectTo?: string;
}

const allowedAccountTypes = ['player', 'club', 'agent', 'academy', 'trainer', 'admin', 'marketer', 'parent'];

export const useAccountTypeAuth = ({ allowedTypes, redirectTo = '/' }: UseAccountTypeAuthOptions) => {
  const { user, loading, userData } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // المستخدم غير مسجل الدخول - توجيه لصفحة تسجيل الدخول
        router.push('/auth/login');
        return;
      }

      if (userData) {
        const userAccountType = (userData as any).accountType;
        
        if (userAccountType && allowedTypes.includes(userAccountType)) {
          setIsAuthorized(true);
        } else {
          // نوع الحساب غير مسموح أو غير محدد - توجيه للوحة المناسبة
          const correctRoute = getDashboardRoute(userAccountType || 'player');
          router.push(correctRoute);
        }
      }
      
      setIsCheckingAuth(false);
    }
  }, [user, loading, userData, allowedTypes, redirectTo, router]);

  const getDashboardRoute = (accountType: string) => {
    switch (accountType) {
      case 'player':
        return '/dashboard/player';
      case 'club':
        return '/dashboard/club';
      case 'agent':
        return '/dashboard/agent';
      case 'academy':
        return '/dashboard/academy';
      case 'trainer':
        return '/dashboard/trainer';
      case 'marketer':
        return '/dashboard/marketer';
      default:
        return '/dashboard';
    }
  };

  return {
    isAuthorized,
    isCheckingAuth,
    user,
    userData,
    accountType: userData ? (userData as any).accountType : null
  };
};

// مكون الحماية العامة
export const AccountTypeProtection = ({ 
  children, 
  allowedTypes, 
  redirectTo = '/',
  loadingComponent 
}: {
  children: React.ReactNode;
  allowedTypes: string[];
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}) => {
  const { isAuthorized, isCheckingAuth } = useAccountTypeAuth({ allowedTypes, redirectTo });

  if (isCheckingAuth) {
    return loadingComponent || (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري التحقق من صلاحيات الوصول...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // سيتم التوجيه تلقائياً
  }

  return <>{children}</>;
}; 
