'use client';

import React, { useState, useEffect } from 'react';

/**
 * مكون لعرض حالة Microsoft Clarity
 * للتحقق من التحميل الصحيح
 */
const ClarityStatus: React.FC = () => {
  const [clarityStatus, setClarityStatus] = useState<{
    loaded: boolean;
    projectId: string | null;
    errors: string[];
  }>({
    loaded: false,
    projectId: null,
    errors: []
  });

  useEffect(() => {
    const checkClarityStatus = () => {
      const status = {
        loaded: false,
        projectId: null,
        errors: []
      };

      try {
        // التحقق من وجود window.clarity
        if (typeof window !== 'undefined' && (window as any).clarity) {
          status.loaded = true;
          
          // محاولة الحصول على Project ID من البيئة
          const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
          const apiKey = process.env.NEXT_PUBLIC_CLARITY_API_KEY;
          
          if (projectId && projectId !== 'your_clarity_project_id_here') {
            status.projectId = projectId;
          } else {
            status.errors.push('Project ID غير صحيح أو غير محدد');
          }

          // التحقق من API Key
          if (!apiKey || apiKey === 'your_clarity_api_key_here') {
            status.errors.push('API Key غير محدد');
          } else {
            // إخفاء معظم API Key للأمان
            const maskedKey = apiKey.length > 20 ? 
              `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 10)}` : 
              '***';
            status.projectId = `${status.projectId} (API: ${maskedKey})`;
          }

          // اختبار API
          try {
            (window as any).clarity('set', 'test_tag', 'test_value');
          } catch (error) {
            status.errors.push(`خطأ في API: ${error}`);
          }
        } else {
          status.errors.push('Clarity لم يتم تحميله');
        }
      } catch (error) {
        status.errors.push(`خطأ عام: ${error}`);
      }

      setClarityStatus(status);
    };

    // فحص فوري
    checkClarityStatus();

    // فحص دوري كل ثانيتين
    const interval = setInterval(checkClarityStatus, 2000);

    // إيقاف الفحص بعد 30 ثانية
    setTimeout(() => {
      clearInterval(interval);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // إخفاء ClarityStatus في جميع البيئات
  return null;

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-semibold text-sm mb-2">Microsoft Clarity Status</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${clarityStatus.loaded ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Clarity: {clarityStatus.loaded ? 'Loaded' : 'Not Loaded'}</span>
        </div>
        
        {clarityStatus.projectId && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Project ID: {clarityStatus.projectId}</span>
          </div>
        )}
        
        {clarityStatus.errors.length > 0 && (
          <div className="mt-2">
            <div className="text-red-600 font-medium">Errors:</div>
            {clarityStatus.errors.map((error, index) => (
              <div key={index} className="text-red-500 text-xs">• {error}</div>
            ))}
          </div>
        )}
        
        {clarityStatus.loaded && clarityStatus.projectId && (
          <div className="text-green-600 text-xs mt-2">
            ✅ Clarity is working correctly!
          </div>
        )}
      </div>
    </div>
  );
};

export default ClarityStatus;
