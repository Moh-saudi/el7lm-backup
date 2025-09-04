'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AddTrainerPlayer() {
  const router = useRouter();
  
  useEffect(() => {
    // التوجيه إلى الصفحة المشتركة مع معاملات المدرب
    router.replace('/dashboard/shared/player-form?mode=add&accountType=trainer');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحويل إلى صفحة إضافة اللاعب...</p>
      </div>
    </div>
  );
} 
