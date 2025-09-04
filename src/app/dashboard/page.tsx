'use client';

import { useAuth } from '@/lib/firebase/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (userData?.accountType) {
      const accountType = userData.accountType;
      
      // Valid account types
      const validTypes = ['player', 'club', 'agent', 'academy', 'trainer', 'admin', 'marketer', 'parent'];
      
      if (validTypes.includes(accountType)) {
        // Redirect parent accounts to player dashboard
        if (accountType === 'parent') {
          router.push('/dashboard/player');
        } else {
          router.push(`/dashboard/${accountType}`);
        }
      } else {
        // Invalid account type - redirect to player dashboard as fallback
        console.warn(`Invalid account type: ${accountType}, redirecting to player dashboard`);
        router.push('/dashboard/player');
      }
    } else {
      // No account type found - redirect to player dashboard as fallback
      console.warn('No account type found, redirecting to player dashboard');
      router.push('/dashboard/player');
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري توجيهك إلى لوحة التحكم...</p>
      </div>
    </div>
  );
}
