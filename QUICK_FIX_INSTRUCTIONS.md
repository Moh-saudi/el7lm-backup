# 🚨 حل سريع لمشكلة رفع الصور

## المشكلة
```
Error: new row violates row-level security policy
Status: 403 Unauthorized
```

## الحل السريع (5 دقائق)

### 1. اذهب إلى Supabase Dashboard
- افتح https://supabase.com/dashboard
- اختر مشروعك

### 2. انتقل إلى SQL Editor
- من القائمة الجانبية، اضغط على "SQL Editor"
- اضغط على "New query"

### 3. انسخ والصق هذا الكود
```sql
-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Public Access to Ads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload ads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update ads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete ads" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for users based on email" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON storage.objects;

-- إنشاء سياسات جديدة
CREATE POLICY "Public read access for ads bucket" ON storage.objects FOR SELECT USING (bucket_id = 'ads');
CREATE POLICY "Public insert access for ads bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ads');
CREATE POLICY "Public update access for ads bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'ads');
CREATE POLICY "Public delete access for ads bucket" ON storage.objects FOR DELETE USING (bucket_id = 'ads');
```

### 4. اضغط Run
- اضغط على زر "Run" لتنفيذ الكود

### 5. اختبر الحل
- عد إلى صفحة الإعلانات
- جرب رفع صورة جديدة

## إذا لم يعمل الحل

### تحقق من وجود Bucket
```sql
SELECT * FROM storage.buckets WHERE name = 'ads';
```

### إذا لم يكن موجود، أنشئه
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ads',
    'ads',
    true,
    104857600,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
);
```

## صفحة الاختبار
استخدم صفحة الاختبار لفحص الحالة:
```
/test-storage-status
```

## إذا استمرت المشكلة
1. تحقق من متغيرات البيئة في `.env.local`
2. تأكد من أن Supabase URL و Key صحيحان
3. راجع ملف `SUPABASE_STORAGE_FIX.md` للحلول التفصيلية

## النتيجة المتوقعة
بعد تطبيق الحل، يجب أن تعمل رفع الصور بدون مشاكل! 🎉

