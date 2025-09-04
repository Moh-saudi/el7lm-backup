# حل مشكلة Row Level Security Policy في Supabase Storage

## 🚨 المشكلة الحالية
```
Error: new row violates row-level security policy
Status: 403 Unauthorized
```

## 🔧 الحل الشامل

### الخطوة 1: حذف السياسات القديمة
```sql
-- احذف جميع السياسات الموجودة على storage.objects
DROP POLICY IF EXISTS "Public Access to Ads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload ads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update ads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete ads" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for users based on email" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON storage.objects;
```

### الخطوة 2: إنشاء سياسات جديدة صحيحة
```sql
-- 1. سياسة القراءة العامة لجميع الملفات في bucket "ads"
CREATE POLICY "Public read access for ads bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'ads');

-- 2. سياسة الرفع للجميع في bucket "ads"
CREATE POLICY "Public insert access for ads bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'ads');

-- 3. سياسة التحديث للجميع في bucket "ads"
CREATE POLICY "Public update access for ads bucket" ON storage.objects
FOR UPDATE USING (bucket_id = 'ads');

-- 4. سياسة الحذف للجميع في bucket "ads"
CREATE POLICY "Public delete access for ads bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'ads');
```

### الخطوة 3: التحقق من إعدادات Bucket
```sql
-- تحقق من أن bucket "ads" موجود وعام
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'ads';
```

### الخطوة 4: إعادة إنشاء Bucket إذا لزم الأمر
إذا لم يكن bucket موجود أو كان هناك مشاكل:

```sql
-- 1. احذف bucket إذا كان موجود
DROP BUCKET IF EXISTS ads;

-- 2. أنشئ bucket جديد
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ads',
    'ads',
    true,
    104857600, -- 100MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
);
```

## 🔍 خطوات التحقق

### 1. التحقق من وجود Bucket
```sql
SELECT * FROM storage.buckets WHERE name = 'ads';
```

### 2. التحقق من السياسات
```sql
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

### 3. اختبار الرفع
```javascript
// في console المتصفح
const { data, error } = await supabase.storage
  .from('ads')
  .upload('test.txt', 'Hello World');

console.log('Test upload result:', { data, error });
```

## 🛠️ حلول بديلة

### الحل البديل 1: تعطيل RLS مؤقتاً
```sql
-- تحذير: هذا يجعل جميع الملفات متاحة للجميع
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### الحل البديل 2: سياسات أكثر تساهلاً
```sql
-- سياسة تسمح بالوصول للجميع
CREATE POLICY "Allow all operations for all users" ON storage.objects
FOR ALL USING (true) WITH CHECK (true);
```

## 📋 قائمة التحقق

- [ ] حذف السياسات القديمة
- [ ] إنشاء السياسات الجديدة
- [ ] التحقق من وجود bucket "ads"
- [ ] التأكد من أن bucket عام (public = true)
- [ ] اختبار رفع ملف صغير
- [ ] التحقق من عدم وجود أخطاء في console

## 🚀 الأوامر السريعة

### في Supabase SQL Editor:
```sql
-- حذف وإعادة إنشاء السياسات
DROP POLICY IF EXISTS "Public read access for ads bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public insert access for ads bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for ads bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for ads bucket" ON storage.objects;

CREATE POLICY "Public read access for ads bucket" ON storage.objects FOR SELECT USING (bucket_id = 'ads');
CREATE POLICY "Public insert access for ads bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ads');
CREATE POLICY "Public update access for ads bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'ads');
CREATE POLICY "Public delete access for ads bucket" ON storage.objects FOR DELETE USING (bucket_id = 'ads');
```

## ⚠️ ملاحظات مهمة

1. **تأكد من أن bucket "ads" عام** (public = true)
2. **السياسات يجب أن تكون محددة لـ bucket "ads" فقط**
3. **تجنب السياسات العامة التي تؤثر على جميع buckets**
4. **اختبر دائماً بعد تطبيق السياسات**

## 🔗 روابط مفيدة

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Policies Examples](https://supabase.com/docs/guides/storage/policies)

