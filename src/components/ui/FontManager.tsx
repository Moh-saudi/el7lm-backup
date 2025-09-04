'use client';

import { useEffect, useState } from 'react';

interface FontManagerProps {
  children: React.ReactNode;
}

export default function FontManager({ children }: FontManagerProps) {
  const [mounted, setMounted] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // إضافة كلاس الخطوط المحملة بعد تحميل الصفحة
    const timer = setTimeout(() => {
      setFontsLoaded(true);
      if (typeof document !== 'undefined') {
        document.body.classList.add('fonts-loaded');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // تجنب hydration mismatch بالعودة إلى نفس المحتوى على الخادم والعميل
  return (
    <div className={`font-cairo ${fontsLoaded ? 'fonts-loaded' : ''}`} suppressHydrationWarning>
      {children}
    </div>
  );
}
