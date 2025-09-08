'use client';

import { useState } from 'react';
import { debugBeOnAPI, testBeOnConnection } from '@/lib/beon/debug';

export default function DebugBeOnPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebug = () => {
    const info = debugBeOnAPI();
    setDebugInfo(info);
  };

  const runTest = async () => {
    setLoading(true);
    try {
      const result = await testBeOnConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔍 تشخيص BeOn API
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* تشخيص متغيرات البيئة */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📋 متغيرات البيئة</h2>
            <button
              onClick={runDebug}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
            >
              تشغيل التشخيص
            </button>
            
            {debugInfo && (
              <div className="space-y-2">
                <h3 className="font-medium">متغيرات البيئة:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo.envVars, null, 2)}
                </pre>
                
                <h3 className="font-medium">التكوين:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo.config, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* اختبار الاتصال */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🧪 اختبار الاتصال</h2>
            <button
              onClick={runTest}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 mb-4"
            >
              {loading ? 'جاري الاختبار...' : 'اختبار الاتصال'}
            </button>
            
            {testResult && (
              <div className="space-y-2">
                <div className={`p-3 rounded ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <strong>النتيجة:</strong> {testResult.success ? '✅ نجح' : '❌ فشل'}
                </div>
                
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">ℹ️ معلومات إضافية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>البيئة:</strong> {process.env.NODE_ENV || 'غير محدد'}
            </div>
            <div>
              <strong>الوقت:</strong> {new Date().toLocaleString('ar-EG')}
            </div>
            <div>
              <strong>المتصفح:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'}
            </div>
            <div>
              <strong>الرابط:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
