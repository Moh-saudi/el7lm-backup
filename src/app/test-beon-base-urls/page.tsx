'use client';

import { useState } from 'react';

export default function TestBeOnBaseUrlsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const baseUrls = [
    'https://v3.api.beon.chat',
    'https://api.beon.chat',
    'https://beon.chat/api',
    'https://api.beon.chat/v3',
    'https://v3.beon.chat/api'
  ];

  const endpoints = [
    '/api/v3/messages/sms',
    '/api/messages/sms',
    '/messages/sms',
    '/sms',
    '/api/sms'
  ];

  const testBaseUrl = async (baseUrl: string, endpoint: string) => {
    const token = 'Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv';
    const fullUrl = `${baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(fullUrl, {
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
      
      return {
        baseUrl,
        endpoint,
        fullUrl,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        response: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''),
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      return {
        baseUrl,
        endpoint,
        fullUrl,
        status: 0,
        statusText: 'Error',
        success: false,
        response: error.message,
        headers: {}
      };
    }
  };

  const testAllCombinations = async () => {
    setLoading(true);
    setResults([]);
    
    const testResults = [];
    for (const baseUrl of baseUrls) {
      for (const endpoint of endpoints) {
        const result = await testBaseUrl(baseUrl, endpoint);
        testResults.push(result);
        setResults([...testResults]);
        await new Promise(resolve => setTimeout(resolve, 500)); // تأخير بين الاختبارات
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔍 اختبار جميع Base URLs و Endpoints
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📋 Base URLs المختبرة:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            {baseUrls.map((url, index) => (
              <li key={index} className="font-mono">{url}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📋 Endpoints المختبرة:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            {endpoints.map((endpoint, index) => (
              <li key={index} className="font-mono">{endpoint}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <button
            onClick={testAllCombinations}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري الاختبار...' : `اختبار ${baseUrls.length * endpoints.length} تركيبة`}
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
                    <h3 className="font-mono font-semibold text-sm">{result.fullUrl}</h3>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      result.success ? 'bg-green-100 text-green-800' : 
                      result.status === 404 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.status} {result.statusText}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div><strong>Base URL:</strong> {result.baseUrl}</div>
                    <div><strong>Endpoint:</strong> {result.endpoint}</div>
                    <div><strong>الاستجابة:</strong> {result.response}</div>
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
