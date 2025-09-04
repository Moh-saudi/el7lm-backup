# تقرير إصلاح مشكلة Firestore CSP

## المشكلة المحددة

كانت هناك مشكلة في Content Security Policy (CSP) تمنع Firebase Firestore من الاتصال بالخادم المطلوب:

```
Refused to connect to 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?...' 
because it violates the following Content Security Policy directive: 
"connect-src 'self' https://firebase.googleapis.com https://securetoken.googleapis.com ..."
```

## السبب

نطاق `https://firestore.googleapis.com` لم يكن مدرجاً في قائمة `connect-src` في CSP، مما منع Firestore من الاتصال بالخادم.

## الإصلاح المطبق

### 1. تحديث `next.config.js`

#### إضافة `firestore.googleapis.com` إلى CSP العام:
```javascript
{
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://securetoken.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://firebasestorage.googleapis.com https://fcm.googleapis.com https://firestore.googleapis.com https://www.google-analytics.com https://analytics.google.com; frame-src 'self';"
}
```

#### إضافة `firestore.googleapis.com` إلى CSP لـ Geidea routes:
```javascript
{
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.merchant.geidea.net https://accosa-ivs.s3.ap-south-1.amazonaws.com https://secure-acs2ui-b1.wibmo.com https://www.gstatic.com https://securetoken.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.merchant.geidea.net https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://firebasestorage.googleapis.com https://fcm.googleapis.com https://firestore.googleapis.com; frame-src 'self' https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com;"
}
```

### 2. تحديث `src/middleware.js`

#### إضافة `firestore.googleapis.com` إلى CSP العام:
```javascript
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://securetoken.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://firebasestorage.googleapis.com https://fcm.googleapis.com https://firestore.googleapis.com https://www.google-analytics.com https://analytics.google.com; frame-src 'self';"
);
```

#### إضافة `firestore.googleapis.com` إلى CSP لـ Geidea routes:
```javascript
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.merchant.geidea.net https://accosa-ivs.s3.ap-south-1.amazonaws.com https://secure-acs2ui-b1.wibmo.com https://www.gstatic.com https://securetoken.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.merchant.geidea.net https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://firebasestorage.googleapis.com https://fcm.googleapis.com https://firestore.googleapis.com; frame-src 'self' https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com;"
);
```

## النطاقات المضافة

### نطاق Firestore الجديد:
- `https://firestore.googleapis.com` - Firebase Firestore API

## النتيجة المتوقعة

بعد تطبيق هذا الإصلاح:

### ✅ **Firebase Firestore**:
- قراءة البيانات من Firestore بدون أخطاء CSP
- كتابة البيانات إلى Firestore بدون أخطاء CSP
- الاستماع للتغييرات في Firestore بدون أخطاء CSP
- الاتصال بـ Firestore backend بدون أخطاء CSP

### ✅ **التطبيق**:
- عرض بيانات المستخدم بشكل صحيح
- تحديث البيانات في الوقت الفعلي
- عدم ظهور أخطاء "Failed to get document because the client is offline"
- عدم ظهور أخطاء "Could not reach Cloud Firestore backend"

## اختبار الإصلاح

للتحقق من أن الإصلاح يعمل:
1. افتح Developer Tools في المتصفح
2. انتقل إلى صفحة تحتوي على بيانات من Firestore
3. تحقق من عدم وجود أخطاء CSP في Console
4. تأكد من أن بيانات المستخدم تظهر بشكل صحيح

## ملاحظات مهمة

- تم إضافة `firestore.googleapis.com` إلى جميع إعدادات CSP
- تم الحفاظ على الأمان من خلال السماح فقط بالنطاقات المطلوبة
- تم تطبيق الإصلاح على جميع أنواع الصفحات (عامة و Geidea)

---
**تاريخ الإصلاح**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**الحالة**: مكتمل ✅
**النطاق المضاف**: `https://firestore.googleapis.com` 
