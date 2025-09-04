'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CheckCircle, ArrowRight, Star, Zap } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // استخراج تفاصيل الدفع من URL parameters
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const packageName = searchParams.get('package');
    const transactionId = searchParams.get('transactionId');

    if (amount && currency) {
      setPaymentDetails({
        amount,
        currency,
        packageName: packageName || 'الباقة المختارة',
        transactionId: transactionId || 'غير متوفر',
        timestamp: new Date().toLocaleString('ar-SA')
      });
    }

    setLoading(false);
  }, [searchParams]);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  const handleViewSubscription = () => {
    router.push('/dashboard/subscription');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* رسالة النجاح الرئيسية */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              تم الدفع بنجاح! 🎉
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              شكراً لك على ثقتك بنا. تمت معالجة عملية الدفع بنجاح وتم تفعيل اشتراكك
            </p>
          </div>

          {/* تفاصيل الدفع */}
          {paymentDetails && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                تفاصيل العملية
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">المبلغ المدفوع:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {paymentDetails.amount} {paymentDetails.currency}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">الباقة المختارة:</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {paymentDetails.packageName}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">رقم العملية:</span>
                    <span className="text-sm font-mono text-gray-800">
                      {paymentDetails.transactionId}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">تاريخ العملية:</span>
                    <span className="text-sm text-gray-800">
                      {paymentDetails.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* المميزات الجديدة */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-6 text-center">
              مميزات اشتراكك الجديد ✨
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">وصول فوري</h3>
                <p className="text-sm text-blue-100">
                  استمتع بجميع المميزات فوراً بعد الدفع
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">مميزات حصرية</h3>
                <p className="text-sm text-blue-100">
                  وصول لجميع المحتويات والخدمات المميزة
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">دعم فني</h3>
                <p className="text-sm text-blue-100">
                  دعم فني متواصل على مدار الساعة
                </p>
              </div>
            </div>
          </div>

          {/* أزرار التنقل */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContinue}
              className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <span>العودة للوحة التحكم</span>
              <ArrowRight className="w-5 h-5 mr-2" />
            </button>
            
            <button
              onClick={handleViewSubscription}
              className="flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <span>عرض تفاصيل الاشتراك</span>
              <Star className="w-5 h-5 mr-2" />
            </button>
          </div>

          {/* رسالة إضافية */}
          <div className="mt-12 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                📧 تأكيد بالبريد الإلكتروني
              </h3>
              <p className="text-yellow-700">
                تم إرسال تأكيد عملية الدفع إلى بريدك الإلكتروني. 
                يرجى التحقق من صندوق الوارد أو مجلد الرسائل غير المرغوب فيها.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 
