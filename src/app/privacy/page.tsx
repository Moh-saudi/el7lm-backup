'use client';

import PublicLayout from "@/components/layout/PublicLayout.jsx";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      router.push('/');
    }
  };
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-12">
              <button
                onClick={handleBack}
                className="mb-6 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700 font-medium"
              >
                العودة
              </button>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">سياسة الخصوصية</h1>
              <p className="text-lg text-gray-600">
                آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">مقدمة</h2>
                <p className="text-gray-600 leading-relaxed">
                  نحن في منصة الحلم (el7lm) تحت مِيسك القابضة ملتزمون بحماية خصوصيتك وحماية بياناتك الشخصية. 
                  تشرح هذه السياسة كيفية جمعنا واستخدامنا وحماية معلوماتك عند استخدام خدماتنا.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">المعلومات التي نجمعها</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">المعلومات الشخصية</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>الاسم الكامل</li>
                      <li>عنوان البريد الإلكتروني</li>
                      <li>رقم الهاتف</li>
                      <li>تاريخ الميلاد</li>
                      <li>الجنسية والدولة</li>
                      <li>المعلومات الرياضية والمهارات</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">المعلومات التقنية</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>عنوان IP</li>
                      <li>نوع المتصفح والجهاز</li>
                      <li>معلومات التصفح والاستخدام</li>
                      <li>ملفات تعريف الارتباط (Cookies)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">كيفية استخدام المعلومات</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>إنشاء وإدارة حسابك على المنصة</li>
                  <li>تقديم خدماتنا وتحسين تجربة المستخدم</li>
                  <li>التواصل معك بخصوص الخدمات والتحديثات</li>
                  <li>معالجة المدفوعات والاشتراكات</li>
                  <li>عرض ملفك الشخصي للأندية والمسؤولين المهتمين</li>
                  <li>تحليل الاستخدام لتحسين الخدمات</li>
                  <li>الامتثال للمتطلبات القانونية</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">مشاركة المعلومات</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك في الحالات التالية:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>الأندية والمؤسسات الرياضية:</strong> بموافقتك المسبقة لعرض ملفك الشخصي</li>
                  <li><strong>مقدمي الخدمات:</strong> للمساعدة في تشغيل المنصة (معالجة الدفعات، الاستضافة)</li>
                  <li><strong>المتطلبات القانونية:</strong> عند الضرورة للامتثال للقوانين</li>
                  <li><strong>حماية الحقوق:</strong> لحماية حقوقنا أو حقوق المستخدمين الآخرين</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">أمان البيانات</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  نتخذ تدابير أمنية متقدمة لحماية معلوماتك:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>تشفير البيانات أثناء النقل والتخزين</li>
                  <li>مراقبة الأنظمة على مدار الساعة</li>
                  <li>التحديث المستمر للبروتوكولات الأمنية</li>
                  <li>تقييد الوصول للبيانات للموظفين المخولين فقط</li>
                  <li>النسخ الاحتياطي المنتظم للبيانات</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">حقوقك</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  لديك الحقوق التالية فيما يتعلق ببياناتك الشخصية:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>الوصول:</strong> طلب نسخة من بياناتك الشخصية</li>
                  <li><strong>التصحيح:</strong> تصحيح البيانات غير الدقيقة</li>
                  <li><strong>الحذف:</strong> طلب حذف بياناتك في ظروف معينة</li>
                  <li><strong>التقييد:</strong> تقييد معالجة بياناتك</li>
                  <li><strong>النقل:</strong> الحصول على بياناتك بتنسيق قابل للنقل</li>
                  <li><strong>الاعتراض:</strong> الاعتراض على معالجة بياناتك</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">ملفات تعريف الارتباط</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>ملفات ضرورية:</strong> لضمان عمل المنصة بشكل صحيح</li>
                  <li><strong>ملفات الأداء:</strong> لفهم كيفية استخدامك للمنصة</li>
                  <li><strong>ملفات التفضيلات:</strong> لحفظ إعداداتك المفضلة</li>
                  <li><strong>ملفات التسويق:</strong> لعرض محتوى مخصص (بموافقتك)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">الاحتفاظ بالبيانات</h2>
                <p className="text-gray-600 leading-relaxed">
                  نحتفظ ببياناتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات. 
                  بعد حذف الحساب، نحتفظ ببعض البيانات لفترة محددة للامتثال للمتطلبات القانونية 
                  أو لحل النزاعات.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">خصوصية الأطفال</h2>
                <p className="text-gray-600 leading-relaxed">
                  خدماتنا مخصصة للمستخدمين الذين تبلغ أعمارهم 13 عاماً أو أكثر. 
                  إذا كان عمرك أقل من 18 عاماً، يجب الحصول على موافقة ولي الأمر قبل استخدام الخدمة.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">التغييرات على هذه السياسة</h2>
                <p className="text-gray-600 leading-relaxed">
                  قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإشعارك بأي تغييرات مهمة 
                  عبر البريد الإلكتروني أو من خلال إشعار على المنصة. استمرار استخدامك للخدمة 
                  بعد التغييرات يعني موافقتك على السياسة المحدثة.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">التواصل معنا</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  إذا كان لديك أسئلة حول سياسة الخصوصية أو ممارساتنا في حماية البيانات، 
                  يمكنك التواصل معنا:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="text-gray-600 space-y-2">
                    <li><strong>البريد الإلكتروني:</strong> info@el7lm.com</li>
                    <li><strong>الهاتف (قطر):</strong> 97472053188</li>
                    <li><strong>الهاتف (مصر):</strong> 01017799580</li>
                    <li><strong>العنوان:</strong> الدوحة، قطر</li>
                  </ul>
                </div>
              </section>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-gray-500 text-center">
                  © {new Date().getFullYear()} الحلم (el7lm) تحت مِيسك القابضة. جميع الحقوق محفوظة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
} 
