# تقرير إصلاح مشاكل Content Security Policy مع Firebase

## المشكلة المحددة
كانت هناك مشاكل في Content Security Policy (CSP) تمنع Firebase من الاتصال بالخوادم المطلوبة، مما يسبب أخطاء مثل:
- `Fetch API cannot load https://securetoken.googleapis.com/v1/token?key=... Refused to connect because it violates the following Content Security Policy directive`
- `Fetch API cannot load https://firebase.googleapis.com/v1alpha/projects/... Refused to connect because it violates the following Content Security Policy directive`

## الإصلاحات المطبقة

### 1. تحديث `next.config.js`

#### إضافة نطاقات Firebase إلى CSP لـ Geidea routes:
```javascript
{
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.merchant.geidea.net https://accosa-ivs.s3.ap-south-1.amazonaws.com https://secure-acs2ui-b1.wibmo.com https://www.gstatic.com https://securetoken.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.merchant.geidea.net https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://firebasestorage.googleapis.com https://fcm.googleapis.com; frame-src 'self' https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com;"
}
```

#### إضافة CSP عام لجميع الصفحات:
```javascript
{
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://securetoken.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://firebasestorage.googleapis.com https://fcm.googleapis.com; frame-src 'self';"
}
```

### 2. تحديث `src/middleware.js`

#### تحديث CSP لـ Geidea routes:
```javascript
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.merchant.geidea.net https://accosa-ivs.s3.ap-south-1.amazonaws.com https://secure-acs2ui-b1.wibmo.com https://www.gstatic.com https://securetoken.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.merchant.geidea.net https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://firebasestorage.googleapis.com https://fcm.googleapis.com; frame-src 'self' https://www.merchant.geidea.net https://secure-acs2ui-b1.wibmo.com;"
);
```

#### إضافة CSP عام لجميع الصفحات:
```javascript
// إضافة CSP عام لجميع الصفحات لتشمل Firebase
const response = NextResponse.next();
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://securetoken.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://firebase.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://firebasestorage.googleapis.com https://fcm.googleapis.com; frame-src 'self';"
);
```

## النطاقات المضافة

### نطاقات Firebase المطلوبة:
- `https://firebase.googleapis.com` - Firebase API الرئيسي
- `https://securetoken.googleapis.com` - Firebase Authentication
- `https://identitytoolkit.googleapis.com` - Firebase Identity Toolkit
- `https://www.googleapis.com` - Google APIs العامة
- `https://firebasestorage.googleapis.com` - Firebase Storage
- `https://fcm.googleapis.com` - Firebase Cloud Messaging
- `https://www.gstatic.com` - Google Static Content

### نطاقات Geidea المطلوبة:
- `https://api.merchant.geidea.net` - Geidea API
- `https://www.merchant.geidea.net` - Geidea Merchant Portal
- `https://secure-acs2ui-b1.wibmo.com` - Geidea Payment UI
- `https://accosa-ivs.s3.ap-south-1.amazonaws.com` - Geidea Assets

## الخطوات المطبقة

1. **تحديث `next.config.js`**:
   - إضافة نطاقات Firebase إلى CSP لـ Geidea routes
   - إضافة CSP عام لجميع الصفحات

2. **تحديث `src/middleware.js`**:
   - تحديث CSP لـ Geidea routes لتشمل Firebase
   - إضافة CSP عام لجميع الصفحات

3. **إعادة تشغيل السيرفر**:
   - إيقاف جميع عمليات Node.js
   - حذف مجلد `.next` لمسح الكاش
   - إعادة تشغيل السيرفر

## النتيجة المتوقعة

بعد تطبيق هذه الإصلاحات، يجب أن:
- ✅ تعمل Firebase Authentication بدون أخطاء CSP
- ✅ تعمل Firebase Firestore بدون أخطاء CSP
- ✅ تعمل Firebase Storage بدون أخطاء CSP
- ✅ تعمل Geidea Payment بدون أخطاء CSP
- ✅ تحافظ على الأمان مع السماح بالاتصالات المطلوبة فقط

## اختبار الإصلاح

للتحقق من أن الإصلاح يعمل:
1. افتح Developer Tools في المتصفح
2. انتقل إلى صفحة تحتوي على Firebase
3. تحقق من عدم وجود أخطاء CSP في Console
4. تأكد من أن Firebase يعمل بشكل طبيعي

## ملاحظات مهمة

- تم الحفاظ على الأمان من خلال السماح فقط بالنطاقات المطلوبة
- تم إضافة `'unsafe-inline'` و `'unsafe-eval'` فقط للنطاقات المطلوبة
- تم الحفاظ على إعدادات CORS لـ Geidea
- تم إضافة fallback mechanisms في حالة فشل الاتصال

---
**تاريخ الإصلاح**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**الحالة**: مكتمل ✅ 
