'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function EditTrainerPlayer() {
  const router = useRouter();
  const params = useParams();
  const playerId = params.playerId as string;
  
  useEffect(() => {
    // التوجيه إلى الصفحة المشتركة مع معاملات التعديل للمدرب
    router.replace(`/dashboard/shared/player-form?mode=edit&accountType=trainer&playerId=${playerId}`);
  }, [router, playerId]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحويل إلى صفحة تعديل اللاعب...</p>
      </div>
    </div>
  );
} 