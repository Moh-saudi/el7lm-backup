'use client';

import React, { useState } from 'react';
import { createClarityApiService } from '@/services/clarityApi';

/**
 * مكون لاختبار Clarity API
 * للتحقق من عمل API Key الجديد
 */
const ClarityApiTester: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testClarityApi = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
      const apiKey = process.env.NEXT_PUBLIC_CLARITY_API_KEY;

      if (!projectId || !apiKey) {
        throw new Error('Project ID أو API Key غير محدد');
      }

      // إنشاء خدمة Clarity API
      const clarityService = createClarityApiService({
        projectId,
        apiKey,
        baseUrl: 'https://clarity.data-exporter.com/api/v1'
      });

      // اختبار جلب البيانات
      const insights = await clarityService.getProjectLiveInsights({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      });

      setResult(insights);
      console.log('✅ Clarity API test successful:', insights);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف';
      setError(errorMessage);
      console.error('❌ Clarity API test failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">اختبار Clarity API</h3>
      
      <div className="space-y-4">
        <button
          onClick={testClarityApi}
          disabled={isLoading}
          className={`w-full px-4 py-2 rounded font-medium transition-colors ${
            isLoading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'جاري الاختبار...' : 'اختبار Clarity API'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h4 className="text-red-800 font-medium mb-2">خطأ في الاختبار:</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <h4 className="text-green-800 font-medium mb-2">نتائج الاختبار:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">الجلسات:</span> {result.sessions}
              </div>
              <div>
                <span className="font-medium">مشاهدات الصفحة:</span> {result.pageViews}
              </div>
              <div>
                <span className="font-medium">معدل الارتداد:</span> {result.bounceRate}%
              </div>
              <div>
                <span className="font-medium">مدة الجلسة:</span> {result.averageSessionDuration}s
              </div>
            </div>
            
            {result.topPages && result.topPages.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-green-800 mb-2">أهم الصفحات:</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  {result.topPages.slice(0, 3).map((page: any, index: number) => (
                    <li key={index}>
                      {page.url}: {page.views} مشاهدة
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}</p>
          <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_CLARITY_API_KEY ? 'مُعد' : 'غير مُعد'}</p>
          <p><strong>API URL:</strong> https://clarity.data-exporter.com/api/v1</p>
        </div>
      </div>
    </div>
  );
};

export default ClarityApiTester;

