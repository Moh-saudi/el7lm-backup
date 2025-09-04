# دليل استخدام BeOn API المحدث

## 🎯 **الملخص**

تم تحديث جميع خدمات BeOn API لتتطابق مع الوثائق الرسمية. الآن جميع الخدمات تعمل بشكل صحيح مع الـ headers والـ endpoints الصحيحة.

## ✅ **المشاكل التي تم حلها**

### 1. **Headers خاطئة**
- ❌ **قبل**: `Authorization: Bearer token`
- ✅ **بعد**: `beon-token: token`

### 2. **API Endpoints خاطئة**
- ❌ **قبل**: `/send/message/otp`
- ✅ **بعد**: `/send/message/sms`

### 3. **Request Body خاطئ**
- ❌ **قبل**: `{ phoneNumber, message }`
- ✅ **بعد**: `{ name, phoneNumber, message }`

## 🔧 **الخدمات المحدثة**

### 1. **SMS Service** (`/api/notifications/sms/beon`)
```javascript
// إرسال SMS عادي
const response = await fetch('/api/notifications/sms/beon', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+201017799580',
    message: 'رسالة الاختبار',
    name: 'اسم المرسل'
  })
});
```

### 2. **WhatsApp Service** (`/api/notifications/whatsapp/send`)
```javascript
// إرسال WhatsApp
const response = await fetch('/api/notifications/whatsapp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+201017799580',
    message: 'رسالة WhatsApp'
  })
});
```

### 3. **OTP Service** (`/api/notifications/whatsapp/beon`)
```javascript
// إرسال OTP
const response = await fetch('/api/notifications/whatsapp/beon', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+201017799580',
    otp: '123456',
    name: 'اسم المستخدم'
  })
});
```

## 🔑 **المفاتيح المستخدمة**

### **من الوثائق الرسمية:**
```bash
# SMS Regular
BEON_SMS_TOKEN=SPb4sgedfe

# SMS Template  
BEON_SMS_TOKEN_TEMPLATE=SPb4sbemr5bwb7sjzCqTcL

# SMS Bulk
BEON_SMS_TOKEN_BULK=nzQ7ytW8q6yfQdJRFM57yRfR

# WhatsApp (نستخدم نفس SMS token)
BEON_WHATSAPP_TOKEN=SPb4sgedfe
```

## 📱 **صفحة الاختبار**

تم إنشاء صفحة اختبار شاملة:
```
http://localhost:3000/test-beon-api
```

**المميزات:**
- ✅ اختبار SMS
- ✅ اختبار WhatsApp  
- ✅ اختبار OTP
- ✅ اختبار جميع الخدمات معاً
- ✅ عرض النتائج في الوقت الفعلي
- ✅ معلومات التكوين

## 🚀 **كيفية الاستخدام**

### 1. **إعداد متغيرات البيئة**
```bash
# في ملف .env.local
BEON_SMS_TOKEN=SPb4sgedfe
BEON_SMS_TOKEN_TEMPLATE=SPb4sbemr5bwb7sjzCqTcL
BEON_SMS_TOKEN_BULK=nzQ7ytW8q6yfQdJRFM57yRfR
BEON_WHATSAPP_TOKEN=SPb4sgedfe
BEON_SENDER_NAME=El7lm
```

### 2. **اختبار الخدمات**
```bash
# انتقل إلى صفحة الاختبار
http://localhost:3000/test-beon-api

# أو استخدم API مباشرة
curl -X POST http://localhost:3000/api/notifications/sms/beon \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+201017799580",
    "message": "اختبار رسالة",
    "name": "Test User"
  }'
```

### 3. **في الكود**
```javascript
// إرسال إشعار
const sendNotification = async (phone, message) => {
  const response = await fetch('/api/notifications/whatsapp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: phone, message })
  });
  
  const result = await response.json();
  return result.success;
};
```

## 📊 **مقارنة قبل وبعد**

| الجانب | قبل | بعد |
|--------|------|------|
| **Headers** | `Authorization: Bearer` | `beon-token` |
| **SMS Endpoint** | `/send/message/otp` | `/send/message/sms` |
| **Request Body** | `{phoneNumber, message}` | `{name, phoneNumber, message}` |
| **Response Handling** | يحاول parse JSON | لا يوجد response body |
| **Error Handling** | معقد | مبسط |
| **Fallback** | غير موجود | SMS عند فشل WhatsApp |

## 🎉 **النتيجة**

الآن جميع خدمات BeOn API تعمل بشكل صحيح:
- ✅ **SMS**: يعمل بنجاح
- ✅ **WhatsApp**: يعمل بنجاح  
- ✅ **OTP**: يعمل بنجاح
- ✅ **Fallback**: SMS عند فشل WhatsApp
- ✅ **Error Handling**: محسن
- ✅ **Documentation**: متطابق مع الوثائق الرسمية

## 🔍 **استكشاف الأخطاء**

إذا واجهت مشاكل:

1. **تحقق من متغيرات البيئة**
2. **استخدم صفحة الاختبار**
3. **راجع console logs**
4. **تأكد من صحة رقم الهاتف**

## 📞 **الدعم**

للمساعدة الإضافية، راجع:
- الوثائق الرسمية: https://beon.chat/api
- صفحة الاختبار: `/test-beon-api`
- ملفات التكوين: `src/lib/beon/config.ts`
