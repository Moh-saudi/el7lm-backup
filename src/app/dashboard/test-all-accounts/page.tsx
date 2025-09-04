'use client';

import { useAuth } from '@/lib/firebase/auth-provider';
import dynamic from 'next/dynamic';

const UnifiedDashboardLayout = dynamic(() => import('@/components/layout/UnifiedDashboardLayout'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function TestAllAccountsPage() {
  const { user, userData, loading } = useAuth();
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;

  if (loading) {
    return (
      <UnifiedDashboardLayout accountType="player" title="اختبار جميع الحسابات" showFooter={true} showFloatingChat={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </UnifiedDashboardLayout>
    );
  }

  if (!user) {
    return (
      <UnifiedDashboardLayout accountType="player" title="اختبار جميع الحسابات" showFooter={true} showFloatingChat={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">غير مسجل الدخول</h2>
            <p className="text-gray-600">يرجى تسجيل الدخول لاختبار البيانات</p>
          </div>
        </div>
      </UnifiedDashboardLayout>
    );
  }

  return (
    <UnifiedDashboardLayout accountType="player" title="اختبار جميع الحسابات" showFooter={true} showFloatingChat={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">اختبار عرض بيانات المستخدم</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* معلومات المستخدم */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">معلومات المستخدم</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">UID:</span>
                  <span className="ml-2 text-gray-900">{user.uid}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">البريد الإلكتروني:</span>
                  <span className="ml-2 text-gray-900">{user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">نوع الحساب:</span>
                  <span className="ml-2 text-gray-900">{userData?.accountType || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">الاسم الكامل:</span>
                  <span className="ml-2 text-gray-900">{userData?.full_name || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">رقم الهاتف:</span>
                  <span className="ml-2 text-gray-900">{userData?.phone || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">الدولة:</span>
                  <span className="ml-2 text-gray-900">{userData?.country || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">صورة الملف الشخصي:</span>
                  <span className="ml-2 text-gray-900">{userData?.profile_image ? 'موجودة' : 'غير موجودة'}</span>
                </div>
              </div>
            </div>

            {/* البيانات الخام */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">البيانات الخام</h2>
              <div className="bg-gray-100 rounded-lg p-4">
                <pre className="text-sm text-gray-800 overflow-auto">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            </div>

            {/* اختبار الهيدر */}
            <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">اختبار الهيدر</h2>
              <p className="text-gray-600 mb-4">
                يجب أن تظهر في الهيدر أعلى الصفحة البيانات التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>الاسم الكامل: <strong>{userData?.full_name || 'غير محدد'}</strong></li>
                <li>نوع الحساب: <strong>{userData?.accountType === 'player' ? 'لاعب' : 
                  userData?.accountType === 'club' ? 'نادي' :
                  userData?.accountType === 'academy' ? 'أكاديمية' :
                  userData?.accountType === 'trainer' ? 'مدرب' :
                  userData?.accountType === 'agent' ? 'وكيل' :
                  userData?.accountType === 'admin' ? 'مدير' : 'مستخدم'}</strong></li>
                <li>الدولة: <strong>{userData?.country || 'غير محدد'}</strong></li>
                <li>صورة الملف الشخصي: <strong>{userData?.profile_image ? 'موجودة' : 'غير موجودة'}</strong></li>
              </ul>
            </div>

            {/* تعليمات الاختبار */}
            <div className="bg-blue-50 rounded-lg p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">تعليمات الاختبار</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>تأكد من أن الهيدر يعرض الاسم الكامل بدلاً من "سعودي"</li>
                <li>تأكد من أن صورة الملف الشخصي تظهر بشكل صحيح</li>
                <li>تأكد من أن نوع الحساب يظهر بشكل صحيح</li>
                <li>تأكد من أن الدولة تظهر (إذا كانت متوفرة)</li>
                <li>اختبر زر تسجيل الخروج</li>
                <li>اختبر القائمة الجانبية</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </UnifiedDashboardLayout>
  );
} 
