'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OfflineIndicatorProps {
  showFullScreen?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ showFullScreen = false }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // تحديث الحالة عند تغيير الاتصال
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // التحقق من الحالة الأولية
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleRefresh = () => {
    setIsChecking(true);
    window.location.reload();
  };

  // إذا كان متصل بالإنترنت، لا تظهر أي شيء
  if (isOnline) {
    return null;
  }

  // إذا كان مطلوب عرض شاشة كاملة
  if (showFullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">لا يوجد اتصال بالإنترنت</h2>
          <p className="text-gray-600 mb-6">
            يبدو أنك غير متصل بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.
          </p>
          <Button 
            onClick={handleRefresh}
            disabled={isChecking}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                إعادة المحاولة
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // عرض مؤشر صغير في الأعلى
  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">لا يوجد اتصال بالإنترنت</h3>
              <p className="text-sm text-red-600">بعض الميزات قد لا تعمل بشكل صحيح</p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={isChecking}
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            {isChecking ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
