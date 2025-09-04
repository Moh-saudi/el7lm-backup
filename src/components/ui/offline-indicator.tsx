'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // تحديد الحالة الأولية
    setIsOnline(navigator.onLine);

    // مراقبة تغيرات الاتصال
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      
      // إخفاء المؤشر بعد 3 ثوان عند العودة للاتصال
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    // إضافة مستمعي الأحداث
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // تنظيف المستمعين عند إلغاء التثبيت
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // إظهار المؤشر فقط عند عدم الاتصال أو عند العودة مؤقتاً
  if (!showIndicator && isOnline) return null;

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className={`
      fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999]
      px-4 py-3 rounded-lg shadow-lg
      flex items-center gap-3
      transition-all duration-300 ease-in-out
      ${isOnline 
        ? 'bg-green-500 text-white animate-bounce' 
        : 'bg-red-500 text-white'
      }
      ${showIndicator ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
    `}>
      {/* أيقونة الحالة */}
      <div className="flex-shrink-0">
        {isOnline ? (
          <Wifi className="w-5 h-5" />
        ) : (
          <WifiOff className="w-5 h-5" />
        )}
      </div>

      {/* النص */}
      <div className="flex-1 text-sm font-medium">
        {isOnline ? (
          'تم استعادة الاتصال بالإنترنت'
        ) : (
          'لا يوجد اتصال بالإنترنت'
        )}
      </div>

      {/* زر إعادة المحاولة (فقط عند عدم الاتصال) */}
      {!isOnline && (
        <button
          onClick={handleRetry}
          className="flex-shrink-0 p-1 rounded hover:bg-red-600 transition-colors"
          title="إعادة المحاولة"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}

      {/* زر الإغلاق */}
      <button
        onClick={() => setShowIndicator(false)}
        className="flex-shrink-0 p-1 rounded hover:bg-opacity-80 transition-colors"
        title="إخفاء"
      >
        ×
      </button>
    </div>
  );
}
