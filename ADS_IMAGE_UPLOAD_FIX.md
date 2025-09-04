# حل مشكلة رفع الصور في صفحة الإعلانات

## المشاكل التي تم حلها

### 1. مشكلة رفع الصور
- تم تحسين معالجة الأخطاء في مكون `AdFileUpload`
- تم إضافة زر إعادة المحاولة عند فشل الرفع
- تم تحسين رسائل الخطأ لتكون أكثر وضوحاً
- تم إضافة فحص تلقائي لوجود bucket الإعلانات

### 2. ضبط مقاسات الحقول
- تم تقليل ارتفاع الحقول من `h-16` إلى `h-12`
- تم تقليل حجم النص من `text-lg` إلى `text-base`
- تم تقليل عدد صفوف وصف الإعلان من 6 إلى 4
- تم تحسين المسافات بين العناصر

### 3. ضبط مقاسات الكروت
- تم تغيير تخطيط الشبكة من `lg:grid-cols-3` إلى `xl:grid-cols-3`
- تم تقليل المسافة بين الكروت من `gap-6` إلى `gap-4`
- تم إضافة `max-w-sm mx-auto` للكروت لضبط العرض
- تم تقليل تأثير hover من `hover:scale-105` إلى `hover:scale-102`

## خطوات إعداد Supabase Storage

### الخطوة 1: إنشاء Bucket الإعلانات
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. انتقل إلى **Storage** من القائمة الجانبية
4. انقر على **New Bucket**
5. أدخل اسم Bucket: `ads`
6. اضبط **Public bucket** على `true`
7. انقر على **Create bucket**

### الخطوة 2: إنشاء السياسات
1. انتقل إلى **SQL Editor** في Supabase Dashboard
2. انسخ محتوى ملف `supabase-ads-policies-simple.sql`
3. الصق الكود في المحرر
4. انقر على **Run** لتنفيذ السياسات

### الخطوة 3: التحقق من الإعدادات
1. انتقل إلى **Storage** > **Policies**
2. تأكد من وجود السياسات التالية لـ bucket `ads`:
   - `Public Access to Ads` (SELECT)
   - `Anyone can upload ads` (INSERT)
   - `Anyone can update ads` (UPDATE)
   - `Anyone can delete ads` (DELETE)

## التحسينات المضافة

### 1. معالجة أفضل للأخطاء
```typescript
// رسائل خطأ مفصلة حسب نوع المشكلة
if (error.message.includes('not found')) {
  return { error: 'bucket الإعلانات غير موجود. يرجى إنشاؤه في Supabase Dashboard.' };
} else if (error.message.includes('permission')) {
  return { error: 'لا توجد صلاحيات كافية لرفع الملف. يرجى التحقق من سياسات Storage.' };
}
```

### 2. زر إعادة المحاولة
- تم إضافة زر إعادة المحاولة عند فشل الرفع
- يتم عرض عدد المحاولات
- إعادة تعيين تلقائية لحالة الرفع

### 3. تحسينات الواجهة
- مقاسات حقول أكثر ملاءمة
- كروت بحجم محسن
- مسافات متناسقة
- تأثيرات hover محسنة

## استكشاف الأخطاء

### إذا لم تعمل رفع الصور:

1. **تحقق من وجود Bucket:**
   ```bash
   # في console المتصفح
   console.log('Checking bucket status...');
   ```

2. **تحقق من السياسات:**
   - تأكد من تشغيل ملف SQL السياسات
   - تحقق من وجود السياسات في Storage > Policies

3. **تحقق من المتغيرات البيئية:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **تحقق من نوع الملف:**
   - الصور: JPG, PNG, WebP, GIF
   - الفيديوهات: MP4, WebM, OGG, AVI, MOV

5. **تحقق من حجم الملف:**
   - الصور: الحد الأقصى 10MB
   - الفيديوهات: الحد الأقصى 100MB

## الملفات المعدلة

1. `src/app/dashboard/admin/ads/page.tsx` - تحسين مقاسات الحقول والكروت
2. `src/components/ads/AdFileUpload.tsx` - تحسين معالجة الأخطاء وإضافة زر إعادة المحاولة
3. `src/lib/supabase/ads-storage.ts` - تحسين معالجة الأخطاء وإضافة فحص Bucket

## ملاحظات مهمة

- تأكد من إنشاء bucket الإعلانات قبل استخدام الميزة
- السياسات المطلوبة موجودة في ملف `supabase-ads-policies-simple.sql`
- تم إضافة رسائل خطأ مفصلة لتسهيل استكشاف المشاكل
- تم تحسين تجربة المستخدم مع مقاسات أكثر ملاءمة

