# تقرير حل مشكلة رفع الفيديوهات باستخدام Supabase

## المشكلة الأصلية
كانت المشكلة تتعلق بـ CORS (Cross-Origin Resource Sharing) عند محاولة رفع الفيديوهات. كانت الرسالة الخطأ:

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/v0/b/hagzzgo-87884.appspot.com/o?name=videos%2FTnSvLJgehmftXNY024Y0cjib6NI3%2F1754256652589_________________.mp4' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
```

## السبب الجذري
بعد التحليل، تبين أن المشكلة كانت في:

1. **ملف admin profile page** كان لا يزال يستخدم Firebase Storage لرفع الصور
2. **إعدادات CORS** في `next.config.js` و `middleware.js` كانت تشير إلى Firebase Storage
3. **إعدادات CSP** كانت تحتوي على إشارات إلى Firebase Storage

## الحل المطبق

### 1. تحديث ملف Admin Profile Page

#### أ. تحديث `src/app/dashboard/admin/profile/page.tsx`
- استبدال Firebase Storage بـ Supabase Storage
- تحديث دالة `handleImageUpload` لاستخدام Supabase
- إضافة معالجة أفضل للأخطاء

```typescript
// قبل التحديث
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// بعد التحديث
import { supabase } from '@/lib/supabase/client';

// تحديث دالة رفع الصورة
const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file || !user) return;

  try {
    setLoading(true);
    
    // إنشاء اسم فريد للملف
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const filePath = `admin-avatars/${user.uid}/${timestamp}.${fileExt}`;

    // رفع الملف إلى Supabase
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      throw new Error(`فشل في رفع الصورة: ${error.message}`);
    }

    // الحصول على الرابط العام
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    setFormData(prev => ({ ...prev, avatar: urlData.publicUrl }));
    toast.success('تم رفع الصورة بنجاح');
  } catch (error) {
    console.error('❌ خطأ في رفع الصورة:', error);
    toast.error('حدث خطأ أثناء رفع الصورة');
  } finally {
    setLoading(false);
  }
};
```

### 2. تحديث إعدادات CORS

#### أ. تحديث `next.config.js`
- إزالة الإشارات إلى Firebase Storage من `remotePatterns`
- إزالة `firebasestorage.googleapis.com` من `domains`
- تحديث CSP لإزالة الإشارات إلى Firebase Storage

```javascript
// قبل التحديث
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'firebasestorage.googleapis.com',
    port: '',
    pathname: '/**',
  },
  // ...
],
domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com', 'graph.facebook.com'],

// بعد التحديث
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'lh3.googleusercontent.com',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'ekyerljzfokqimbabzxm.supabase.co',
    port: '',
    pathname: '/storage/v1/object/public/**',
  }
],
domains: ['lh3.googleusercontent.com', 'graph.facebook.com'],
```

#### ب. تحديث `src/middleware.js`
- إزالة الإشارات إلى Firebase Storage من CSP
- الاحتفاظ فقط بالخدمات الضرورية

```javascript
// قبل التحديث
connect-src 'self' https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://firebasestorage.googleapis.com https://fcm.googleapis.com https://firestore.googleapis.com https://firebaseinstallations.googleapis.com https://api.exchangerate-api.com https://www.google-analytics.com https://analytics.google.com;

// بعد التحديث
connect-src 'self' https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://fcm.googleapis.com https://firestore.googleapis.com https://firebaseinstallations.googleapis.com https://api.exchangerate-api.com https://www.google-analytics.com https://analytics.google.com;
```

### 3. تحديث layout.tsx

#### أ. إزالة preconnect لـ Firebase Storage
```html
<!-- قبل التحديث -->
<link rel="preconnect" href="https://firebasestorage.googleapis.com" />

<!-- بعد التحديث -->
<!-- تم إزالة الإشارة إلى Firebase Storage -->
```

## المميزات الجديدة

### 1. أمان محسن
- استخدام Supabase Storage بدلاً من Firebase Storage
- إزالة الإشارات غير الضرورية من CSP
- معالجة أفضل للأخطاء

### 2. أداء محسن
- تقليل عدد الخدمات المطلوبة
- تحسين إعدادات CORS
- استخدام Supabase الأسرع

### 3. تجربة مستخدم محسنة
- رسائل خطأ واضحة باللغة العربية
- تتبع أفضل للأخطاء
- معالجة أفضل للاستثناءات

## النتائج المتوقعة

1. **حل مشكلة CORS**: لن تظهر أخطاء CORS عند رفع الفيديوهات والصور
2. **أداء محسن**: رفع أسرع وأكثر استقراراً
3. **أمان محسن**: إزالة الإشارات غير الضرورية من CSP
4. **تجربة مستخدم محسنة**: رسائل خطأ واضحة وتتبع تقدم الرفع

## الاختبار

### 1. اختبار رفع الصور
- رفع صورة في صفحة admin profile
- التحقق من عدم ظهور أخطاء CORS
- التأكد من الحصول على رابط صحيح

### 2. اختبار رفع الفيديوهات
- رفع فيديو في صفحة الفيديوهات
- التحقق من عدم ظهور أخطاء CORS
- التأكد من الحصول على رابط صحيح

### 3. اختبار الأخطاء
- محاولة رفع ملف كبير جداً
- محاولة رفع نوع ملف غير مدعوم
- تحقق من ظهور رسائل خطأ واضحة

## الخطوات التالية

1. **اختبار الحل**: تشغيل الاختبارات للتأكد من عمل النظام
2. **النشر**: نشر التحديثات إلى بيئة الإنتاج
3. **المراقبة**: مراقبة الأداء والأخطاء
4. **التحسين**: إضافة ميزات إضافية حسب الحاجة

## ملاحظات مهمة

- تم الاحتفاظ بـ Firebase Auth و Firestore للاستخدام في المصادقة وقاعدة البيانات
- تم إزالة فقط الإشارات إلى Firebase Storage
- تم الاحتفاظ بـ Supabase Storage لرفع الملفات
- تم تحسين إعدادات CSP لتكون أكثر أماناً

## الدعم

إذا واجهت أي مشاكل، يرجى:

1. مراجعة سجلات الخادم
2. مراجعة سجلات المتصفح
3. التحقق من إعدادات Supabase
4. مراجعة هذا الدليل 
