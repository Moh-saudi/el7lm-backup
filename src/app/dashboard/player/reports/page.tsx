'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';

export default function PlayerReportPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user?.uid) {
      // إعادة توجيه إلى الصفحة المشتركة مع معرف اللاعب الحالي
      console.log('🔄 إعادة توجيه إلى الصفحة المشتركة:', `/dashboard/shared/player-profile/${user.uid}`);
      router.replace(`/dashboard/shared/player-profile/${user.uid}`);
    }
  }, [user, loading, router]);

  // عرض شاشة تحميل أثناء إعادة التوجيه
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري إعادة التوجيه إلى صفحة التقرير المشتركة...</p>
      </div>
    </div>
  );
}





