'use client';


import { useAuth } from '@/lib/firebase/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MarketerPaymentPage() {
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;
  const { userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // إعادة التوجيه إلى صفحة الدفع المشتركة
    router.replace('/dashboard/payment');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحويل إلى صفحة الدفع...</p>
      </div>
    </div>
  );
}
