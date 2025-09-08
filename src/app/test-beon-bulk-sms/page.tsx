'use client';

import { useState } from 'react';

export default function TestBeOnBulkSMSPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const endpoints = [
    '/api/v3/messages/sms',
    '/api/v3/messages/sms/bulk',
    '/api/v3/messages/send',
    '/api/v3/send/sms',
    '/api/send/sms',
    '/api/messages/sms',
    '/messages/sms',
    '/sms/send',
    '/send/sms'
  ];

  const testEndpoint = async (endpoint: string) => {
    const baseUrl = 'https://v3.api.beon.chat';
    const token = 'Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv';
    
    try {
      const formData = new FormData();
      formData.append('phoneNumber', '+201122652572');
      formData.append('message', 'رسالة تجريبية من منصة الحلم - هذا اختبار للـ Bulk SMS');
      formData.append('type', 'sms');
      formData.append('lang', 'ar');
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'beon-token': token
        },
        body: formData
      });

      const responseText = await response.text();
      
      return {
        endpoint: `${baseUrl}${endpoint}`,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        response: responseText.substring(0, 300) + (responseText.length > 300 ? '...' : ''),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        endpoint: `${baseUrl}${endpoint}`,
        status: 0,
        statusText: 'Error',
        success: false,
        response: error.message,
        timestamp: new Date().toISOString()
      };
    }
  };

  const testAllEndpoints = async () => {
    setLoading(true);
    setResults([]);
    
    const testResults = [];
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint);
      testResults.push(result);
      setResults([...testResults]);
      await new Promise(resolve => setTimeout(resolve, 1000)); // تأخير بين الاختبارات
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          📱 اختبار BeOn API للـ Bulk SMS
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📋 Endpoints المختبرة للـ Bulk SMS:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            {endpoints.map((endpoint, index) => (
              <li key={index} className="font-mono">{endpoint}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🎯 الإعدادات:</h2>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm space-y-2">
            <div><strong>Base URL:</strong> https://v3.api.beon.chat</div>
            <div><strong>Method:</strong> POST</div>
            <div><strong>Content-Type:</strong> multipart/form-data</div>
            <div><strong>Token:</strong> Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv</div>
            <div><strong>Phone:</strong> +201122652572</div>
            <div><strong>Message:</strong> رسالة تجريبية من منصة الحلم</div>
            <div><strong>Type:</strong> sms</div>
            <div><strong>Language:</strong> ar</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <button
            onClick={testAllEndpoints}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري الاختبار...' : `اختبار ${endpoints.length} Endpoints للـ Bulk SMS`}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 النتائج:</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className={`p-4 rounded border-l-4 ${
                  result.success ? 'bg-green-50 border-green-500' : 
                  result.status === 404 ? 'bg-yellow-50 border-yellow-500' : 
                  'bg-red-50 border-red-500'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-mono font-semibold text-sm">{result.endpoint}</h3>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      result.success ? 'bg-green-100 text-green-800' : 
                      result.status === 404 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.status} {result.statusText}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div><strong>الاستجابة:</strong> {result.response}</div>
                    <div><strong>الوقت:</strong> {result.timestamp}</div>
                  </div>
                </div>
              ))}
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
