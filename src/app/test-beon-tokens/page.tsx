'use client';

import { useState } from 'react';

export default function TestBeOnTokensPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const tokens = [
    'yK1zYZRgjvuVC5wJcmkMwL0zFsRi9BhytEYPXgnzbNCyPFkaJBp9ngjmO6q4',
    'Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv',
    'SPb4sbemr5bwb7sjzCqTcL',
    'vSCuMzZwLjDxzR882YphwEgW'
  ];

  const testToken = async (token: string) => {
    const baseUrl = 'https://v3.api.beon.chat';
    const endpoint = '/api/v3/messages/otp';
    
    try {
      const formData = new FormData();
      formData.append('phoneNumber', '+201122652572');
      formData.append('name', 'gouda');
      formData.append('type', 'sms');
      formData.append('otp_length', '4');
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
        token: token.substring(0, 20) + '...',
        fullToken: token,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        response: responseText,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        token: token.substring(0, 20) + '...',
        fullToken: token,
        status: 0,
        statusText: 'Error',
        success: false,
        response: error.message,
        timestamp: new Date().toISOString()
      };
    }
  };

  const testAllTokens = async () => {
    setLoading(true);
    setResults([]);
    
    const testResults = [];
    for (const token of tokens) {
      const result = await testToken(token);
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
          🔑 اختبار BeOn API Tokens
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🔑 Tokens المختبرة:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            {tokens.map((token, index) => (
              <li key={index} className="font-mono">{token.substring(0, 20)}...</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🎯 الإعدادات:</h2>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm space-y-2">
            <div><strong>Base URL:</strong> https://v3.api.beon.chat</div>
            <div><strong>Endpoint:</strong> /api/v3/messages/otp</div>
            <div><strong>Method:</strong> POST</div>
            <div><strong>Content-Type:</strong> multipart/form-data</div>
            <div><strong>Phone:</strong> +201122652572</div>
            <div><strong>Name:</strong> gouda</div>
            <div><strong>Type:</strong> sms</div>
            <div><strong>OTP Length:</strong> 4</div>
            <div><strong>Language:</strong> ar</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <button
            onClick={testAllTokens}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري الاختبار...' : `اختبار ${tokens.length} Tokens`}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 النتائج:</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className={`p-4 rounded border-l-4 ${
                  result.success ? 'bg-green-50 border-green-500' : 
                  result.status === 401 ? 'bg-yellow-50 border-yellow-500' : 
                  'bg-red-50 border-red-500'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-mono font-semibold">{result.token}</h3>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      result.success ? 'bg-green-100 text-green-800' : 
                      result.status === 401 ? 'bg-yellow-100 text-yellow-800' : 
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
