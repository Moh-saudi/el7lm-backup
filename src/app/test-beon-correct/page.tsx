'use client';

import { useState } from 'react';

export default function TestBeOnCorrectPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCorrectEndpoint = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const baseUrl = 'https://v3.api.beon.chat';
      const token = 'Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv';
      const endpoint = '/api/v3/messages/sms';
      
      console.log('🧪 اختبار الـ endpoint الصحيح:', `${baseUrl}${endpoint}`);
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'beon-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: '+201000000000',
          message: 'Test message from El7lm Platform',
          type: 'sms'
        })
      });

      const responseText = await response.text();
      
      const result = {
        endpoint: `${baseUrl}${endpoint}`,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        response: responseText,
        timestamp: new Date().toISOString()
      };
      
      console.log('📊 نتيجة الاختبار:', result);
      setResult(result);
      
    } catch (error) {
      const errorResult = {
        endpoint: 'https://v3.api.beon.chat/api/v3/messages/sms',
        status: 0,
        statusText: 'Error',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      console.error('❌ خطأ في الاختبار:', errorResult);
      setResult(errorResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          ✅ اختبار BeOn API الصحيح
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🎯 الـ Endpoint الصحيح:</h2>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm">
            <div><strong>Base URL:</strong> https://v3.api.beon.chat</div>
            <div><strong>Endpoint:</strong> /api/v3/messages/sms</div>
            <div><strong>Full URL:</strong> https://v3.api.beon.chat/api/v3/messages/sms</div>
            <div><strong>Method:</strong> POST</div>
            <div><strong>Headers:</strong> beon-token, Content-Type: application/json</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <button
            onClick={testCorrectEndpoint}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري الاختبار...' : 'اختبار الـ Endpoint الصحيح'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 النتيجة:</h2>
            <div className={`p-4 rounded border-l-4 mb-4 ${
              result.success ? 'bg-green-50 border-green-500' : 
              result.status === 404 ? 'bg-yellow-50 border-yellow-500' : 
              'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">حالة الطلب</h3>
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  result.success ? 'bg-green-100 text-green-800' : 
                  result.status === 404 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {result.status} {result.statusText}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <div><strong>الـ Endpoint:</strong> {result.endpoint}</div>
                <div><strong>الوقت:</strong> {result.timestamp}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">📋 Headers:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(result.headers, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">📄 الاستجابة:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
                  {result.response}
                </pre>
              </div>
              
              {result.error && (
                <div>
                  <h3 className="font-semibold mb-2">❌ الخطأ:</h3>
                  <pre className="bg-red-100 p-3 rounded text-sm overflow-auto">
                    {result.error}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

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
