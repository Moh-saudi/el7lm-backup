'use client';

import React from 'react';
import { useClarity } from '@/hooks/useClarity';
import ClarityEventTracker from '@/components/analytics/ClarityEventTracker';
import ClarityMasking from '@/components/analytics/ClarityMasking';
import ClarityApiTester from '@/components/analytics/ClarityApiTester';

/**
 * صفحة اختبار Microsoft Clarity
 * للتحقق من عمل جميع الميزات
 */
export default function TestClarityPage() {
  const { trackEvent, setTag, upgradeSession, setConsent, identifyUser } = useClarity();

  const handleTestEvent = () => {
    trackEvent('test_button_clicked');
    setTag('test_type', 'manual_test');
    upgradeSession('testing_clarity_features');
    console.log('✅ Test event sent to Clarity');
  };

  const handleTestConsent = () => {
    setConsent(true);
    trackEvent('consent_test');
    console.log('✅ Consent test sent to Clarity');
  };

  const handleTestUserIdentification = () => {
    identifyUser(
      'test_user_123',
      'test_session_456',
      '/test-clarity',
      'مستخدم الاختبار'
    );
    setTag('user_type', 'test_user');
    setTag('test_environment', 'development');
    console.log('✅ User identification test sent to Clarity');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          اختبار Microsoft Clarity
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">معلومات المشروع</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project ID:</label>
              <p className="text-sm text-gray-900 bg-gray-100 p-2 rounded">
                {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'غير محدد'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">API Key:</label>
              <p className="text-sm text-gray-900 bg-gray-100 p-2 rounded">
                {process.env.NEXT_PUBLIC_CLARITY_API_KEY ? 
                  `${process.env.NEXT_PUBLIC_CLARITY_API_KEY.substring(0, 20)}...` : 
                  'غير محدد'
                }
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">الحالة:</label>
              <p className="text-sm text-green-600 font-medium">
                {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && process.env.NEXT_PUBLIC_CLARITY_API_KEY ? 
                  'مُعد بالكامل' : 'غير مُعد'
                }
              </p>
            </div>
          </div>
        </div>

        {/* اختبار Clarity API */}
        <div className="mb-6">
          <ClarityApiTester />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* اختبار الأحداث */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">اختبار الأحداث</h3>
            <div className="space-y-3">
              <button
                onClick={handleTestEvent}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                إرسال حدث اختبار
              </button>
              
              <ClarityEventTracker
                eventName="component_test_event"
                upgradeReason="component_testing"
                customTags={{
                  'component_type': 'event_tracker',
                  'test_category': 'automated'
                }}
              >
                <div className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors cursor-pointer text-center">
                  اختبار مكون تتبع الأحداث
                </div>
              </ClarityEventTracker>
            </div>
          </div>

          {/* اختبار الموافقة */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">اختبار الموافقة</h3>
            <div className="space-y-3">
              <button
                onClick={handleTestConsent}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
              >
                اختبار موافقة الكوكيز
              </button>
            </div>
          </div>

          {/* اختبار تحديد المستخدم */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">اختبار تحديد المستخدم</h3>
            <div className="space-y-3">
              <button
                onClick={handleTestUserIdentification}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
              >
                اختبار تحديد المستخدم
              </button>
            </div>
          </div>

          {/* اختبار إخفاء المحتوى */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">اختبار إخفاء المحتوى</h3>
            <div className="space-y-3">
              <ClarityMasking mask={true}>
                <div className="bg-red-100 border border-red-300 rounded p-3">
                  <p className="text-red-800 text-sm">هذا المحتوى مخفي في Clarity</p>
                  <input 
                    type="text" 
                    placeholder="معلومات حساسة"
                    className="mt-2 w-full p-2 border border-red-300 rounded text-sm"
                  />
                </div>
              </ClarityMasking>
              
              <ClarityMasking unmask={true}>
                <div className="bg-green-100 border border-green-300 rounded p-3">
                  <p className="text-green-800 text-sm">هذا المحتوى مرئي في Clarity</p>
                  <p className="text-green-600 text-xs">⭐⭐⭐⭐⭐</p>
                </div>
              </ClarityMasking>
            </div>
          </div>
        </div>

        {/* تعليمات التحقق */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            كيفية التحقق من عمل Clarity
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>افتح Developer Tools (F12)</li>
            <li>اذهب إلى تبويب Console</li>
            <li>ابحث عن رسائل "✅ Microsoft Clarity loaded successfully"</li>
            <li>اضغط على الأزرار أعلاه وابحث عن رسائل "📊 Clarity event tracked"</li>
            <li>تحقق من وجود مكون ClarityStatus في أسفل يسار الصفحة</li>
            <li>انتظر ساعتين ثم تحقق من Clarity Dashboard</li>
          </ol>
        </div>

        {/* معلومات إضافية */}
        <div className="bg-gray-100 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            معلومات إضافية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <strong>Project ID:</strong> t69agqt6n4
            </div>
            <div>
              <strong>Platform:</strong> el7lm
            </div>
            <div>
              <strong>Environment:</strong> {process.env.NODE_ENV}
            </div>
            <div>
              <strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
