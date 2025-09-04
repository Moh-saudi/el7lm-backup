'use client';

import React, { useState, useEffect } from 'react';
import { handleGeideaError, analyzeGeideaError } from '@/lib/geidea-error-handler';

declare global {
  interface Window {
    GeideaCheckout: any;
  }
}

interface GeideaPaymentModalProps {
  visible: boolean;
  onRequestClose: () => void;
  onPaymentSuccess: (data: any) => void;
  onPaymentFailure: (error: any) => void;
  amount: number;
  currency: string;
  title?: string;
  description?: string;
  callbackUrl?: string;
  returnUrl?: string;
  customerEmail: string;
  merchantReferenceId?: string;
}

interface PaymentModalState {
  loading: boolean;
  error: string | null;
  isTestMode: boolean;
  sessionCreated: boolean;
}

export default function GeideaPaymentModal({
  visible,
  onRequestClose,
  onPaymentSuccess,
  onPaymentFailure,
  amount,
  currency,
  title = "الدفع الإلكتروني",
  description = "أكمل عملية الدفع عبر البطاقة الإلكترونية",
  callbackUrl,
  returnUrl,
  customerEmail,
  merchantReferenceId
}: GeideaPaymentModalProps) {
  const [state, setState] = useState<PaymentModalState>({
    loading: false,
    error: null,
    isTestMode: false,
    sessionCreated: false
  });

  // التحقق من وجود جلسة دفع سابقة عند فتح المودال
  useEffect(() => {
    if (visible) {
      // حذف أي بيانات دفع سابقة عند فتح المودال
      localStorage.removeItem('geidea_session_id');
      localStorage.removeItem('geidea_payment_data');
      localStorage.removeItem('geidea_payment_url');
      
      // إعادة تعيين الحالة
      setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
    }
  }, [visible]);

  // معالجة الضغط على ESC لإغلاق المودال
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        // حذف بيانات الدفع عند الضغط على ESC
        localStorage.removeItem('geidea_session_id');
        localStorage.removeItem('geidea_payment_data');
        localStorage.removeItem('geidea_payment_url');
        setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
        onRequestClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onRequestClose]);

  // معالجة إغلاق الصفحة أو تغيير التبويب
  useEffect(() => {
    const handleBeforeUnload = () => {
      // حذف بيانات الدفع عند إغلاق الصفحة
      localStorage.removeItem('geidea_session_id');
      localStorage.removeItem('geidea_payment_data');
      localStorage.removeItem('geidea_payment_url');
    };

    const handleVisibilityChange = () => {
      if (document.hidden && visible) {
        // حذف بيانات الدفع عند تغيير التبويب
        localStorage.removeItem('geidea_session_id');
        localStorage.removeItem('geidea_payment_data');
        localStorage.removeItem('geidea_payment_url');
        setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
        onRequestClose();
      }
    };

    if (visible) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    }, [visible, onRequestClose]);

  // معالجة إغلاق المودال
  useEffect(() => {
    if (!visible) {
      // حذف بيانات الدفع عند إغلاق المودال
      localStorage.removeItem('geidea_session_id');
      localStorage.removeItem('geidea_payment_data');
      localStorage.removeItem('geidea_payment_url');
      setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
    }
  }, [visible]);
  
  // تعريف callback functions لـ Geidea Checkout حسب الوثائق الرسمية
  const onSuccess = (response: any) => {
    console.log('✅ [Geidea] Payment successful:', response);
    
    // حذف بيانات الدفع عند النجاح
    localStorage.removeItem('geidea_session_id');
    localStorage.removeItem('geidea_payment_data');
    localStorage.removeItem('geidea_payment_url');
    setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
    
    // حفظ بيانات النجاح
    const successData = {
      ...response,
      status: 'success',
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem('geidea_payment_success', JSON.stringify(successData));
    
    // إغلاق المودال
    onRequestClose();
    
    // إغلاق المودال
    onRequestClose();
    
    // توجيه المستخدم لصفحة حالة الاشتراك
    setTimeout(() => {
      window.location.href = '/dashboard/player/subscription-status';
    }, 1000);
    
    onPaymentSuccess(response);
  };

  const onError = (error: any) => {
    console.log('❌ [Geidea] Payment failed:', error);
    
    // حذف بيانات الدفع عند الفشل
    localStorage.removeItem('geidea_session_id');
    localStorage.removeItem('geidea_payment_data');
    localStorage.removeItem('geidea_payment_url');
    setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
    
    // حفظ بيانات الفشل
    const errorData = {
      ...error,
      status: 'failed',
      failedAt: new Date().toISOString()
    };
    
    localStorage.setItem('geidea_payment_error', JSON.stringify(errorData));
    
    // إغلاق المودال
    onRequestClose();
    
    onPaymentFailure(error);
    
    // إغلاق المودال
    onRequestClose();
  };

  const onCancel = (response: any) => {
    console.log('🚫 [Geidea] Payment cancelled:', response);
    
    // حذف بيانات الدفع عند الإلغاء
    localStorage.removeItem('geidea_session_id');
    localStorage.removeItem('geidea_payment_data');
    localStorage.removeItem('geidea_payment_url');
    setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
    
    // حفظ بيانات الإلغاء
    const cancelData = {
      ...response,
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    };
    
    localStorage.setItem('geidea_payment_cancelled', JSON.stringify(cancelData));
    
    // إغلاق المودال
    onRequestClose();
    
    onRequestClose();
  };

  // تحميل مكتبة Geidea وإنشاء جلسة الدفع عند فتح المودال
  useEffect(() => {
    if (visible) {
      // حذف بيانات الدفع القديمة عند فتح المودال
      localStorage.removeItem('geidea_session_id');
      localStorage.removeItem('geidea_payment_data');
      localStorage.removeItem('geidea_payment_url');
      
      loadGeideaScript()
        .then(() => {
          createPaymentSession();
        })
        .catch((error) => {
          console.error('❌ Failed to load Geidea:', error);
          
          // استخدام معالج الأخطاء المحسن
          const analyzedError = analyzeGeideaError(error);
          setState({ 
            loading: false, 
            error: analyzedError.message,
            isTestMode: false 
          });
          
          // تسجيل الخطأ للتتبع
          handleGeideaError(error, 'loadGeideaScript');
        });
    }
  }, [visible]);

  // تحميل مكتبة Geidea ديناميكياً
  const loadGeideaScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // التحقق من وجود المكتبة مسبقاً
      if (typeof window !== 'undefined' && window.GeideaCheckout) {
        console.log('✅ Geidea script already loaded');
        resolve();
        return;
      }

      // التحقق من وجود script tag مسبقاً
      const existingScript = document.querySelector('script[src*="geideaCheckout.min.js"]');
      if (existingScript) {
        console.log('✅ Geidea script tag exists, waiting for load...');
        // إذا كان الـ script موجود ولكن المكتبة غير متاحة، انتظر قليلاً
        const checkInterval = setInterval(() => {
          if (typeof window !== 'undefined' && window.GeideaCheckout) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        // timeout بعد 10 ثوانٍ
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Timeout waiting for Geidea script'));
        }, 10000);
        return;
      }

      // إنشاء script tag وتحميل المكتبة حسب الوثائق الرسمية
      console.log('📥 Loading Geidea script dynamically...');
      console.log('🔍 Current CSP check - attempting to load:', 'https://www.merchant.geidea.net/hpp/geideaCheckout.min.js');
      
      const script = document.createElement('script');
      // استخدام الرابط الصحيح حسب الوثائق الرسمية - بيئة مصر
      script.src = 'https://www.merchant.geidea.net/hpp/geideaCheckout.min.js';
      script.async = true;
      script.id = 'geidea-checkout-dynamic';
      script.crossOrigin = 'anonymous'; // إضافة crossOrigin للأمان
      
      // إضافة معالجة أخطاء محسنة
      script.onload = () => {
        console.log('✅ Geidea script loaded successfully');
        
        // التحقق من تحميل المكتبة بشكل صحيح
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.GeideaCheckout) {
            console.log('✅ Geidea library available after script load');
            resolve();
          } else {
            console.error('❌ Geidea library not available after script load');
            reject(new Error('Geidea library not available after script load'));
          }
        }, 500);
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to load Geidea script:', error);
        console.error('🔍 CSP Error Details:', {
          error: error,
          scriptSrc: script.src,
          currentUrl: window.location.href,
          userAgent: navigator.userAgent
        });
        // إزالة الـ script الفاشل
        script.remove();
        reject(new Error('Failed to load Geidea payment library - CSP may be blocking the script'));
      };

      // إضافة event listener إضافي للتحقق من الأخطاء
      script.addEventListener('error', (event) => {
        console.error('🔍 Additional script error event:', event);
      });

      document.head.appendChild(script);
    });
  };

  const createPaymentSession = async () => {
    setState({ loading: true, error: null, isTestMode: false });

    try {
      const orderId = merchantReferenceId || `EL7LM_${Date.now()}`;
      const payload = {
        amount: amount,
        currency: currency,
        orderId: orderId,
        customerEmail: customerEmail,
        customerName: 'Customer'
      };
      console.log('🚀 [Geidea] Sending payment payload:', payload);
      
      const response = await fetch('/api/geidea/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('🌍 [Geidea] API response:', data);

      // معالجة نجاح الدفع
      if (data.success && data.sessionId) {
        console.log('✅ [Geidea] Payment session created successfully:', data);
        
        // حفظ بيانات الدفع في localStorage للاستخدام لاحقاً
        const paymentData = {
          sessionId: data.sessionId,
          orderId: data.merchantReferenceId,
          amount: amount,
          currency: currency,
          timestamp: new Date().toISOString(),
          status: 'pending'
        };
        
        localStorage.setItem('geidea_payment_data', JSON.stringify(paymentData));
        
        // تحديث الحالة لنجاح إنشاء الجلسة
        setState({ loading: false, error: null, isTestMode: false, sessionCreated: true });
        
        // إضافة رسالة تأكيد للمستخدم
        console.log('🎉 [Geidea] Payment session created successfully!');
        console.log('📋 [Geidea] Session ID:', data.sessionId);
        const computedRedirectUrl = (data as any)?.redirectUrl || (data as any)?.fullResponse?.session?.redirectUrl || `https://pay.geidea.net/pay/${data.sessionId}`;
        console.log('🔗 [Geidea] Payment URL:', computedRedirectUrl);
        
        // إضافة زر يدوي لفتح صفحة الدفع
        const openPaymentPage = () => {
          const stored = localStorage.getItem('geidea_payment_url');
          const url = stored || computedRedirectUrl;
          window.open(url, '_blank', 'noopener,noreferrer');
        };
        
        // إضافة زر في الصفحة لفتح صفحة الدفع
        const paymentButton = document.createElement('button');
        paymentButton.innerHTML = '💳 فتح صفحة الدفع';
        paymentButton.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          background: #3B82F6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        `;
        paymentButton.onclick = openPaymentPage;
        document.body.appendChild(paymentButton);
        
        // إزالة الزر بعد 30 ثانية
        setTimeout(() => {
          if (document.body.contains(paymentButton)) {
            document.body.removeChild(paymentButton);
          }
        }, 30000);
        
        // إغلاق المودال فوراً بعد إضافة الزر
        onRequestClose();
        
        // تحديث الحالة لنجاح إنشاء الجلسة
        setState({ loading: false, error: null, isTestMode: false, sessionCreated: true });
        
        // استخدام GeideaCheckout library حسب الوثائق الرسمية
        if (data.sessionId) {
          console.log('🌍 [Geidea] Using GeideaCheckout library for popup mode');
          console.log('🔗 Session ID:', data.sessionId);
          
          // حفظ session ID في localStorage
          localStorage.setItem('geidea_session_id', data.sessionId);
          
          // التحقق من وجود GeideaCheckout library
          if (typeof window !== 'undefined' && window.GeideaCheckout) {
            console.log('✅ [Geidea] GeideaCheckout library available, starting payment...');
            
            try {
              // إنشاء instance من GeideaCheckout حسب الوثائق الرسمية
              const payment = new window.GeideaCheckout(onSuccess, onError, onCancel);
              
              // بدء الدفع باستخدام Popup Mode (Modal Overlay)
              payment.startPayment(data.sessionId);
              
              console.log('✅ [Geidea] Payment started successfully with GeideaCheckout');
              
              // إغلاق المودال بعد بدء الدفع
              onRequestClose();
              
            } catch (error) {
              console.error('❌ [Geidea] Error starting payment with GeideaCheckout:', error);
              
              // Fallback: استخدام window.open إذا فشل GeideaCheckout
              console.log('🔄 [Geidea] Falling back to window.open method...');
              const redirectUrl = `https://www.merchant.geidea.net/hpp/checkout/?${data.sessionId}`;
              
              try {
                const paymentWindow = window.open(redirectUrl, '_blank', 'noopener,noreferrer,width=800,height=600,scrollbars=yes,resizable=yes');
                
                if (paymentWindow && !paymentWindow.closed) {
                  console.log('✅ [Geidea] Payment window opened successfully (fallback)');
                  onRequestClose();
                } else {
                  console.log('⚠️ [Geidea] Popup blocked, trying direct redirect (fallback)');
                  window.location.href = redirectUrl;
                }
              } catch (fallbackError) {
                console.error('❌ [Geidea] Fallback method also failed:', fallbackError);
                window.location.href = redirectUrl;
              }
            }
          } else {
            console.log('⚠️ [Geidea] GeideaCheckout library not available, using window.open fallback');
            
            // Fallback: استخدام window.open
            const redirectUrl = `https://www.merchant.geidea.net/hpp/checkout/?${data.sessionId}`;
            
            try {
              const paymentWindow = window.open(redirectUrl, '_blank', 'noopener,noreferrer,width=800,height=600,scrollbars=yes,resizable=yes');
              
              if (paymentWindow && !paymentWindow.closed) {
                console.log('✅ [Geidea] Payment window opened successfully (fallback)');
                
                // مراقبة إغلاق النافذة
                const checkClosed = setInterval(() => {
                  if (paymentWindow && !paymentWindow.closed) {
                    // النافذة لا تزال مفتوحة
                    return;
                  }
                  
                  console.log('🔒 [Geidea] Payment window closed');
                  clearInterval(checkClosed);
                  
                  // حذف بيانات الدفع عند إغلاق نافذة الدفع
                  localStorage.removeItem('geidea_session_id');
                  localStorage.removeItem('geidea_payment_data');
                  localStorage.removeItem('geidea_payment_url');
                  setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
                  onRequestClose();
                }, 1000);
                
                onRequestClose();
              } else {
                console.log('⚠️ [Geidea] Popup blocked, trying direct redirect (fallback)');
                window.location.href = redirectUrl;
              }
            } catch (error) {
              console.error('❌ [Geidea] Fallback method failed:', error);
              window.location.href = redirectUrl;
            }
          }
        }
      } else {
        throw new Error(data.message || 'فشل في إنشاء جلسة الدفع');
      }
    } catch (error) {
      console.error('❌ [Geidea] Payment session creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      setState({ loading: false, error: errorMessage, isTestMode: false });
      onPaymentFailure(error);
    }
  };

  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={() => {
        // حذف بيانات الدفع عند النقر خارج المودال
        localStorage.removeItem('geidea_session_id');
        localStorage.removeItem('geidea_payment_data');
        localStorage.removeItem('geidea_payment_url');
        setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
        onRequestClose();
      }}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {/* Content */}
        <div className="text-center">
          {state.loading ? (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 mb-4">جاري تجهيز صفحة الدفع...</p>
              <p className="text-xs text-gray-500">سيتم توجيهك لصفحة الدفع الآمنة خلال لحظات</p>
            </div>
          ) : state.error ? (
            <div>
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في الدفع</h3>
              <p className="text-gray-600 mb-4 text-sm">{state.error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    // حذف بيانات الدفع القديمة قبل إعادة المحاولة
                    localStorage.removeItem('geidea_session_id');
                    localStorage.removeItem('geidea_payment_data');
                    localStorage.removeItem('geidea_payment_url');
                    setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
                    
                    createPaymentSession();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إعادة المحاولة
                </button>
                <button
                  onClick={() => {
                    // حذف بيانات الدفع عند الإلغاء
                    localStorage.removeItem('geidea_session_id');
                    localStorage.removeItem('geidea_payment_data');
                    localStorage.removeItem('geidea_payment_url');
                    setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
                    onRequestClose();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : state.sessionCreated ? (
            <div>
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">تم إنشاء جلسة الدفع</h3>
              <p className="text-gray-600 mb-4 text-sm">تم إنشاء جلسة الدفع بنجاح. إذا لم تفتح صفحة الدفع تلقائياً، يمكنك النقر على الزر أدناه.</p>
              
              <button
                onClick={() => {
                  const sessionId = localStorage.getItem('geidea_session_id');
                  if (sessionId) {
                    const hppUrl = `https://www.merchant.geidea.net/hpp/checkout/?${sessionId}`;
                    const paymentWindow = window.open(hppUrl, '_blank', 'noopener,noreferrer,width=800,height=600,scrollbars=yes,resizable=yes');
                    if (paymentWindow) {
                      onRequestClose();
                    }
                  }
                }}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold mb-3"
              >
                💳 فتح صفحة الدفع
              </button>
              
              <div className="text-center mb-3">
                <p className="text-xs text-gray-500 mb-2">أو انسخ الرابط التالي:</p>
                <div className="bg-gray-100 p-2 rounded text-xs break-all mb-2">
                  {`https://www.merchant.geidea.net/hpp/checkout/?${localStorage.getItem('geidea_session_id') || ''}`}
                </div>
                <button
                  onClick={() => {
                    const sessionId = localStorage.getItem('geidea_session_id');
                    if (sessionId) {
                      const hppUrl = `https://www.merchant.geidea.net/hpp/checkout/?${sessionId}`;
                      navigator.clipboard.writeText(hppUrl).then(() => {
                        // تم نسخ الرابط بنجاح
                        
                        // إغلاق المودال بعد نسخ الرابط
                        setTimeout(() => {
                          onRequestClose();
                        }, 1000);
                      });
                    }
                  }}
                  className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                >
                  📋 نسخ الرابط
                </button>
              </div>
              
              <button
                onClick={() => {
                  // حذف بيانات الدفع عند الإغلاق
                  localStorage.removeItem('geidea_session_id');
                  localStorage.removeItem('geidea_payment_data');
                  localStorage.removeItem('geidea_payment_url');
                  setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
                  onRequestClose();
                }}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                إغلاق
              </button>
            </div>
          ) : state.isTestMode ? (
            <div>
              <div className="text-yellow-500 text-6xl mb-4">🧪</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">وضع الاختبار</h3>
              <p className="text-gray-600 mb-4 text-sm">تم إنشاء جلسة دفع تجريبية. في الإنتاج، سيتم توجيهك لصفحة الدفع الفعلية.</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  💡 <strong>ملاحظة:</strong> هذا وضع اختبار. لإعداد الدفع الفعلي، أضف بيانات Geidea في ملف .env.local
                </p>
              </div>

              <button
                onClick={() => {
                  // حذف بيانات الدفع عند الإغلاق
                  localStorage.removeItem('geidea_session_id');
                  localStorage.removeItem('geidea_payment_data');
                  localStorage.removeItem('geidea_payment_url');
                  setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
                  onRequestClose();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          ) : (
            <div>
              <div className="text-green-500 text-6xl mb-4">💳</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 جاري توجيهك للدفع</h3>
              <p className="text-gray-600 mb-4 text-sm">سيتم فتح نافذة دفع جيديا الآمنة خلال لحظات...</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  🔒 <strong>دفع آمن:</strong> ستنتقل لبوابة جيديا الرسمية لإدخال بيانات البطاقة بأمان تام
                </p>
              </div>
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-4"></div>
              </div>
              <p className="text-gray-600">جاري تحضير صفحة الدفع...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>مدفوعات آمنة</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💳</span>
              <span>بطاقات ائتمان ومدى</span>
            </div>
          </div>
        </div>

        {/* Close button */}
        {!state.loading && (
          <button
            onClick={() => {
              // حذف بيانات الدفع عند الإغلاق
              localStorage.removeItem('geidea_session_id');
              localStorage.removeItem('geidea_payment_data');
              localStorage.removeItem('geidea_payment_url');
              setState({ loading: false, error: null, isTestMode: false, sessionCreated: false });
              onRequestClose();
            }}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="إغلاق"
            title="إغلاق"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 
