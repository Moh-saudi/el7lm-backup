# حل مشكلة رفع ملفات الإعلانات

## المشكلة

عند محاولة رفع ملفات الإعلانات، تظهر رسالة خطأ:
```
Error uploading ad file: {statusCode: '403', error: 'Unauthorized', message: 'new row violates row-level security policy'}
```

## السبب

المشكلة ناتجة عن عدم إعداد سياسات الأمان (Row Level Security) بشكل صحيح في Supabase Storage.

## الحل

### الخطوة 1: إنشاء Bucket الإعلانات

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. انتقل إلى **Storage** من القائمة الجانبية
4. انقر على **New Bucket**
5. أدخل المعلومات التالية:
   - **Name**: `ads`
   - **Public bucket**: ✅ مفعل
   - **File size limit**: `100MB`
   - **Allowed MIME types**: اتركه فارغاً

### الخطوة 2: إنشاء السياسات

1. انتقل إلى **SQL Editor** في Supabase Dashboard
2. انسخ والصق محتوى ملف `supabase-ads-policies.sql`
3. اضغط **Run** لتنفيذ الأوامر

أو يمكنك إنشاء السياسات يدوياً:

#### من خلال Storage Policies:
1. انتقل إلى **Storage** > **Policies**
2. اختر bucket `ads`
3. انقر على **New Policy**
4. أضف السياسات التالية:

**سياسة القراءة العامة:**
- Policy Name: `Public Access to Ads`
- Allowed operation: `SELECT`
- Target roles: `public`
- Policy definition: `bucket_id = 'ads'`

**سياسة الرفع للمصادقين:**
- Policy Name: `Authenticated Upload Ads`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'ads'`

**سياسة التحديث للمصادقين:**
- Policy Name: `Authenticated Update Ads`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'ads'`

**سياسة الحذف للمصادقين:**
- Policy Name: `Authenticated Delete Ads`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'ads'`

### الخطوة 3: التحقق من المصادقة

تأكد من أن:
1. المستخدم مسجل الدخول في Firebase
2. Firebase Auth يعمل بشكل صحيح
3. المستخدم لديه صلاحيات admin

### الخطوة 4: اختبار النظام

1. أعد تحميل صفحة الإعلانات
2. جرب رفع ملف صورة أو فيديو
3. تأكد من عدم ظهور رسائل خطأ

## التحديثات المطبقة

✅ **إضافة مصادقة Firebase** لجميع عمليات Storage
✅ **تحسين رسائل الخطأ** لتكون أكثر وضوحاً
✅ **إضافة التحقق من حالة المستخدم** قبل العمليات
✅ **تحسين سياسات الأمان** في Supabase
✅ **إضافة ملفات SQL جاهزة** لإنشاء السياسات

## استكشاف الأخطاء

### إذا استمرت المشكلة:

1. **تحقق من Bucket:**
   - تأكد من وجود bucket باسم `ads` بالضبط
   - تأكد من أنه عام (public)

2. **تحقق من السياسات:**
   - تأكد من وجود جميع السياسات المطلوبة
   - تأكد من أن السياسات تستهدف bucket `ads`

3. **تحقق من المصادقة:**
   - تأكد من تسجيل الدخول
   - تأكد من أن Firebase Auth يعمل

4. **تحقق من Console:**
   - افتح Developer Tools
   - تحقق من رسائل الخطأ في Console
   - تحقق من Network tab للطلبات الفاشلة

## الملفات المحدثة

- `src/lib/supabase/ads-storage.ts` - إضافة مصادقة Firebase
- `src/components/ads/AdFileUpload.tsx` - تحسين معالجة الأخطاء
- `src/app/dashboard/admin/ads/page.tsx` - تحسين رسائل التنبيه
- `ADS_STORAGE_SETUP.md` - تحديث الإرشادات
- `supabase-ads-policies.sql` - ملف SQL جاهز للسياسات

## ملاحظات مهمة

- النظام يستخدم Firebase Authentication للمصادقة
- جميع عمليات Storage تتطلب مصادقة المستخدم
- الملفات المرفوعة ستكون متاحة للجميع عبر الروابط العامة
- احرص على مراقبة استخدام التخزين

