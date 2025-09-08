# Microsoft Clarity Analytics Setup

## 📊 نظرة عامة

تم إضافة Microsoft Clarity إلى المشروع لتتبع سلوك المستخدمين وتحليل التفاعلات على الموقع.

## 🚀 الإعداد

### 1. إنشاء مشروع Clarity

1. اذهب إلى [Microsoft Clarity](https://clarity.microsoft.com/)
2. سجل دخولك بحساب Microsoft
3. أنشئ مشروع جديد
4. احصل على Project ID من Settings > Overview

### 2. تحديث متغيرات البيئة

```bash
# في ملف .env.local
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_actual_project_id_here
```

### 3. المكونات المضافة

- `ClarityProvider.tsx` - مكون تهيئة Clarity
- `useClarity.ts` - Hook مخصص لاستخدام Clarity APIs

## 📈 الأحداث المتتبعة

### أحداث تلقائية:
- `messages_page_viewed` - عرض صفحة الرسائل
- `dashboard_page_viewed` - عرض لوحة التحكم
- `new_conversation_created` - إنشاء محادثة جديدة
- `message_sent` - إرسال رسالة
- `conversation_opened` - فتح محادثة

### Tags مخصصة:
- `user_type` - نوع المستخدم (player, club, academy, etc.)
- `account_status` - حالة الحساب
- `organization` - اسم المنظمة
- `conversation_type` - نوع المحادثة
- `message_length` - طول الرسالة
- `current_page` - الصفحة الحالية

## 🔧 الاستخدام

### استخدام Hook مخصص:

```tsx
import { useClarity } from '@/hooks/useClarity';

const MyComponent = () => {
  const { trackEvent, setTag, upgradeSession } = useClarity();

  const handleClick = () => {
    trackEvent('button_clicked');
    setTag('button_type', 'primary');
    upgradeSession('important_action');
  };

  return <button onClick={handleClick}>Click me</button>;
};
```

### APIs المتاحة:

- `trackEvent(eventName)` - تتبع حدث مخصص
- `setTag(key, value)` - تعيين علامة مخصصة
- `upgradeSession(reason)` - ترقية الجلسة للتسجيل
- `setConsent(consent)` - إدارة موافقة الكوكيز
- `identifyUser(id, sessionId, pageId, name)` - تحديد المستخدم

### HTML APIs:

- `data-clarity-mask="true"` - إخفاء المحتوى
- `data-clarity-unmask="true"` - إظهار المحتوى

### أمثلة متقدمة:

```tsx
import ClarityEventTracker from '@/components/analytics/ClarityEventTracker';
import ClarityMasking from '@/components/analytics/ClarityMasking';

// تتبع الأحداث مع ترقية الجلسة
<ClarityEventTracker
  eventName="purchase_completed"
  upgradeReason="high_value_conversion"
  customTags={{
    'product_category': 'electronics',
    'price_range': 'high'
  }}
>
  <button>شراء المنتج</button>
</ClarityEventTracker>

// إخفاء المحتوى الحساس
<ClarityMasking mask={true}>
  <form>
    <input type="password" />
  </form>
</ClarityMasking>

// إظهار المحتوى المهم
<ClarityMasking unmask={true}>
  <div>مراجعة المنتج</div>
</ClarityMasking>
```
- `setTag(key, value)` - إضافة tag مخصص
- `upgradeSession(reason)` - ترقية جلسة للتسجيل
- `setConsent(consent)` - تعيين موافقة الكوكيز
- `identifyUser(id, sessionId, pageId, name)` - تحديد هوية المستخدم

## 📊 البيانات المتاحة في Clarity

### Session Replays:
- تسجيلات كاملة لتفاعلات المستخدمين
- حركات الماوس والنقرات
- التمرير والتنقل

### Heatmaps:
- خريطة حرارية للنقرات
- خريطة حرارية للتمرير
- خريطة حرارية للحركة

### Insights:
- تحليل تلقائي للسلوك
- اكتشاف المشاكل في UX
- توصيات للتحسين

### Clarity Copilot:
- ملخصات ذكية للبيانات
- رؤى قابلة للتنفيذ
- تحليل تلقائي للاتجاهات

## 🔒 الخصوصية والأمان

- Clarity يحترم خصوصية المستخدمين
- البيانات مشفرة أثناء النقل
- يمكن تعطيل التتبع حسب الحاجة
- متوافق مع GDPR و CCPA

## 📱 الميزات المتقدمة

### تتبع المستخدمين المحددين:
```tsx
// في ClarityProvider.tsx
Clarity.identify(userId, sessionId, pageId, friendlyName);
```

### ترقية الجلسات المهمة:
```tsx
// ترقية جلسة عند إجراء مهم
Clarity.upgrade('purchase_completed');
```

### إدارة موافقة الكوكيز:
```tsx
// تعيين موافقة المستخدم
Clarity.consent(true);
```

## 🎯 أفضل الممارسات

1. **تتبع الأحداث المهمة فقط** - لا تتبع كل نقرة
2. **استخدم أسماء واضحة للأحداث** - `user_login` بدلاً من `ul`
3. **ترقية الجلسات المهمة** - للتركيز على التفاعلات القيمة
4. **مراجعة البيانات بانتظام** - لفهم سلوك المستخدمين
5. **احترم خصوصية المستخدمين** - لا تتبع معلومات حساسة

## 📊 Clarity API Integration

### إعداد API:
1. اذهب إلى [Clarity Dashboard](https://clarity.microsoft.com/)
2. اختر مشروعك
3. اذهب إلى Settings > API
4. احصل على API Key
5. أضف المتغيرات في `.env.local`:
   ```bash
   NEXT_PUBLIC_CLARITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_CLARITY_API_KEY=your_api_key
   ```

### استخدام API:
- **لوحة التحكم**: `/dashboard/admin/clarity`
- **تصدير البيانات**: CSV و JSON
- **الحد الأقصى**: 10 استدعاءات يومياً
- **البيانات المتاحة**: الجلسات، الرؤى، إحصائيات الصفحات

### المكونات المضافة:
- `ClarityApiService` - خدمة API
- `useClarityApi` - Hook للاستخدام
- `ClarityDashboard` - لوحة التحكم
- صفحة Admin للتحكم

## 🔗 روابط مفيدة

- [Microsoft Clarity Documentation](https://docs.microsoft.com/en-us/clarity/)
- [Clarity Dashboard](https://clarity.microsoft.com/)
- [Clarity API Documentation](https://www.clarity.ms/export-data/api/v1/project-live-insights)
- [Clarity Support](mailto:clarityms@microsoft.com)
- [Clarity Privacy Policy](https://privacy.microsoft.com/en-us/privacystatement)

## 📞 الدعم

للمساعدة في إعداد أو استخدام Clarity:
- راجع الوثائق الرسمية
- تواصل مع فريق الدعم
- استخدم Clarity Copilot للحصول على رؤى تلقائية
