'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import DashboardLayout from '@/components/layout/DashboardLayout.jsx';
import { XCircle, RefreshCw, ArrowLeft, HelpCircle, CreditCard } from 'lucide-react';

export default function PaymentFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // استخراج تفاصيل الخطأ من URL parameters
    const error = searchParams.get('error');
    const errorCode = searchParams.get('errorCode');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const packageName = searchParams.get('package');

    setErrorDetails({
      error: error || 'حدث خطأ غير متوقع أثناء عملية الدفع',
      errorCode: errorCode || 'UNKNOWN_ERROR',
      amount,
      currency,
      packageName: packageName || 'الباقة المختارة',
      timestamp: new Date().toLocaleString('ar-SA')
    });

    setLoading(false);
  }, [searchParams]);

  const handleRetryPayment = () => {
    router.push('/dashboard/payment');
  };

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  const handleContactSupport = () => {
    // يمكن توجيه المستخدم لصفحة الدعم أو فتح نافذة chat
    window.open('mailto:support@example.com?subject=مشكلة في الدفع', '_blank');
  };

  const getErrorMessage = (errorCode: string) => {
    const errorMessages: { [key: string]: string } = {
      'INSUFFICIENT_FUNDS': 'رصيد غير كافي في البطاقة',
      'CARD_DECLINED': 'تم رفض البطاقة من قبل البنك',
      'EXPIRED_CARD': 'البطاقة منتهية الصلاحية',
      'INVALID_CARD': 'بيانات البطاقة غير صحيحة',
      'NETWORK_ERROR': 'خطأ في الاتصال بالشبكة',
      'TIMEOUT': 'انتهت مهلة العملية',
      'CANCELLED': 'تم إلغاء العملية من قبل المستخدم',
      'UNKNOWN_ERROR': 'حدث خطأ غير متوقع'
    };

    return errorMessages[errorCode] || 'حدث خطأ غير متوقع';
  };

  const getErrorIcon = (errorCode: string) => {
    const iconMap: { [key: string]: string } = {
      'INSUFFICIENT_FUNDS': '💰',
      'CARD_DECLINED': '❌',
      'EXPIRED_CARD': '📅',
      'INVALID_CARD': '🔒',
      'NETWORK_ERROR': '🌐',
      'TIMEOUT': '⏰',
      'CANCELLED': '🚫',
      'UNKNOWN_ERROR': '❓'
    };

    return iconMap[errorCode] || '❓';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* رسالة الفشل الرئيسية */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              فشلت عملية الدفع {getErrorIcon(errorDetails?.errorCode)}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              عذراً، لم نتمكن من إتمام عملية الدفع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني
            </p>
          </div>

          {/* تفاصيل الخطأ */}
          {errorDetails && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                تفاصيل الخطأ
              </h2>
              
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="mr-3">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">
                        {getErrorMessage(errorDetails.errorCode)}
                      </h3>
                      <p className="text-red-700">
                        {errorDetails.error}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">المبلغ:</span>
                      <span className="text-lg font-semibold text-gray-800">
                        {errorDetails.amount} {errorDetails.currency}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">الباقة:</span>
                      <span className="text-lg font-semibold text-blue-600">
                        {errorDetails.packageName}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">رمز الخطأ:</span>
                      <span className="text-sm font-mono text-gray-800">
                        {errorDetails.errorCode}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">التاريخ:</span>
                      <span className="text-sm text-gray-800">
                        {errorDetails.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* حلول مقترحة */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-6 text-center">
              حلول مقترحة 🔧
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">تحقق من البطاقة</h3>
                <p className="text-sm text-blue-100">
                  تأكد من صحة بيانات البطاقة وتاريخ انتهاء الصلاحية
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">حاول مرة أخرى</h3>
                <p className="text-sm text-blue-100">
                  أعد المحاولة بعد بضع دقائق أو استخدم بطاقة أخرى
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">تواصل معنا</h3>
                <p className="text-sm text-blue-100">
                  فريق الدعم الفني جاهز لمساعدتك في حل المشكلة
                </p>
              </div>
            </div>
          </div>

          {/* أزرار التنقل */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetryPayment}
              className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5 ml-2" />
              <span>إعادة المحاولة</span>
            </button>
            
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center px-8 py-4 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5 ml-2" />
              <span>العودة للوحة التحكم</span>
            </button>
            
            <button
              onClick={handleContactSupport}
              className="flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <HelpCircle className="w-5 h-5 ml-2" />
              <span>تواصل مع الدعم</span>
            </button>
          </div>

          {/* معلومات إضافية */}
          <div className="mt-12 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                💡 نصائح مهمة
              </h3>
              <ul className="text-blue-700 text-right space-y-1">
                <li>• تأكد من أن البطاقة تدعم المدفوعات الإلكترونية</li>
                <li>• تحقق من رصيد البطاقة قبل المحاولة</li>
                <li>• استخدم متصفح محدث واتصال إنترنت مستقر</li>
                <li>• إذا استمرت المشكلة، جرب بطاقة أخرى</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 
