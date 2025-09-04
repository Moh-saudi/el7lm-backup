-- =====================================================
-- حل مشكلة Row Level Security Policy في Supabase Storage
-- =====================================================

-- الخطوة 1: حذف جميع السياسات القديمة
DROP POLICY IF EXISTS "Public Access to Ads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload ads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update ads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete ads" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for users based on email" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for ads bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public insert access for ads bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for ads bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for ads bucket" ON storage.objects;

-- الخطوة 2: إنشاء سياسات جديدة صحيحة
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

-- الخطوة 3: التحقق من وجود bucket "ads"
-- إذا لم يكن موجود، قم بإنشائه
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ads',
    'ads',
    true,
    104857600, -- 100MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 104857600,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];

-- الخطوة 4: التحقق من النتائج
-- تحقق من وجود bucket
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'ads';

-- تحقق من السياسات المطبقة
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%ads%';

