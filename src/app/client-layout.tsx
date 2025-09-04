'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/lib/firebase/auth-provider';
import { initializePerformanceOptimizations } from '@/lib/performance/console-optimizer';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  useEffect(() => {
    // تهيئة تحسينات الأداء
    initializePerformanceOptimizations();
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
} 
