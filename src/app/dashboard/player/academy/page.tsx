"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlayerAcademyRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/dream-academy');
  }, [router]);
  return <div className="p-6">جاري التحويل إلى صفحة أكاديمية الحلم الجديدة...</div>;
} 
