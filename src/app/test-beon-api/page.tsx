'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Send, MessageSquare, Smartphone, Key, Copy, ExternalLink } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  error?: string;
  method?: string;
  timestamp: string;
  data?: any;
  phoneNumber?: string;
  responseTime?: number;
}

export default function TestBeOnAPIPage() {
  const [phoneNumber, setPhoneNumber] = useState('+201017799580');
  const [message, setMessage] = useState('اختبار رسالة من el7lm');
  const [otp, setOtp] = useState('123456');
  const [reference, setReference] = useState(`ref_${Date.now()}`);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  // قائمة بأرقام الهاتف للاختبار
  const testPhoneNumbers = [
    '+201017799580', // رقمك الأساسي
    '+201234567890', // رقم اختبار 1
    '+201098765432', // رقم اختبار 2
    '+201112223334', // رقم اختبار 3
    '+201445556667', // رقم اختبار 4
    '+201778889990', // رقم اختبار 5
    '+201001112223', // رقم اختبار 6
    '+201334445556', // رقم اختبار 7
    '+201667778889', // رقم اختبار 8
    '+201990001112'  // رقم اختبار 9
  ];

  const addResult = (result: TestResult) => {
    setResults(prev => [result, ...prev]);
    
    // طباعة النتيجة في Console
    console.log('📊 === نتيجة الاختبار ===');
    console.log('📱 الطريقة:', result.method);
    console.log('📱 رقم الهاتف:', result.phoneNumber);
    console.log('✅ النجاح:', result.success);
    console.log('📝 الرسالة:', result.message);
    if (result.error) {
      console.error('❌ الخطأ:', result.error);
    }
    if (result.responseTime) {
      console.log('⏱️ وقت الاستجابة:', result.responseTime + 'ms');
    }
    if (result.data) {
      console.log('📄 البيانات التفصيلية:', result.data);
    }
    console.log('🕐 الوقت:', result.timestamp);
    console.log('📊 ======================');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    console.log('📋 تم نسخ النص:', text);
  };

  const openWhatsAppLink = (link: string) => {
    window.open(link, '_blank');
    console.log('📱 فتح رابط WhatsApp:', link);
  };

  const testSMS = async (testPhone?: string) => {
    const startTime = Date.now();
    const phoneToTest = testPhone || phoneNumber;
    
    setLoading(true);
    try {
      console.log('📱 بدء اختبار SMS...');
      console.log('📱 رقم الهاتف:', phoneToTest);
      console.log('📱 الرسالة:', message);
      
      const response = await fetch('/api/notifications/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneToTest,
          message,
          type: 'notification'
        })
      });

      const result = await response.json();
      const responseTime = Date.now() - startTime;
      
      const testResult: TestResult = {
        success: result.success,
        message: result.success ? 'تم إرسال SMS بنجاح' : result.error,
        error: result.error,
        method: 'SMS',
        timestamp: new Date().toLocaleTimeString(),
        data: result,
        phoneNumber: phoneToTest,
        responseTime
      };
      
      addResult(testResult);
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      addResult({
        success: false,
        message: 'فشل في اختبار SMS',
        error: error.message,
        method: 'SMS',
        timestamp: new Date().toLocaleTimeString(),
        phoneNumber: phoneToTest,
        responseTime
      });
    } finally {
      setLoading(false);
    }
  };

  const testWhatsApp = async (testPhone?: string) => {
    const startTime = Date.now();
    const phoneToTest = testPhone || phoneNumber;
    
    setLoading(true);
    try {
      console.log('📱 بدء اختبار WhatsApp...');
      console.log('📱 رقم الهاتف:', phoneToTest);
      console.log('📱 الرسالة:', message);
      
      const response = await fetch('/api/notifications/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneToTest,
          message,
          type: 'notification'
        })
      });

      const result = await response.json();
      const responseTime = Date.now() - startTime;
      
      const testResult: TestResult = {
        success: result.success,
        message: result.success ? 'تم إرسال WhatsApp بنجاح' : result.error,
        error: result.error,
        method: 'WhatsApp',
        timestamp: new Date().toLocaleTimeString(),
        data: result,
        phoneNumber: phoneToTest,
        responseTime
      };
      
      addResult(testResult);
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      addResult({
        success: false,
        message: 'فشل في اختبار WhatsApp',
        error: error.message,
        method: 'WhatsApp',
        timestamp: new Date().toLocaleTimeString(),
        phoneNumber: phoneToTest,
        responseTime
      });
    } finally {
      setLoading(false);
    }
  };

  const testWhatsAppOTP = async (testPhone?: string) => {
    const startTime = Date.now();
    const phoneToTest = testPhone || phoneNumber;
    
    setLoading(true);
    try {
      console.log('📱 بدء اختبار WhatsApp OTP...');
      console.log('📱 رقم الهاتف:', phoneToTest);
      console.log('📱 Reference:', reference);
      
      const response = await fetch('/api/notifications/whatsapp/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneToTest,
          reference
        })
      });

      const result = await response.json();
      const responseTime = Date.now() - startTime;
      
      const testResult: TestResult = {
        success: result.success,
        message: result.success ? 'تم إرسال WhatsApp OTP بنجاح' : result.error,
        error: result.error,
        method: 'WhatsApp OTP',
        timestamp: new Date().toLocaleTimeString(),
        data: result,
        phoneNumber: phoneToTest,
        responseTime
      };
      
      addResult(testResult);
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      addResult({
        success: false,
        message: 'فشل في اختبار WhatsApp OTP',
        error: error.message,
        method: 'WhatsApp OTP',
        timestamp: new Date().toLocaleTimeString(),
        phoneNumber: phoneToTest,
        responseTime
      });
    } finally {
      setLoading(false);
    }
  };

  const testOTP = async (testPhone?: string) => {
    const startTime = Date.now();
    const phoneToTest = testPhone || phoneNumber;
    
    setLoading(true);
    try {
      console.log('📱 بدء اختبار OTP...');
      console.log('📱 رقم الهاتف:', phoneToTest);
      console.log('📱 OTP:', otp);
      
      const response = await fetch('/api/notifications/whatsapp/beon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneToTest,
          otp,
          name: 'Test User'
        })
      });

      const result = await response.json();
      const responseTime = Date.now() - startTime;
      
      const testResult: TestResult = {
        success: result.success,
        message: result.success ? 'تم إرسال OTP بنجاح' : result.error,
        error: result.error,
        method: 'OTP',
        timestamp: new Date().toLocaleTimeString(),
        data: result,
        phoneNumber: phoneToTest,
        responseTime
      };
      
      addResult(testResult);
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      addResult({
        success: false,
        message: 'فشل في اختبار OTP',
        error: error.message,
        method: 'OTP',
        timestamp: new Date().toLocaleTimeString(),
        phoneNumber: phoneToTest,
        responseTime
      });
    } finally {
      setLoading(false);
    }
  };

  const testAll = async () => {
    setLoading(true);
    console.log('🚀 بدء اختبار جميع الخدمات...');
    
    for (const phone of testPhoneNumbers.slice(0, 3)) { // اختبار أول 3 أرقام فقط
      console.log(`📱 اختبار الرقم: ${phone}`);
      
      await testSMS(phone);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testWhatsApp(phone);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testWhatsAppOTP(phone);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testOTP(phone);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ انتهى اختبار جميع الخدمات');
    setLoading(false);
  };

  const testAllServicesForCurrentPhone = async () => {
    setLoading(true);
    console.log('🚀 اختبار جميع الخدمات للرقم الحالي...');
    
    await testSMS();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testWhatsApp();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testWhatsAppOTP();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testOTP();
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
    console.log('🗑️ تم مسح جميع النتائج');
  };

  const exportResults = () => {
    const data = {
      results,
      exportDate: new Date().toISOString(),
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beon-test-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('📊 تم تصدير النتائج');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">اختبار BeOn API المحدث</h1>
          <p className="text-gray-300">اختبار شامل لجميع خدمات BeOn API مع الـ Token الجديد وطباعة مفصلة للنتائج</p>
        </div>

        {/* Configuration Info */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              معلومات التكوين المحدث
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>SMS Token:</span>
              <span className="font-mono">SPb4sgedfe</span>
            </div>
            <div className="flex justify-between">
              <span>Template Token:</span>
              <span className="font-mono">SPb4sbemr5bwb7sjzCqTcL</span>
            </div>
            <div className="flex justify-between">
              <span>Bulk Token:</span>
              <span className="font-mono">nzQ7ytW8q6yfQdJRFM57yRfR</span>
            </div>
            <div className="flex justify-between">
              <span>WhatsApp OTP Token (جديد):</span>
              <span className="font-mono text-green-400">vSCuMzZwLjDxzR882YphwEgW</span>
            </div>
            <div className="flex justify-between">
              <span>Base URL:</span>
              <span className="font-mono">https://beon.chat/api</span>
            </div>
            <div className="flex justify-between">
              <span>Callback URL:</span>
              <span className="font-mono">http://www.el7lm.com/beon/</span>
            </div>
          </CardContent>
        </Card>

        {/* Test Form */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle>بيانات الاختبار</CardTitle>
            <CardDescription>أدخل البيانات المطلوبة لاختبار الخدمات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-white">رقم الهاتف</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+201017799580"
                className="bg-white/20 border-white/30 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="message" className="text-white">الرسالة</Label>
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="رسالة الاختبار"
                className="bg-white/20 border-white/30 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="otp" className="text-white">رمز التحقق (OTP)</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="bg-white/20 border-white/30 text-white"
              />
            </div>

            <div>
              <Label htmlFor="reference" className="text-white">Reference (لـ WhatsApp OTP)</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="ref_123456"
                className="bg-white/20 border-white/30 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Phone Numbers */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle>أرقام الهاتف السريعة للاختبار</CardTitle>
            <CardDescription>اختر رقم هاتف سريع للاختبار</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {testPhoneNumbers.map((phone, index) => (
                <Button
                  key={index}
                  size="sm"
                  onClick={() => setPhoneNumber(phone)}
                  className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300"
                >
                  {phone}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Button
            onClick={() => testSMS()}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
            اختبار SMS
          </Button>
          
          <Button
            onClick={() => testWhatsApp()}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
            اختبار WhatsApp
          </Button>
          
          <Button
            onClick={() => testWhatsAppOTP()}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            اختبار WhatsApp OTP
          </Button>
          
          <Button
            onClick={() => testOTP()}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            اختبار OTP
          </Button>
          
          <Button
            onClick={testAllServicesForCurrentPhone}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            اختبار الكل (رقم واحد)
          </Button>
          
          <Button
            onClick={testAll}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            اختبار شامل
          </Button>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>ملخص النتائج</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={exportResults}
                    size="sm"
                    className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    تصدير النتائج
                  </Button>
                  <Button
                    onClick={clearResults}
                    size="sm"
                    className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300"
                  >
                    مسح النتائج
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-500/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{results.length}</div>
                  <div className="text-sm">إجمالي الاختبارات</div>
                </div>
                <div className="bg-green-500/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{results.filter(r => r.success).length}</div>
                  <div className="text-sm">نجح</div>
                </div>
                <div className="bg-red-500/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{results.filter(r => !r.success).length}</div>
                  <div className="text-sm">فشل</div>
                </div>
                <div className="bg-purple-500/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {results.length > 0 
                      ? Math.round(results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length)
                      : 0
                    }ms
                  </div>
                  <div className="text-sm">متوسط وقت الاستجابة</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>نتائج الاختبار</CardTitle>
              <div className="text-sm text-gray-400">
                {results.length} نتيجة
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-gray-400 text-center py-8">لا توجد نتائج اختبار بعد</p>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <Alert
                    key={index}
                    className={`border ${
                      result.success 
                        ? 'border-green-500/30 bg-green-500/10' 
                        : 'border-red-500/30 bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-white">{result.message}</p>
                              {result.responseTime && (
                                <span className="text-xs bg-white/20 px-2 py-1 rounded">
                                  {result.responseTime}ms
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-300 mb-2">
                              <span className="font-medium">الطريقة:</span> {result.method} | 
                              <span className="font-medium"> الرقم:</span> {result.phoneNumber}
                            </div>
                            {result.error && (
                              <p className="text-sm text-red-300 mb-2">{result.error}</p>
                            )}
                            {result.data && (
                              <div className="text-sm text-gray-300">
                                <details>
                                  <summary className="cursor-pointer flex items-center gap-2">
                                    عرض البيانات التفصيلية
                                    <Copy 
                                      className="w-3 h-3 cursor-pointer" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(JSON.stringify(result.data, null, 2));
                                      }}
                                    />
                                    {result.data.link && (
                                      <ExternalLink 
                                        className="w-3 h-3 cursor-pointer" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openWhatsAppLink(result.data.link);
                                        }}
                                      />
                                    )}
                                  </summary>
                                  <pre className="mt-2 text-xs bg-black/20 p-2 rounded overflow-auto">
                                    {JSON.stringify(result.data, null, 2)}
                                  </pre>
                                </details>
                              </div>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-400">
                            <div>{result.timestamp}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
