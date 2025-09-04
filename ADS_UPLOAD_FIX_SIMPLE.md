# حل مشكلة رفع ملفات الإعلانات - الطريقة البسيطة

## المشكلة

عند محاولة رفع ملفات الإعلانات، تظهر رسالة خطأ:
```
Error uploading ad file: {statusCode: '403', error: 'Unauthorized', message: 'new row violates row-level security policy'}
```

## السبب

المشكلة ناتجة عن محاولة استخدام مصادقة Firebase مع Supabase Storage، مما يسبب تضارب في المصادقة.

## الحل البسيط

تم تبسيط النظام ليعمل مباشرة مع Supabase Storage بدون مصادقة معقدة.

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

### الخطوة 2: إنشاء السياسات البسيطة

1. انتقل إلى **SQL Editor** في Supabase Dashboard
2. انسخ والصق محتوى ملف `supabase-ads-policies-simple.sql`
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

**سياسة الرفع للجميع:**
- Policy Name: `Anyone can upload ads`
- Allowed operation: `INSERT`
- Target roles: `public`
- Policy definition: `bucket_id = 'ads'`

**سياسة التحديث للجميع:**
- Policy Name: `Anyone can update ads`
- Allowed operation: `UPDATE`
- Target roles: `public`
- Policy definition: `bucket_id = 'ads'`

**سياسة الحذف للجميع:**
- Policy Name: `Anyone can delete ads`
- Allowed operation: `DELETE`
- Target roles: `public`
- Policy definition: `bucket_id = 'ads'`

### الخطوة 3: التحقق من متغيرات البيئة

تأكد من أن ملف `.env` يحتوي على متغيرات Supabase الصحيحة:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### الخطوة 4: اختبار النظام

1. أعد تحميل صفحة الإعلانات
2. جرب رفع ملف صورة أو فيديو
3. تأكد من عدم ظهور رسائل خطأ

## التحديثات المطبقة

✅ **إزالة مصادقة Firebase المعقدة**
✅ **تبسيط سياسات Supabase Storage**
✅ **تحسين رسائل الخطأ**
✅ **إضافة ملفات SQL بسيطة للسياسات**
✅ **تحديث الإرشادات للطريقة الجديدة**

## استكشاف الأخطاء

### إذا استمرت المشكلة:

1. **تحقق من Bucket:**
   - تأكد من وجود bucket باسم `ads` بالضبط
   - تأكد من أنه عام (public)

2. **تحقق من السياسات:**
   - تأكد من وجود جميع السياسات المطلوبة
   - تأكد من أن السياسات تستهدف bucket `ads`
   - تأكد من أن السياسات تسمح بالوصول العام

3. **تحقق من متغيرات البيئة:**
   - تأكد من صحة `NEXT_PUBLIC_SUPABASE_URL`
   - تأكد من صحة `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **تحقق من Console:**
   - افتح Developer Tools
   - تحقق من رسائل الخطأ في Console
   - تحقق من Network tab للطلبات الفاشلة

## الملفات المحدثة

- `src/lib/supabase/ads-storage.ts` - إزالة مصادقة Firebase
- `src/components/ads/AdFileUpload.tsx` - تحسين معالجة الأخطاء
- `src/app/dashboard/admin/ads/page.tsx` - تحديث رسائل التنبيه
- `ADS_STORAGE_SETUP.md` - تحديث الإرشادات
- `supabase-ads-policies-simple.sql` - ملف SQL بسيط للسياسات

## ملاحظات مهمة

- النظام يستخدم Supabase Storage مباشرة بدون مصادقة معقدة
- جميع عمليات Storage تعمل بدون الحاجة لتسجيل الدخول
- الملفات المرفوعة ستكون متاحة للجميع عبر الروابط العامة
- احرص على مراقبة استخدام التخزين
- يمكن إضافة المزيد من التحقق من الأمان حسب الحاجة

## الفرق بين الطريقتين

### الطريقة القديمة (معقدة):
- تستخدم Firebase Authentication
- تحتاج إلى سياسات مصادقة معقدة
- تتطلب تسجيل الدخول
- أكثر أماناً ولكن معقدة

### الطريقة الجديدة (بسيطة):
- تستخدم Supabase Storage مباشرة
- سياسات بسيطة للوصول العام
- لا تحتاج تسجيل دخول
- أبسط وأسرع في الإعداد

