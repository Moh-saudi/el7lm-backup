'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mail, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import PublicResponsiveLayoutWrapper from '@/components/layout/PublicResponsiveLayout';

export default function ContactPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
      <button
        onClick={handleBack}
              className="mb-8 inline-flex items-center px-6 py-3 bg-white rounded-full hover:bg-gray-50 text-gray-700 font-medium shadow-lg transition-all duration-300 transform hover:scale-105"
      >
              <ChevronRight className="w-5 h-5 ml-2" />
              العودة للصفحة الرئيسية
      </button>
            
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 mb-6">
              اتصل بنا
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              نحن هنا لمساعدتك في تحقيق حلمك الرياضي. تواصل معنا عبر أي من القنوات التالية
            </p>
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl max-w-3xl mx-auto">
              <p className="text-xl text-gray-700 font-semibold mb-2">
                💬 يمكنك مراسلتنا على الواتساب بسهولة!
              </p>
              <p className="text-lg text-gray-600">
                اضغط على أيقونة الواتساب أدناه وسيتم فتح المحادثة مباشرة مع فريقنا
              </p>
            </div>
          </div>

          {/* Quick Contact Numbers */}
          <div className="mb-16 p-8 bg-gradient-to-r from-blue-100 to-green-100 rounded-3xl shadow-lg">
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">
              📞 أرقام الهواتف المباشرة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white rounded-2xl shadow-md">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <img src="/images/flags/egypt.png" alt="علم مصر" className="w-8 h-8" />
                  <h4 className="text-2xl font-bold text-gray-800">مصر</h4>
                </div>
                <a 
                  href="tel:+201017799580" 
                  className="text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors block"
                >
                  +20 10 1779 9580
                </a>
                <p className="text-sm text-gray-600 mt-2">متاح 24/7 للدردشة والاستفسارات</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-2xl shadow-md">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <img src="/images/flags/qatar.png" alt="علم قطر" className="w-8 h-8" />
                  <h4 className="text-2xl font-bold text-gray-800">قطر</h4>
                </div>
                <a 
                  href="tel:+97472053188" 
                  className="text-3xl font-bold text-green-600 hover:text-green-700 transition-colors block"
                >
                  +974 72 053 188
                </a>
                <p className="text-sm text-gray-600 mt-2">متاح 24/7 للدردشة والاستفسارات</p>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-lg text-gray-700 font-semibold">
                💬 يمكنك أيضاً مراسلتنا على الواتساب مباشرة بالضغط على الأزرار أدناه
              </p>
            </div>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid gap-8 md:gap-12 max-w-7xl mx-auto grid-cols-1 lg:grid-cols-3 mb-16">
            
            {/* Egypt Contact */}
            <div className="p-8 md:p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-blue-100">
              <div className="text-center">
                <div className="mb-8">
                  <img src="/images/flags/egypt.png" alt="علم مصر" className="w-16 h-16 mx-auto mb-4 rounded-full shadow-lg" />
                  <h3 className="text-4xl font-bold text-gray-800 mb-2">مصر</h3>
                  <p className="text-lg text-gray-600">المكتب الرئيسي</p>
                </div>
                
                {/* Phone Section */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Phone className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-700">+20</span>
                  </div>
                  <a 
                    href="tel:+201017799580" 
                    className="text-5xl font-bold text-blue-600 hover:text-blue-700 transition-colors block"
                  >
                    010 1779 9580
                  </a>
                  <p className="text-sm text-gray-500 mt-2">متاح 24/7</p>
                </div>

                {/* WhatsApp Button */}
                <a 
                  href="https://wa.me/201017799580" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-10 py-5 text-2xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-8 h-8 ml-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {'واتساب مصر'}
                </a>
                <p className="text-sm text-green-600 mt-2 font-medium">💬 اضغط للدردشة المباشرة</p>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <strong>العنوان:</strong> القاهرة، مصر<br/>
                    <strong>ساعات العمل:</strong> الأحد - الخميس 9 ص - 6 م
                  </p>
                </div>
              </div>
            </div>

            {/* Qatar Contact */}
            <div className="p-8 md:p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-green-100">
              <div className="text-center">
                <div className="mb-8">
                  <img src="/images/flags/qatar.png" alt="علم قطر" className="w-16 h-16 mx-auto mb-4 rounded-full shadow-lg" />
                  <h3 className="text-4xl font-bold text-gray-800 mb-2">قطر</h3>
                  <p className="text-lg text-gray-600">المكتب الإقليمي</p>
                </div>
                
                {/* Phone Section */}
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Phone className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-gray-700">+974</span>
                  </div>
                  <a 
                    href="tel:+97472053188" 
                    className="text-5xl font-bold text-green-600 hover:text-green-700 transition-colors block"
                  >
                    72 053 188
                  </a>
                  <p className="text-sm text-gray-500 mt-2">متاح 24/7</p>
                </div>

                {/* WhatsApp Button */}
                <a 
                  href="https://wa.me/97472053188" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-10 py-5 text-2xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-8 h-8 ml-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {'واتساب قطر'}
                </a>
                <p className="text-sm text-green-600 mt-2 font-medium">💬 اضغط للدردشة المباشرة</p>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <strong>العنوان:</strong> الدوحة، قطر<br/>
                    <strong>ساعات العمل:</strong> الأحد - الخميس 8 ص - 5 م
                  </p>
                </div>
              </div>
            </div>

            {/* Email Contact */}
            <div className="p-8 md:p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-purple-100">
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-4xl font-bold text-gray-800 mb-2">البريد الإلكتروني</h3>
                  <p className="text-lg text-gray-600">تواصل رسمي</p>
                </div>
                
                {/* Email Section */}
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Mail className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-gray-700">البريد الإلكتروني</span>
                  </div>
                  <a 
                    href="mailto:info@el7lm.com" 
                    className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors block break-all"
                  >
                    info@el7lm.com
                  </a>
                  <p className="text-sm text-gray-500 mt-2">رد خلال 24 ساعة</p>
                </div>

                {/* Email Button */}
                <a 
                  href="mailto:info@el7lm.com" 
                  className="inline-flex items-center px-10 py-5 text-2xl font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-full hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Mail className="w-8 h-8 ml-4" />
                  {'إرسال بريد إلكتروني'}
                </a>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <strong>الرد:</strong> خلال 24 ساعة<br/>
                    <strong>الاستفسارات:</strong> عامة وتقنية
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Contact Methods */}
          <div className="grid gap-8 md:gap-12 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 mb-16">
            
            {/* Social Media */}
            <div className="p-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl text-white shadow-xl">
              <h3 className="text-3xl font-bold mb-6 text-center">وسائل التواصل الاجتماعي</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-xl font-semibold">فيسبوك</span>
                  <a href="https://facebook.com/el7lm" target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                    متابعة
                  </a>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-xl font-semibold">تويتر</span>
                  <a href="https://twitter.com/el7lm" target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                    متابعة
                  </a>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-xl font-semibold">إنستغرام</span>
                  <a href="https://instagram.com/el7lm" target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                    متابعة
                  </a>
                </div>
              </div>
            </div>

            {/* Support Hours */}
            <div className="p-8 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl text-white shadow-xl">
              <h3 className="text-3xl font-bold mb-6 text-center">ساعات الدعم الفني</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-xl font-semibold">الأحد - الخميس</span>
                  <span className="text-xl">9 ص - 6 م</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-xl font-semibold">الجمعة - السبت</span>
                  <span className="text-xl">10 ص - 4 م</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-xl font-semibold">الطوارئ</span>
                  <span className="text-xl">24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h3 className="text-4xl font-bold text-gray-800 mb-6">
              ابدأ رحلتك الآن
            </h3>
            <p className="text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              انضم إلى منصتنا واحصل على فرصتك في عالم كرة القدم. نحن هنا لمساعدتك في تحقيق حلمك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/auth/register" 
                className="inline-flex items-center px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                سجل الآن
                <ChevronLeft className="w-8 h-8 mr-4" />
              </a>
              <a 
                href="/" 
                className="inline-flex items-center px-12 py-6 text-2xl font-bold text-blue-600 bg-white border-2 border-blue-600 rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                الصفحة الرئيسية
                <ChevronRight className="w-8 h-8 mr-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </PublicResponsiveLayoutWrapper>
  );
} 
