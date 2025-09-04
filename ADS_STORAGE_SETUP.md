# إعداد Storage للإعلانات في Supabase

## نظرة عامة

تم إضافة ميزة رفع ملفات الإعلانات (صور وفيديوهات) باستخدام Supabase Storage. هذا يتطلب إعداد bucket مخصص للإعلانات مع سياسات أمان بسيطة.

## الخطوات المطلوبة

### 1. إنشاء Bucket في Supabase

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. انتقل إلى **Storage** من القائمة الجانبية
4. انقر على **New Bucket**
5. أدخل المعلومات التالية:
   - **Name**: `ads`
   - **Public bucket**: ✅ مفعل
   - **File size limit**: `100MB` (أو حسب احتياجاتك)
   - **Allowed MIME types**: اتركه فارغاً للسماح بجميع الأنواع

### 2. إعداد السياسات (Policies) - الطريقة البسيطة

بعد إنشاء bucket، تحتاج إلى إعداد السياسات للوصول العام:

#### سياسة للقراءة العامة (SELECT)
```sql
-- السماح بالقراءة العامة لجميع الملفات في bucket الإعلانات
CREATE POLICY "Public Access to Ads" ON storage.objects
FOR SELECT USING (bucket_id = 'ads');
```

#### سياسة للكتابة للجميع (INSERT)
```sql
-- السماح بالرفع للجميع (بدون مصادقة)
CREATE POLICY "Anyone can upload ads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'ads');
```

#### سياسة للتحديث للجميع (UPDATE)
```sql
-- السماح بالتحديث للجميع (بدون مصادقة)
CREATE POLICY "Anyone can update ads" ON storage.objects
FOR UPDATE USING (bucket_id = 'ads');
```

#### سياسة للحذف للجميع (DELETE)
```sql
-- السماح بالحذف للجميع (بدون مصادقة)
CREATE POLICY "Anyone can delete ads" ON storage.objects
FOR DELETE USING (bucket_id = 'ads');
```

### 3. إعداد السياسات من خلال Dashboard

بدلاً من كتابة SQL، يمكنك إعداد السياسات من خلال واجهة Supabase:

1. انتقل إلى **Storage** > **Policies**
2. اختر bucket `ads`
3. انقر على **New Policy**
4. اختر **Create a policy from scratch**
5. أضف السياسات التالية:

#### سياسة القراءة العامة:
- **Policy Name**: `Public Access to Ads`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **Policy definition**: `bucket_id = 'ads'`

#### سياسة الرفع للجميع:
- **Policy Name**: `Anyone can upload ads`
- **Allowed operation**: `INSERT`
- **Target roles**: `public`
- **Policy definition**: `bucket_id = 'ads'`

#### سياسة التحديث للجميع:
- **Policy Name**: `Anyone can update ads`
- **Allowed operation**: `UPDATE`
- **Target roles**: `public`
- **Policy definition**: `bucket_id = 'ads'`

#### سياسة الحذف للجميع:
- **Policy Name**: `Anyone can delete ads`
- **Allowed operation**: `DELETE`
- **Target roles**: `public`
- **Policy definition**: `bucket_id = 'ads'`

### 4. التحقق من متغيرات البيئة

تأكد من أن ملف `.env` يحتوي على متغيرات Supabase الصحيحة:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## هيكل المجلدات

سيتم تنظيم الملفات في bucket `ads` كالتالي:

```
ads/
├── images/
│   ├── ad_123_1703123456789.jpg
│   ├── ad_456_1703123456790.png
│   └── ...
└── videos/
    ├── ad_789_1703123456791.mp4
    ├── ad_101_1703123456792.webm
    └── ...
```

## أنواع الملفات المدعومة

### الصور
- **الأنواع**: JPG, JPEG, PNG, WebP, GIF
- **الحد الأقصى**: 10MB
- **المجلد**: `images/`

### الفيديوهات
- **الأنواع**: MP4, WebM, OGG, AVI, MOV
- **الحد الأقصى**: 100MB
- **المجلد**: `videos/`

## الميزات المضافة

### 1. مكون رفع الملفات (`AdFileUpload`)
- واجهة سحب وإفلات
- شريط تقدم الرفع
- التحقق من نوع وحجم الملف
- رسائل خطأ ونجاح واضحة
- **بدون مصادقة معقدة**

### 2. دوال إدارة الملفات
- `uploadAdFile()`: رفع ملف جديد بدون مصادقة
- `deleteAdFile()`: حذف ملف موجود بدون مصادقة
- `getAdFiles()`: قائمة ملفات الإعلان بدون مصادقة
- `getAdsStorageStats()`: إحصائيات التخزين بدون مصادقة

### 3. تكامل مع صفحة الإعلانات
- رفع مباشر من نموذج الإعلان
- عرض الملفات المرفوعة
- إمكانية الحذف
- دعم الروابط الخارجية كبديل

## استكشاف الأخطاء

### مشكلة: "bucket not found"
**الحل**: تأكد من إنشاء bucket باسم `ads` بالضبط

### مشكلة: "permission denied" أو "Unauthorized"
**الحل**: 
1. تأكد من إعداد السياسات بشكل صحيح
2. تأكد من أن السياسات تسمح بالوصول العام
3. تأكد من أن متغيرات البيئة صحيحة

### مشكلة: "new row violates row-level security policy"
**الحل**: 
1. تأكد من إعداد سياسات RLS بشكل صحيح
2. تأكد من أن السياسات تسمح بالعمليات المطلوبة
3. استخدم السياسات البسيطة المذكورة أعلاه

### مشكلة: "file too large"
**الحل**: تحقق من حد حجم الملف في إعدادات bucket

### مشكلة: "invalid file type"
**الحل**: تأكد من أن نوع الملف مدعوم

## اختبار النظام

1. تأكد من تسجيل الدخول كـ admin
2. أنشئ إعلان جديد
3. اختر نوع "صورة" أو "فيديو"
4. جرب رفع ملف
5. تحقق من ظهور الملف في Supabase Storage
6. اختبر عرض الإعلان في الصفحة الرئيسية

## ملاحظات مهمة

- تأكد من أن bucket `ads` عام (public) للقراءة
- الملفات المرفوعة ستكون متاحة للجميع عبر الروابط العامة
- احرص على مراقبة استخدام التخزين لتجنب تجاوز الحدود
- النظام يستخدم Supabase Storage مباشرة بدون مصادقة معقدة
- يمكن إضافة المزيد من التحقق من الأمان حسب الحاجة

## التحديثات الأخيرة

- ✅ إزالة مصادقة Firebase المعقدة
- ✅ تبسيط سياسات Supabase Storage
- ✅ تحسين رسائل الخطأ
- ✅ إضافة ملفات SQL بسيطة للسياسات
- ✅ تحديث الإرشادات للطريقة الجديدة
