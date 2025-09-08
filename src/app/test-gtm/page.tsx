'use client';

import React from 'react';
import { useGTM } from '@/hooks/useGTM';

/**
 * صفحة اختبار Google Tag Manager
 * للتحقق من عمل جميع الميزات
 */
export default function TestGTMPage() {
  const { 
    trackEvent, 
    trackPurchase, 
    trackCustomEvent, 
    setUserProperties, 
    trackFormSubmission, 
    trackButtonClick 
  } = useGTM();

  const handleTestEvent = () => {
    trackEvent('test_event', {
      event_category: 'testing',
      event_label: 'gtm_test',
      value: 1
    });
    console.log('✅ GTM: Test event sent');
  };

  const handleTestPurchase = () => {
    trackPurchase({
      transaction_id: 'test_transaction_123',
      value: 99.99,
      currency: 'SAR',
      items: [
        {
          item_id: 'product_1',
          item_name: 'Test Product',
          category: 'Electronics',
          quantity: 1,
          price: 99.99
        }
      ]
    });
    console.log('✅ GTM: Purchase event sent');
  };

  const handleTestCustomEvent = () => {
    trackCustomEvent('custom_interaction', {
      interaction_type: 'button_click',
      page_section: 'test_page',
      user_action: 'engagement'
    });
    console.log('✅ GTM: Custom event sent');
  };

  const handleTestUserProperties = () => {
    setUserProperties({
      user_id: 'test_user_123',
      user_type: 'premium',
      user_name: 'مستخدم الاختبار',
      organization: 'El7lm',
      account_status: 'active'
    });
    console.log('✅ GTM: User properties sent');
  };

  const handleTestFormSubmission = () => {
    trackFormSubmission({
      form_name: 'test_form',
      form_type: 'contact',
      success: true
    });
    console.log('✅ GTM: Form submission tracked');
  };

  const handleTestButtonClick = () => {
    trackButtonClick({
      button_name: 'test_button',
      button_location: 'test_page',
      button_type: 'primary',
      page_path: '/test-gtm'
    });
    console.log('✅ GTM: Button click tracked');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          اختبار Google Tag Manager
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">معلومات GTM</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">GTM ID:</label>
              <p className="text-sm text-gray-900 bg-gray-100 p-2 rounded">
                {process.env.NEXT_PUBLIC_GTM_ID || 'غير محدد'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">الحالة:</label>
              <p className="text-sm text-green-600 font-medium">
                {process.env.NEXT_PUBLIC_GTM_ID ? 'مُعد' : 'غير مُعد'}
              </p>
            </div>
          </div>
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
              
              <button
                onClick={handleTestCustomEvent}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                إرسال حدث مخصص
              </button>
            </div>
          </div>

          {/* اختبار الشراء */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">اختبار الشراء</h3>
            <div className="space-y-3">
              <button
                onClick={handleTestPurchase}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
              >
                تتبع عملية شراء
              </button>
            </div>
          </div>

          {/* اختبار خصائص المستخدم */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">خصائص المستخدم</h3>
            <div className="space-y-3">
              <button
                onClick={handleTestUserProperties}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
              >
                تعيين خصائص المستخدم
              </button>
            </div>
          </div>

          {/* اختبار النماذج */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">تتبع النماذج</h3>
            <div className="space-y-3">
              <button
                onClick={handleTestFormSubmission}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                تتبع إرسال نموذج
              </button>
            </div>
          </div>

          {/* اختبار النقرات */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">تتبع النقرات</h3>
            <div className="space-y-3">
              <button
                onClick={handleTestButtonClick}
                className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
              >
                تتبع نقر زر
              </button>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">معلومات إضافية</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>GTM ID:</strong> GTM-WR4X2BD8</p>
              <p><strong>DataLayer:</strong> window.dataLayer</p>
              <p><strong>Preview Mode:</strong> متاح في GTM</p>
              <p><strong>Debug Mode:</strong> متاح في المتصفح</p>
            </div>
          </div>
        </div>

        {/* تعليمات التحقق */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            كيفية التحقق من عمل GTM
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>افتح Developer Tools (F12)</li>
            <li>اذهب إلى تبويب Console</li>
            <li>ابحث عن رسائل "📊 GTM: Data pushed to dataLayer"</li>
            <li>اضغط على الأزرار أعلاه وابحث عن رسائل "✅ GTM:"</li>
            <li>تحقق من وجود window.dataLayer في Console</li>
            <li>استخدم GTM Preview Mode للتحقق من الأحداث</li>
            <li>تحقق من Google Analytics للبيانات</li>
          </ol>
        </div>

        {/* معلومات DataLayer */}
        <div className="bg-gray-100 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            معلومات DataLayer
          </h3>
          <div className="bg-gray-800 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
            <div>// فحص DataLayer في Console:</div>
            <div>console.log(window.dataLayer);</div>
            <div className="mt-2">// أحداث متاحة:</div>
            <div>• user_login - تسجيل دخول المستخدم</div>
            <div>• page_view - عرض الصفحة</div>
            <div>• test_event - حدث اختبار</div>
            <div>• purchase - عملية شراء</div>
            <div>• custom_interaction - تفاعل مخصص</div>
            <div>• form_submit - إرسال نموذج</div>
            <div>• button_click - نقر زر</div>
          </div>
        </div>
      </div>
    </div>
  );
}

