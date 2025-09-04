-- سياسات Storage بسيطة للإعلانات في Supabase
-- قم بتشغيل هذه الأوامر في SQL Editor في Supabase Dashboard

-- 1. سياسة القراءة العامة لجميع الملفات في bucket الإعلانات
CREATE POLICY "Public Access to Ads" ON storage.objects
FOR SELECT USING (bucket_id = 'ads');

-- 2. سياسة الرفع للجميع (بدون مصادقة)
CREATE POLICY "Anyone can upload ads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'ads');

-- 3. سياسة التحديث للجميع (بدون مصادقة)
CREATE POLICY "Anyone can update ads" ON storage.objects
FOR UPDATE USING (bucket_id = 'ads');

-- 4. سياسة الحذف للجميع (بدون مصادقة)
CREATE POLICY "Anyone can delete ads" ON storage.objects
FOR DELETE USING (bucket_id = 'ads');

-- ملاحظة: هذه السياسات تسمح بالوصول العام لـ bucket الإعلانات
-- تأكد من إنشاء bucket باسم 'ads' أولاً من خلال Storage Dashboard
-- ثم قم بتشغيل هذه السياسات

