'use client';

import React, { useEffect, useState } from 'react';

interface ApplePayButtonProps {
  amount: number;
  currency: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: any) => void;
  customerEmail: string;
  customerName?: string;
  orderId: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    ApplePaySession?: any;
  }
}

export default function ApplePayButton({
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError,
  customerEmail,
  customerName,
  orderId,
  disabled = false
}: ApplePayButtonProps) {
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // التحقق من توفر Apple Pay
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ApplePaySession) {
      // التحقق من دعم الجهاز لـ Apple Pay
      const canMakePayments = window.ApplePaySession.canMakePayments();
      setIsApplePayAvailable(canMakePayments);
      
      console.log('🍎 Apple Pay availability:', canMakePayments);
    }
  }, []);

  // تحديد العملة المعروضة للمستخدم
  const getDisplayCurrency = () => {
    // Apple Pay يدعم العملات التالية للعرض
    const supportedDisplayCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'SAR', 'AED', 'QAR', 'EGP'];
    return supportedDisplayCurrencies.includes(currency) ? currency : 'USD';
  };

  // بدء جلسة Apple Pay
  const startApplePaySession = () => {
    if (typeof window === 'undefined' || !window.ApplePaySession) {
      onPaymentError({ message: 'Apple Pay غير متاح على هذا الجهاز' });
      return;
    }

    setIsProcessing(true);

    const displayCurrency = getDisplayCurrency();
    const displayAmount = currency === displayCurrency ? amount : Math.round(amount * 0.02); // تحويل تقريبي للعرض

    // تحديد كود الدولة حسب العملة
    const getCountryCode = () => {
      switch (currency) {
        case 'AED': return 'AE'; // الإمارات
        case 'SAR': return 'SA'; // السعودية
        case 'QAR': return 'QA'; // قطر
        case 'EGP': return 'EG'; // مصر
        default: return 'AE'; // افتراضي
      }
    };

    // إعداد طلب Apple Pay
    const paymentRequest = {
      countryCode: getCountryCode(),
      currencyCode: displayCurrency,
      supportedNetworks: ['visa', 'masterCard', 'amex', 'discover', 'mada', 'meeza'],
      merchantCapabilities: ['supports3DS'],
      total: {
        label: process.env.APPLE_PAY_MERCHANT_NAME || 'PayTech',
        amount: displayAmount.toString(),
        type: 'final'
      },
      lineItems: [
        {
          label: 'اشتراك المنصة',
          amount: displayAmount.toString(),
          type: 'final'
        }
      ]
    };

    console.log('🍎 Starting Apple Pay session with request:', paymentRequest);

    // إنشاء جلسة Apple Pay
    const session = new window.ApplePaySession(3, paymentRequest);

    // عند التحقق من صحة التاجر
    session.onvalidatemerchant = async (event: any) => {
      console.log('🍎 Validating merchant with Apple Pay');
      try {
        // هنا يجب استدعاء API لتحضير بيانات التحقق
        // لكن في حالة Geidea، هذا يتم تلقائياً
        session.completeMerchantValidation({
          merchantIdentifier: process.env.APPLE_PAY_MERCHANT_ID,
          domainName: process.env.APPLE_PAY_DOMAIN || (typeof window !== 'undefined' ? window.location.hostname : ''),
          displayName: process.env.APPLE_PAY_MERCHANT_NAME || 'PayTech'
        });
      } catch (error) {
        console.error('❌ Merchant validation failed:', error);
        session.abort();
        setIsProcessing(false);
        onPaymentError({ message: 'فشل في التحقق من التاجر' });
      }
    };

    // عند اختيار طريقة الدفع
    session.onpaymentmethodselected = (event: any) => {
      console.log('🍎 Payment method selected:', event.paymentMethod);
      
      const update = {
        newTotal: paymentRequest.total,
        newLineItems: paymentRequest.lineItems
      };
      
      session.completePaymentMethodSelection(update);
    };

    // عند التحقق من بيانات الشحن (إذا كان مطلوباً)
    session.onshippingcontactselected = (event: any) => {
      console.log('🍎 Shipping contact selected:', event.shippingContact);
      session.completeShippingContactSelection({
        newTotal: paymentRequest.total,
        newLineItems: paymentRequest.lineItems
      });
    };

    // عند التحقق من طريقة الشحن (إذا كان مطلوباً)
    session.onshippingmethodselected = (event: any) => {
      console.log('🍎 Shipping method selected:', event.shippingMethod);
      session.completeShippingMethodSelection({
        newTotal: paymentRequest.total,
        newLineItems: paymentRequest.lineItems
      });
    };

    // عند تفويض الدفع
    session.onpaymentauthorized = async (event: any) => {
      console.log('🍎 Payment authorized, processing...');
      
      try {
        // إرسال الدفع إلى خادمنا
        const response = await fetch('/api/geidea/apple-pay-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount, // المبلغ الحقيقي بالجنيه المصري
            currency: 'EGP', // دائماً نرسل بالجنيه المصري لـ Geidea
            orderId: orderId,
            customerEmail: customerEmail,
            customerName: customerName,
            applePayToken: event.payment.token // رمز Apple Pay
          }),
        });

        const result = await response.json();

        if (result.success) {
          console.log('✅ Apple Pay payment successful:', result);
          
          // إتمام الدفع بنجاح
          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
          
          setIsProcessing(false);
          onPaymentSuccess({
            ...result,
            paymentMethod: 'ApplePay'
          });
        } else {
          console.error('❌ Apple Pay payment failed:', result);
          
          // إتمام الدفع بفشل
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          
          setIsProcessing(false);
          onPaymentError({
            message: result.details || 'فشل في معالجة الدفع',
            details: result
          });
        }
      } catch (error) {
        console.error('💥 Error processing Apple Pay:', error);
        
        session.completePayment(window.ApplePaySession.STATUS_FAILURE);
        
        setIsProcessing(false);
        onPaymentError({
          message: 'حدث خطأ أثناء معالجة الدفع',
          details: error
        });
      }
    };

    // عند إلغاء الجلسة
    session.oncancel = () => {
      console.log('🍎 Apple Pay session cancelled');
      setIsProcessing(false);
    };

    // بدء الجلسة
    session.begin();
  };

  // عدم عرض الزر إذا كان Apple Pay غير متاح
  if (!isApplePayAvailable) {
    return null;
  }

  return (
    <button
      onClick={startApplePaySession}
      disabled={disabled || isProcessing}
      className={`w-full h-12 rounded-lg flex items-center justify-center font-medium transition-all ${
        disabled || isProcessing
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-black hover:bg-gray-800 text-white'
      }`}
      style={{
        background: disabled || isProcessing ? undefined : 'linear-gradient(135deg, #000 0%, #333 100%)',
      }}
    >
      {isProcessing ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white">جاري المعالجة...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.71 19.5C18.44 19.5 18.17 19.39 17.97 19.17C17.57 18.78 17.57 18.14 17.97 17.75L19.72 16L17.97 14.25C17.57 13.86 17.57 13.22 17.97 12.83C18.36 12.44 19 12.44 19.39 12.83L21.85 15.29C22.24 15.68 22.24 16.32 21.85 16.71L19.39 19.17C19.19 19.39 18.94 19.5 18.71 19.5Z"
              fill="white"
            />
            <path
              d="M5.29 19.5C5.06 19.5 4.81 19.39 4.61 19.17L2.15 16.71C1.76 16.32 1.76 15.68 2.15 15.29L4.61 12.83C5 12.44 5.64 12.44 6.03 12.83C6.42 13.22 6.42 13.86 6.03 14.25L4.28 16L6.03 17.75C6.42 18.14 6.42 18.78 6.03 19.17C5.83 19.39 5.56 19.5 5.29 19.5Z"
              fill="white"
            />
            <path
              d="M8.5 19.5C8.09 19.5 7.75 19.16 7.75 18.75V5.25C7.75 4.84 8.09 4.5 8.5 4.5C8.91 4.5 9.25 4.84 9.25 5.25V18.75C9.25 19.16 8.91 19.5 8.5 19.5Z"
              fill="white"
            />
            <path
              d="M15.5 19.5C15.09 19.5 14.75 19.16 14.75 18.75V5.25C14.75 4.84 15.09 4.5 15.5 4.5C15.91 4.5 16.25 4.84 16.25 5.25V18.75C16.25 19.16 15.91 19.5 15.5 19.5Z"
              fill="white"
            />
          </svg>
          <span className="text-white font-semibold">Pay</span>
        </div>
      )}
    </button>
  );
} 
