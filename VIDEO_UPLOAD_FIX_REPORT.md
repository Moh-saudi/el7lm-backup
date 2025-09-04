# تقرير إصلاح مشكلة رفع الفيديوهات

## المشكلة الأصلية
كانت المشكلة تتعلق بـ CORS (Cross-Origin Resource Sharing) عند محاولة رفع الفيديوهات إلى Firebase Storage مباشرة من المتصفح. كانت الرسالة الخطأ:

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/v0/b/hagzzgo-87884.appspot.com/o?name=videos%2FTnSvLJgehmftXNY024Y0cjib6NI3%2F1754256652589_________________.mp4' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
```

## الحل المطبق

### 1. إنشاء نظام رفع الفيديوهات باستخدام Supabase Storage

#### أ. إنشاء ملف `src/lib/supabase/video-storage.ts`
- إنشاء دوال شاملة لرفع وحذف الفيديوهات
- التحقق من صحة الملفات (الحجم، النوع، الاسم)
- إنشاء معاينات مصغرة للفيديوهات
- الحصول على معلومات الفيديو

#### ب. إنشاء API Route للرفع من جانب الخادم
- إنشاء `src/app/api/upload/video/route.ts`
- معالجة رفع الفيديوهات من جانب الخادم لتجنب مشاكل CORS
- دعم حذف الفيديوهات عبر API
- التحقق من صحة الملفات والصلاحيات

### 2. تحديث VideoManager Component

#### أ. تحديث `src/components/video/VideoManager.tsx`
- استبدال Firebase Storage بـ Supabase Storage
- استخدام API routes بدلاً من الرفع المباشر
- تحسين معالجة الأخطاء والرسائل
- إضافة تتبع أفضل للتقدم

### 3. تحديث إعدادات CORS

#### أ. تحديث `next.config.js`
- إضافة headers لـ CORS لـ `/api/upload/*`
- تحسين إعدادات الأمان

#### ب. تحديث `src/middleware.js`
- إضافة معالجة CORS لـ API routes الجديدة
- تحسين معالجة preflight requests

### 4. تحديث إعدادات Supabase

#### أ. تحديث `src/lib/supabase/config.tsx`
- إضافة buckets جديدة للفيديوهات
- تنظيم أفضل لأنواع التخزين

## المميزات الجديدة

### 1. أمان محسن
- رفع الفيديوهات من جانب الخادم
- التحقق من الصلاحيات
- معالجة أفضل للأخطاء

### 2. أداء محسن
- استخدام Supabase Storage الأسرع
- تحسين حجم الملفات
- معاينات مصغرة تلقائية

### 3. تجربة مستخدم محسنة
- رسائل خطأ واضحة باللغة العربية
- تتبع تقدم الرفع
- معالجة أفضل للأخطاء

## كيفية الاستخدام

### 1. رفع فيديو
```typescript
// في VideoManager component
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', currentUser.uid);

  const response = await fetch('/api/upload/video', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  // استخدام result.url للفيديو المرفوع
};
```

### 2. حذف فيديو
```typescript
const response = await fetch(`/api/upload/video?url=${encodeURIComponent(videoUrl)}`, {
  method: 'DELETE',
});
```

## إعدادات Supabase المطلوبة

### 1. إنشاء Storage Buckets
```sql
-- إنشاء bucket للفيديوهات
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true);

-- إنشاء bucket لفيديوهات اللاعبين
INSERT INTO storage.buckets (id, name, public) 
VALUES ('player-videos', 'player-videos', true);
```

### 2. إعداد RLS Policies
```sql
-- السماح بالقراءة العامة للفيديوهات
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

-- السماح بالرفع للمستخدمين المسجلين
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- السماح بالحذف لمالك الفيديو
CREATE POLICY "Users can delete own videos" ON storage.objects
FOR DELETE USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## الاختبار

### 1. اختبار الرفع
- رفع فيديو بحجم أقل من 100MB
- التحقق من نوع الملف المدعوم
- التأكد من الحصول على رابط صحيح

### 2. اختبار الحذف
- حذف فيديو مرفوع
- التأكد من حذفه من Storage
- التحقق من إزالته من القائمة

### 3. اختبار الأخطاء
- محاولة رفع ملف كبير جداً
- محاولة رفع نوع ملف غير مدعوم
- اختبار بدون تسجيل دخول

## النتائج المتوقعة

1. **حل مشكلة CORS**: لن تظهر أخطاء CORS عند رفع الفيديوهات
2. **أداء محسن**: رفع أسرع وأكثر استقراراً
3. **أمان محسن**: رفع من جانب الخادم مع التحقق من الصلاحيات
4. **تجربة مستخدم محسنة**: رسائل خطأ واضحة وتتبع تقدم الرفع

## الخطوات التالية

1. اختبار الحل في بيئة التطوير
2. نشر التحديثات إلى بيئة الإنتاج
3. مراقبة الأداء والأخطاء
4. جمع ملاحظات المستخدمين
5. تحسين إضافي حسب الحاجة 
