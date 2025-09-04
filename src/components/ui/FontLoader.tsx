'use client';

import { useEffect } from 'react';

interface FontLoaderProps {
  fonts?: string[];
}

export default function FontLoader({ 
  fonts = [
    'https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap'
  ] 
}: FontLoaderProps) {
  useEffect(() => {
    // تحميل الخطوط بشكل محسن مع معالجة الأخطاء
    fonts.forEach(fontUrl => {
      // فحص إذا كان الخط محمل بالفعل
      const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
      if (existingLink) {
        return; // الخط محمل بالفعل
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      link.crossOrigin = 'anonymous';
      
      // إضافة معالج الأخطاء
      link.onerror = () => {
        console.warn(`Failed to load font: ${fontUrl}`);
        // إزالة الرابط الفاشل
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      };
      
      // إضافة معالج النجاح
      link.onload = () => {
        console.log(`Font loaded successfully: ${fontUrl}`);
      };
      
      if (typeof document !== 'undefined') {
        document.head.appendChild(link);
      }
    });

    // تنظيف عند إلغاء التحميل
    return () => {
      if (typeof document !== 'undefined') {
        const links = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
        links.forEach(link => {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
        });
      }
    };
  }, [fonts]);

  return null;
} 
