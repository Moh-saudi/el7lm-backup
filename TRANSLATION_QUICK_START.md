# 🚀 البدء السريع مع نظام الترجمة

## 📋 ما تم إضافته

✅ **نظام ترجمة شامل** يدعم العربية والإنجليزية  
✅ **مبدل لغة جاهز** مع 3 أنماط مختلفة  
✅ **تنسيق تلقائي** للتواريخ والأرقام والعملات  
✅ **دعم RTL/LTR** تلقائي  
✅ **مكونات جاهزة** للاستخدام الفوري  

## 🎯 الاستخدام السريع

### 1. في أي مكون React:

```tsx
import { useTranslation } from '@/lib/translations';

export default function MyComponent() {
  const { t, language, direction } = useTranslation();
  
  return (
    <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
      <h1>{t('nav.dashboard')}</h1>
      <button>{t('actions.save')}</button>
    </div>
  );
}
```

### 2. إضافة مبدل اللغة:

```tsx
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

<LanguageSwitcher variant="dropdown" />
```

### 3. الترجمة مع متغيرات:

```tsx
const message = tWithVars('users.totalUsers', { count: 1500 });
```

## 📁 الملفات المضافة

```
src/lib/translations/
├── index.ts          # النظام الرئيسي
├── ar.ts             # الترجمات العربية
└── en.ts             # الترجمات الإنجليزية

src/components/shared/
├── LanguageSwitcher.tsx      # مبدل اللغة
├── TranslatedComponent.tsx    # مكون مثال
├── HeaderWithTranslation.tsx  # Header مترجم
└── TranslatedCards.tsx        # بطاقات مترجمة

src/app/test-translation/
└── page.tsx          # صفحة الاختبار
```

## 🧪 الاختبار

```bash
npm run dev
# ثم افتح: http://localhost:3000/test-translation
```

## 📚 الدوال المتاحة

```tsx
const { 
  t,                    // الترجمة الأساسية
  tWithVars,           // الترجمة مع متغيرات
  language,            // اللغة الحالية
  direction,           // الاتجاه (rtl/ltr)
  setLanguage,         // تغيير اللغة
  formatDate,          // تنسيق التاريخ
  formatNumber,        // تنسيق الأرقام
  formatCurrency       // تنسيق العملة
} = useTranslation();
```

## 🎨 أنماط مبدل اللغة

```tsx
// قائمة منسدلة (افتراضي)
<LanguageSwitcher variant="dropdown" />

// أزرار بسيطة
<LanguageSwitcher variant="button" />

// أزرار صغيرة
<LanguageSwitcher variant="minimal" />
```

## 📝 إضافة ترجمات جديدة

### في ملف ar.ts:
```tsx
const ar = {
  newSection: {
    title: 'العنوان الجديد',
    button: 'زر جديد'
  }
};
```

### في ملف en.ts:
```tsx
const en = {
  newSection: {
    title: 'New Title',
    button: 'New Button'
  }
};
```

### الاستخدام:
```tsx
const title = t('newSection.title');
```

## 🔧 التخصيص

### إضافة لغة جديدة:
1. إنشاء ملف ترجمة جديد (مثل `fr.ts`)
2. إضافة في `SUPPORTED_LANGUAGES`
3. تحديث `TranslationProvider`

### تخصيص التنسيق:
```tsx
const date = formatDate(new Date(), {
  year: 'numeric',
  month: 'short'
});
```

## ✅ المميزات

- **سهل الاستخدام**: `const { t } = useTranslation();`
- **تلقائي**: تغيير الاتجاه والتنسيق
- **مرن**: دعم المتغيرات والتخصيص
- **جاهز**: مكونات جاهزة للاستخدام
- **قابل للتوسع**: إضافة لغات جديدة بسهولة

---

## 🆘 الدعم السريع

إذا واجهت مشاكل:
1. راجع `/test-translation`
2. تحقق من `TRANSLATION_GUIDE.md`
3. تأكد من وجود `TranslationProvider` في layout 
