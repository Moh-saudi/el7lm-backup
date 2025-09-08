'use client';

import React from 'react';
import { useClarity } from '@/hooks/useClarity';
import ClarityEventTracker from './ClarityEventTracker';
import ClarityMasking from './ClarityMasking';

/**
 * أمثلة على استخدام Microsoft Clarity APIs
 * بناءً على الوثائق الرسمية
 */
const ClarityExamples: React.FC = () => {
  const { trackEvent, setTag, upgradeSession, setConsent, identifyUser } = useClarity();

  const handleCustomEvent = () => {
    trackEvent('custom_button_clicked');
    setTag('button_type', 'primary');
    setTag('user_action', 'engagement');
    upgradeSession('important_user_interaction');
  };

  const handleConsentToggle = (consent: boolean) => {
    setConsent(consent);
    trackEvent(consent ? 'consent_given' : 'consent_denied');
  };

  const handleUserIdentification = () => {
    identifyUser(
      'user_123',
      'session_456',
      '/dashboard',
      'أحمد محمد'
    );
    setTag('user_segment', 'premium');
    setTag('registration_date', '2024-01-15');
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Microsoft Clarity Examples</h2>
      
      {/* مثال على تتبع الأحداث */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">1. تتبع الأحداث المخصصة</h3>
        <button 
          onClick={handleCustomEvent}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          تتبع حدث مخصص
        </button>
      </div>

      {/* مثال على ClarityEventTracker */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">2. مكون تتبع الأحداث</h3>
        <ClarityEventTracker
          eventName="newsletter_signup"
          upgradeReason="high_value_action"
          customTags={{
            'form_type': 'newsletter',
            'page_section': 'footer'
          }}
        >
          <div className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer">
            اشتراك في النشرة الإخبارية
          </div>
        </ClarityEventTracker>
      </div>

      {/* مثال على إدارة الموافقة */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">3. إدارة موافقة الكوكيز</h3>
        <div className="space-x-2">
          <button 
            onClick={() => handleConsentToggle(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            قبول الكوكيز
          </button>
          <button 
            onClick={() => handleConsentToggle(false)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            رفض الكوكيز
          </button>
        </div>
      </div>

      {/* مثال على تحديد المستخدم */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">4. تحديد المستخدم</h3>
        <button 
          onClick={handleUserIdentification}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          تحديد المستخدم
        </button>
      </div>

      {/* مثال على إخفاء المحتوى */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">5. إخفاء المحتوى الحساس</h3>
        <ClarityMasking mask={true}>
          <div className="bg-gray-100 p-4 rounded">
            <p>هذا المحتوى مخفي في Clarity</p>
            <input 
              type="text" 
              placeholder="معلومات حساسة"
              className="mt-2 p-2 border rounded w-full"
            />
          </div>
        </ClarityMasking>
      </div>

      {/* مثال على إظهار المحتوى */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">6. إظهار المحتوى المهم</h3>
        <ClarityMasking unmask={true}>
          <div className="bg-blue-100 p-4 rounded">
            <h4 className="font-semibold">مراجعة المنتج</h4>
            <p>هذا المحتوى مرئي في Clarity</p>
            <p className="text-sm text-gray-600">⭐⭐⭐⭐⭐</p>
          </div>
        </ClarityMasking>
      </div>

      {/* مثال على ترقية الجلسة */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">7. ترقية الجلسة</h3>
        <ClarityEventTracker
          eventName="purchase_initiated"
          upgradeReason="high_value_conversion"
          customTags={{
            'product_category': 'electronics',
            'price_range': 'high'
          }}
        >
          <div className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 cursor-pointer">
            بدء عملية الشراء
          </div>
        </ClarityEventTracker>
      </div>
    </div>
  );
};

export default ClarityExamples;

