# دليل BeOn API المحدث مع الـ Token الجديد

## 🎯 **الملخص**

تم تحديث تكوين BeOn API ليستخدم الـ token الجديد والـ endpoint الصحيح للـ WhatsApp OTP!

## ✅ **التحديثات الجديدة**

### 1. **Token جديد للـ WhatsApp OTP**
- ✅ **Token الجديد**: `vSCuMzZwLjDxzR882YphwEgW`
- ✅ **Endpoint الجديد**: `/send/message/otp`
- ✅ **Header الجديد**: `Authorization: Bearer token`

### 2. **Callback URL**
- ✅ **Callback URL**: `http://www.el7lm.com/beon/`
- ✅ **معالجة Callback**: GET endpoint للتحقق من OTP

## 🔧 **الملفات الجديدة والمحدثة**

### 1. **تكوين محدث** (`src/lib/beon/config.ts`)
```typescript
// Token الجديد للـ WhatsApp OTP
WHATSAPP_OTP: 'vSCuMzZwLjDxzR882YphwEgW',

// Endpoint الجديد
WHATSAPP_OTP: '/send/message/otp',

// Callback URL
CALLBACK_URL: 'http://www.el7lm.com/beon/'
```

### 2. **خدمة WhatsApp OTP جديدة** (`src/lib/beon/whatsapp-otp-service.ts`)
- ✅ خدمة منفصلة للـ WhatsApp OTP
- ✅ استخدام الـ token الجديد
- ✅ معالجة Callback
- ✅ إنشاء WhatsApp links

### 3. **API Route جديد** (`src/app/api/notifications/whatsapp/otp/route.ts`)
- ✅ POST: إرسال OTP
- ✅ GET: معالجة Callback
- ✅ تنسيق رقم الهاتف
- ✅ محاكاة في وضع التطوير

### 4. **صفحة اختبار محدثة** (`src/app/test-beon-api/page.tsx`)
- ✅ اختبار WhatsApp OTP الجديد
- ✅ عرض البيانات التفصيلية
- ✅ معلومات التكوين المحدثة

## 🚀 **كيفية الاستخدام**

### 1. **إرسال WhatsApp OTP**
```javascript
const response = await fetch('/api/notifications/whatsapp/otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+201017799580',
    reference: 'ref_123456'
  })
});

const result = await response.json();
// result.otp - رمز التحقق
// result.link - رابط WhatsApp
// result.reference - مرجع الطلب
```

### 2. **معالجة Callback**
```javascript
// سيتم استدعاؤها تلقائياً من BeOn
GET /api/notifications/whatsapp/otp?otp=1234&reference=ref_123456&status=verified&clientPhone=+201017799580&clientName=User
```

### 3. **اختبار الخدمة**
```
http://localhost:3000/test-beon-api
```

## 📊 **مقارنة الخدمات**

| الخدمة | Endpoint | Token | Header | الاستخدام |
|--------|----------|-------|--------|-----------|
| **SMS** | `/send/message/sms` | `SPb4sgedfe` | `beon-token` | رسائل عادية |
| **WhatsApp** | `/send/message/sms` | `SPb4sgedfe` | `beon-token` | رسائل عادية |
| **WhatsApp OTP** | `/send/message/otp` | `vSCuMzZwLjDxzR882YphwEgW` | `Authorization: Bearer` | رمز تحقق |
| **SMS Template** | `/send/message/sms/template` | `SPb4sbemr5bwb7sjzCqTcL` | `beon-token` | قوالب |
| **SMS Bulk** | `/send/message/sms/bulk` | `nzQ7ytW8q6yfQdJRFM57yRfR` | `beon-token` | رسائل جماعية |

## 🔍 **استكشاف الأخطاء**

### 1. **تحقق من الـ Token**
```bash
# في ملف .env.local
BEON_WHATSAPP_OTP_TOKEN=vSCuMzZwLjDxzR882YphwEgW
```

### 2. **تحقق من الـ Callback URL**
```bash
# في ملف .env.local
BEON_CALLBACK_URL=http://www.el7lm.com/beon/
```

### 3. **استخدم صفحة الاختبار**
- انتقل إلى: `http://localhost:3000/test-beon-api`
- اختر "اختبار WhatsApp OTP"
- راجع النتائج والبيانات التفصيلية

## 📱 **مثال على الاستخدام الكامل**

```javascript
// 1. إرسال OTP
const sendOTP = async (phoneNumber) => {
  const response = await fetch('/api/notifications/whatsapp/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber,
      reference: `ref_${Date.now()}`
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // عرض رابط WhatsApp للمستخدم
    window.open(result.link, '_blank');
    
    // حفظ الـ reference للتحقق لاحقاً
    localStorage.setItem('otp_reference', result.reference);
  }
  
  return result;
};

// 2. التحقق من OTP (سيتم تلقائياً عبر callback)
const verifyOTP = async (otp) => {
  const reference = localStorage.getItem('otp_reference');
  
  // في الواقع، سيتم التحقق عبر callback
  // لكن يمكنك محاكاة التحقق هنا
  console.log('Verifying OTP:', { otp, reference });
};
```

## 🎉 **النتيجة**

الآن لديك:
- ✅ **Token جديد** للـ WhatsApp OTP
- ✅ **Endpoint صحيح** للـ OTP
- ✅ **Callback handling** تلقائي
- ✅ **صفحة اختبار شاملة**
- ✅ **دليل شامل** للاستخدام

**جميع الخدمات تعمل بشكل صحيح مع الـ Token الجديد!** 🎉

## 📞 **الدعم**

للمساعدة الإضافية:
- صفحة الاختبار: `/test-beon-api`
- ملفات التكوين: `src/lib/beon/config.ts`
- هذا الدليل: `BEON_API_UPDATED_GUIDE.md`
