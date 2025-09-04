'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Target, Award, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PublicResponsiveLayoutWrapper from '@/components/layout/PublicResponsiveLayout';

export default function AboutPage() {
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      router.push('/');
    }
  };

  return (
    <PublicResponsiveLayoutWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white" dir="rtl">

      {/* Main Content */}
      <main className="container px-4 py-12 mx-auto">
        {/* Hero Section */}
        <div className="py-12 mx-auto max-w-2xl text-center">
          <button
            onClick={handleBack}
            className="px-4 py-2 mb-6 font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            العودة
          </button>
          <h1 className="mb-4 text-3xl font-bold">عن المنصة</h1>
          <p className="text-lg text-gray-700">منصة الحلم (el7lm) تحت مِيسك القابضة تهدف إلى تطوير كرة القدم العربية من خلال ربط اللاعبين، الأندية، الأكاديميات، الوكلاء والمدربين في مكان واحد.</p>
        </div>

        {/* Mission & Vision */}
        <div className="grid gap-8 mb-16 md:grid-cols-2">
          <div className="p-8 bg-white rounded-2xl shadow-lg">
            <div className="flex gap-3 items-center mb-4">
              <Target className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">رسالتنا</h2>
            </div>
            <p className="leading-relaxed text-gray-600">
              نهدف إلى تمكين لاعبي كرة القدم من عرض مواهبهم ومهاراتهم للأندية والوكلاء حول العالم، 
              وتوفير منصة شاملة تجمع بين اللاعبين والأندية والوكلاء في مكان واحد لتسهيل عمليات الاكتشاف والتوقيع.
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl shadow-lg">
            <div className="flex gap-3 items-center mb-4">
              <Award className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">رؤيتنا</h2>
            </div>
            <p className="leading-relaxed text-gray-600">
              أن نصبح المنصة الرائدة عالمياً في مجال اكتشاف وإدارة المواهب الرياضية، 
              ونساهم في تطوير كرة القدم العربية والعالمية من خلال توفير الأدوات والتقنيات المتقدمة.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900">مميزات المنصة</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 bg-white rounded-xl shadow-md">
              <Users className="mb-4 w-12 h-12 text-blue-600" />
              <h3 className="mb-2 text-xl font-bold text-gray-900">إدارة شاملة للملفات</h3>
              <p className="text-gray-600">
                ملفات شخصية تفصيلية تشمل المهارات، الإحصائيات، الفيديوهات، والتاريخ الطبي
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md">
              <Globe className="mb-4 w-12 h-12 text-blue-600" />
              <h3 className="mb-2 text-xl font-bold text-gray-900">وصول عالمي</h3>
              <p className="text-gray-600">
                منصة تدعم عدة لغات وعملات، مع إمكانية الوصول للأندية والوكلاء في جميع أنحاء العالم
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md">
              <Target className="mb-4 w-12 h-12 text-blue-600" />
              <h3 className="mb-2 text-xl font-bold text-gray-900">تحليلات متقدمة</h3>
              <p className="text-gray-600">
                أدوات تحليل الأداء وتقييم المهارات مع تقارير مفصلة ومخططات تفاعلية
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900">إحصائياتنا</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="p-6 text-center text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <div className="mb-2 text-3xl font-bold">1000+</div>
              <div>لاعب مسجل</div>
            </div>
            <div className="p-6 text-center text-white bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <div className="mb-2 text-3xl font-bold">50+</div>
              <div>نادي شريك</div>
            </div>
            <div className="p-6 text-center text-white bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <div className="mb-2 text-3xl font-bold">25+</div>
              <div>وكيل معتمد</div>
            </div>
            <div className="p-6 text-center text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
              <div className="mb-2 text-3xl font-bold">15</div>
              <div>دولة</div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="p-8 text-center bg-white rounded-2xl shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">تواصل معنا</h2>
          <p className="mb-6 text-gray-600">
            لديك أسئلة أو تحتاج مساعدة؟ فريقنا مستعد لمساعدتك
          </p>
          <div className="flex flex-col gap-4 items-center md:flex-row md:justify-center">
            <a
              href="mailto:info@el7lm.com"
              className="px-6 py-3 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
            >
              info@el7lm.com
            </a>
            <a
              href="tel:+201017799580"
              className="px-6 py-3 text-blue-600 rounded-lg border-2 border-blue-600 transition-colors hover:bg-blue-50"
            >
              +20 10 1779 9580
            </a>
          </div>
        </div>
      </main>

    </div>
    </PublicResponsiveLayoutWrapper>
  );
} 
