'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AddAcademyPlayer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // فحص إذا كان وضع التعديل
    const editId = searchParams.get('edit');
    
    if (editId) {
      // وضع التعديل - التوجيه مع معرف اللاعب
      router.replace(`/dashboard/shared/player-form?mode=edit&accountType=academy&playerId=${editId}`);
    } else {
      // وضع الإضافة
    router.replace('/dashboard/shared/player-form?mode=add&accountType=academy');
    }
  }, [router, searchParams]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">
          {searchParams.get('edit') ? 'جاري التحويل إلى صفحة تعديل اللاعب...' : 'جاري التحويل إلى صفحة إضافة اللاعب...'}
        </p>
      </div>
    </div>
  );
} 
