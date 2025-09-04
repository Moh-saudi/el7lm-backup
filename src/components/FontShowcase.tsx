// مكون لعرض خطوط Cairo و Inter
'use client';

import FontProvider, { FontHeading, FontText, MixedFontText } from '@/components/shared/FontProvider';

export default function FontShowcase() {
  const locale = 'ar';
  const t = (key: string) => key;

  return (
    <FontProvider className="p-8 space-y-8 bg-white rounded-lg shadow-lg max-w-4xl mx-auto my-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          نظام الخطوط الموحد - Cairo & Inter
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          خط Cairo للعربية وخط Inter للغة الإنجليزية
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => {
              document.documentElement.dir = 'rtl';
              document.documentElement.lang = 'ar';
              localStorage.setItem('locale', 'ar');
              window.location.reload();
            }}
            className={`px-4 py-2 rounded-lg ${locale === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            العربية - Cairo
          </button>
          <button 
            onClick={() => {
              document.documentElement.dir = 'ltr';
              document.documentElement.lang = 'en';
              localStorage.setItem('locale', 'en');
              window.location.reload();
            }}
            className={`px-4 py-2 rounded-lg ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            English - Inter
          </button>
        </div>
      </div>
      
      {/* عرض خط Cairo للنصوص العربية */}
      <section className="space-y-4">
        <FontHeading level="h2" className="text-2xl font-semibold text-gray-800">
          {locale === 'ar' ? 'خط Cairo للنصوص العربية' : 'Cairo Font for Arabic Text'}
        </FontHeading>
        
        <div className="space-y-3">
          <FontText className="text-lg">
            {locale === 'ar' 
              ? 'نص عربي بخط Cairo - خط واضح ومقروء ومناسب لجميع الاستخدامات'
              : 'Arabic text with Cairo font - clear and readable for all uses'
            }
          </FontText>
          
          <FontText className="text-lg font-medium">
            {locale === 'ar'
              ? 'نص عربي متوسط الثقل - مناسب للعناوين الفرعية والنصوص المهمة'
              : 'Medium weight Arabic text - suitable for subtitles and important content'
            }
          </FontText>
          
          <FontText className="text-lg font-bold">
            {locale === 'ar'
              ? 'نص عربي غامق - مثالي للعناوين الرئيسية والتأكيدات'
              : 'Bold Arabic text - perfect for main headings and emphasis'
            }
          </FontText>
        </div>
      </section>
      
      {/* عرض خط Inter للنصوص الإنجليزية */}
      <section className="space-y-4">
        <FontHeading level="h2" className="text-2xl font-semibold text-gray-800">
          {locale === 'ar' ? 'خط Inter للنصوص الإنجليزية' : 'Inter Font for English Text'}
        </FontHeading>
        
        <div className="space-y-3">
          <FontText className="text-lg">
            {locale === 'ar'
              ? 'نص إنجليزي بخط Inter - خط واضح ومقروء ومناسب للواجهات الحديثة'
              : 'English text with Inter font - clear and readable for modern interfaces'
            }
          </FontText>
          
          <FontText className="text-lg font-medium">
            {locale === 'ar'
              ? 'نص إنجليزي متوسط الثقل - مناسب للمحتوى المهم'
              : 'Medium weight English text - suitable for important content'
            }
          </FontText>
          
          <FontText className="text-lg font-bold">
            {locale === 'ar'
              ? 'نص إنجليزي غامق - مثالي للعناوين والتأكيدات'
              : 'Bold English text - perfect for headings and emphasis'
            }
          </FontText>
        </div>
      </section>
      
      {/* عرض العناوين والنصوص المختلطة */}
      <section className="space-y-4">
        <FontHeading level="h2" className="text-2xl font-semibold text-gray-800">
          {locale === 'ar' ? 'العناوين والنصوص المختلطة' : 'Mixed Headings and Text'}
        </FontHeading>
        
        <div className="space-y-4">
          <FontHeading level="h1" className="text-4xl font-bold text-blue-600">
            {locale === 'ar' ? 'عنوان رئيسي كبير' : 'Large Main Heading'}
          </FontHeading>
          
          <FontHeading level="h2" className="text-3xl font-semibold text-gray-700">
            {locale === 'ar' ? 'عنوان فرعي متوسط' : 'Medium Sub Heading'}
          </FontHeading>
          
          <FontHeading level="h3" className="text-2xl font-medium text-gray-600">
            {locale === 'ar' ? 'عنوان صغير' : 'Small Heading'}
          </FontHeading>
          
          <FontText className="text-lg text-gray-600">
            {locale === 'ar'
              ? 'هذا نص عادي بخط Cairo للعربية وخط Inter للغة الإنجليزية. النظام يتغير تلقائياً حسب اللغة المختارة.'
              : 'This is regular text with Cairo font for Arabic and Inter font for English. The system changes automatically based on the selected language.'
            }
          </FontText>
        </div>
      </section>
      
      {/* عرض النصوص المختلطة */}
      <section className="space-y-4">
        <FontHeading level="h2" className="text-2xl font-semibold text-gray-800">
          {locale === 'ar' ? 'النصوص المختلطة' : 'Mixed Text Examples'}
        </FontHeading>
        
        <div className="space-y-3">
          <MixedFontText className="text-lg">
            {locale === 'ar'
              ? 'نص عربي مع English text مختلط - Cairo للعربية و Inter للإنجليزية'
              : 'Arabic text مع English text mixed - Cairo for Arabic and Inter for English'
            }
          </MixedFontText>
          
          <MixedFontText className="text-lg font-medium">
            {locale === 'ar'
              ? 'El7lm منصة - Professional Football Platform'
: 'El7lm منصة - Professional Football Platform'
            }
          </MixedFontText>
          
          <MixedFontText className="text-lg font-bold">
            {locale === 'ar'
              ? 'لوحة التحكم Dashboard - إدارة شاملة Comprehensive Management'
              : 'لوحة التحكم Dashboard - إدارة شاملة Comprehensive Management'
            }
          </MixedFontText>
        </div>
      </section>
      
      {/* عرض الأزرار وحقول الإدخال */}
      <section className="space-y-4">
        <FontHeading level="h2" className="text-2xl font-semibold text-gray-800">
          {locale === 'ar' ? 'الأزرار وحقول الإدخال' : 'Buttons and Input Fields'}
        </FontHeading>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {locale === 'ar' ? 'زر عربي' : 'English Button'}
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              {locale === 'ar' ? 'زر آخر' : 'Another Button'}
            </button>
          </div>
          
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder={locale === 'ar' ? 'حقل إدخال عربي' : 'English input field'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea 
              placeholder={locale === 'ar' ? 'منطقة نص عربي' : 'English text area'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
            />
          </div>
        </div>
      </section>
      
      {/* المعلومات التقنية */}
      <section className="bg-blue-50 p-6 rounded-lg">
        <FontHeading level="h3" className="text-xl font-semibold mb-4 text-blue-800">
          {locale === 'ar' ? 'المعلومات التقنية' : 'Technical Information'}
        </FontHeading>
        <div className="text-sm text-blue-700 space-y-2">
          <p>• <strong>Cairo:</strong> {locale === 'ar' ? 'الخط المستخدم للنصوص العربية' : 'Font used for Arabic text'}</p>
          <p>• <strong>Inter:</strong> {locale === 'ar' ? 'الخط المستخدم للنصوص الإنجليزية' : 'Font used for English text'}</p>
          <p>• <strong>دعم اللغات:</strong> {locale === 'ar' ? 'العربية والإنجليزية' : 'Arabic and English'}</p>
          <p>• <strong>الأوزان:</strong> {locale === 'ar' ? 'من 300 إلى 900' : 'From 300 to 900'}</p>
          <p>• <strong>التحسينات:</strong> {locale === 'ar' ? 'font-smoothing, kerning' : 'font-smoothing, kerning'}</p>
          <p>• <strong>الأداء:</strong> {locale === 'ar' ? 'display: swap للتحميل السريع' : 'display: swap for fast loading'}</p>
          <p>• <strong>التوافق:</strong> {locale === 'ar' ? 'جميع المتصفحات الحديثة' : 'All modern browsers'}</p>
          <p>• <strong>الاستخدام:</strong> {locale === 'ar' ? 'الأزرار، العناوين، النصوص، حقول الإدخال' : 'Buttons, headings, text, input fields'}</p>
        </div>
      </section>
    </FontProvider>
  );
} 
