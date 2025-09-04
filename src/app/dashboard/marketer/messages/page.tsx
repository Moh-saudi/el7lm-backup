'use client';

import { useAuth } from '@/lib/firebase/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MarketerMessagesPage() {
  const { userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // إعادة التوجيه إلى صفحة الرسائل المشتركة
    router.replace('/dashboard/messages');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحويل إلى مركز الرسائل...</p>
      </div>
    </div>
  );
}
