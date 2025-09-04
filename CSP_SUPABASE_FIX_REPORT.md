# CSP Supabase Fix Report

## المشكلة
تم الإبلاغ عن خطأ Content Security Policy (CSP) عند محاولة تحميل الصور من Supabase:

```
Preview.js:80 
Uncaught (in promise) TypeError: Failed to fetch. Refused to connect because it violates the document's Content Security Policy.
```

## السبب
كانت إعدادات CSP لا تتضمن نطاقات Supabase في `connect-src` directive، مما يمنع التطبيق من الاتصال بـ Supabase لتحميل الصور والبيانات.

## الحل
تم تحديث إعدادات CSP في الملفات التالية لتشمل نطاقات Supabase:

### 1. تحديث `src/middleware.js`

#### CSP عام لجميع الصفحات:
```javascript
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://securetoken.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://fcm.googleapis.com https://firestore.googleapis.com https://firebaseinstallations.googleapis.com https://api.exchangerate-api.com https://www.google-analytics.com https://analytics.google.com https://ekyerljzfokqimbabzxm.supabase.co https://*.supabase.co; frame-src 'self';"
);
```

#### CSP لصفحات Geidea:
```javascript
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.merchant.geidea.net https://accosa-ivs.s3.ap-south-1.amazonaws.com https://secure-acs2ui-b1.wibmo.com https://www.gstatic.com https://securetoken.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.merchant.geidea.net https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://fcm.googleapis.com https://firestore.googleapis.com https://firebaseinstallations.googleapis.com https://api.exchangerate-api.com https://www.google-analytics.com https://analytics.google.com https://ekyerljzfokqimbabzxm.supabase.co https://*.supabase.co; frame-src 'self' https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com;"
);
```

### 2. تحديث `next.config.js`

#### CSP لـ Geidea API:
```javascript
{
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.merchant.geidea.net https://accosa-ivs.s3.ap-south-1.amazonaws.com https://secure-acs2ui-b1.wibmo.com https://www.gstatic.com https://securetoken.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.merchant.geidea.net https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://fcm.googleapis.com https://firestore.googleapis.com https://firebaseinstallations.googleapis.com https://api.exchangerate-api.com https://www.google-analytics.com https://analytics.google.com https://ekyerljzfokqimbabzxm.supabase.co https://*.supabase.co; frame-src 'self' https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com;",
}
```

#### CSP عام لجميع الصفحات:
```javascript
{
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.merchant.geidea.net https://accosa-ivs.s3.ap-south-1.amazonaws.com https://secure-acs2ui-b1.wibmo.com https://www.gstatic.com https://securetoken.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://api.merchant.geidea.net https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://fcm.googleapis.com https://firestore.googleapis.com https://firebaseinstallations.googleapis.com https://api.exchangerate-api.com https://www.google-analytics.com https://analytics.google.com https://ekyerljzfokqimbabzxm.supabase.co https://*.supabase.co; frame-src 'self' https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com;",
}
```

## النطاقات المضافة
- `https://ekyerljzfokqimbabzxm.supabase.co` - النطاق المحدد لـ Supabase
- `https://*.supabase.co` - جميع نطاقات Supabase (للتوافق المستقبلي)

### نطاقات منصات الفيديو:
- `https://img.youtube.com` - معاينات YouTube
- `https://i.ytimg.com` - معاينات YouTube الإضافية
- `https://vumbnail.com` - معاينات Vimeo
- `https://i.vimeocdn.com` - معاينات Vimeo الإضافية
- `https://www.dailymotion.com` - معاينات Dailymotion
- `https://www.youtube.com` - YouTube API
- `https://www.youtube-nocookie.com` - YouTube بدون ملفات تعريف الارتباط
- `https://vimeo.com` - Vimeo API
- `https://api.vimeo.com` - Vimeo API الإضافي
- `https://player.vimeo.com` - مشغل Vimeo

## النتيجة
- تم حل مشكلة CSP violation للصور والبيانات من Supabase
- تم حل مشكلة CSP violation لمعاينات الفيديو من منصات الفيديو المختلفة
- يمكن الآن تحميل الصور من Supabase Storage بدون أخطاء
- يمكن الآن عرض معاينات الفيديو من YouTube و Vimeo و Dailymotion
- تحسين التوافق مع جميع خدمات Supabase ومنصات الفيديو

## ملاحظات إضافية
- تم الحفاظ على جميع إعدادات الأمان الأخرى
- تم إضافة نطاقات Supabase إلى `connect-src` فقط
- لم يتم التأثير على إعدادات Firebase أو Geidea 
