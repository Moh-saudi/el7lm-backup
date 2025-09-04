-- سياسات Storage للإعلانات في Supabase
-- قم بتشغيل هذه الأوامر في SQL Editor في Supabase Dashboard

-- 1. سياسة القراءة العامة لجميع الملفات في bucket الإعلانات
CREATE POLICY "Public Access to Ads" ON storage.objects
FOR SELECT USING (bucket_id = 'ads');

-- 2. سياسة الرفع للمستخدمين المصادق عليهم فقط
CREATE POLICY "Authenticated users can upload ads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ads' 
  AND auth.role() = 'authenticated'
);

-- 3. سياسة التحديث للمستخدمين المصادق عليهم فقط
CREATE POLICY "Authenticated users can update ads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'ads' 
  AND auth.role() = 'authenticated'
);

-- 4. سياسة الحذف للمستخدمين المصادق عليهم فقط
CREATE POLICY "Authenticated users can delete ads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'ads' 
  AND auth.role() = 'authenticated'
);

-- ملاحظة: تأكد من إنشاء bucket باسم 'ads' أولاً من خلال Storage Dashboard
-- ثم قم بتشغيل هذه السياسات

