# تكامل جيديا الرسمي - دليل شامل

## نظرة عامة
هذا الدليل مبني على الوثائق الرسمية من جيديا لضمان التكامل الصحيح مع بوابة الدفع.

## الخطوات الأساسية

### 1. إنشاء جلسة الدفع (Create Session)

#### المعايير المطلوبة:
- `amount`: المبلغ (مطلوب)
- `currency`: العملة (مطلوب) - EGP, SAR, AED, QAR, OMR, BHD, KWD, USD, GBP, EUR
- `timestamp`: التوقيت (مطلوب)
- `merchantReferenceId`: معرف فريد من التاجر (اختياري)
- `signature`: التوقيع الأمني (مطلوب)
- `callbackUrl`: رابط الاستدعاء (مطلوب) - يجب أن يكون HTTPS

#### المعايير الاختيارية:
- `language`: اللغة ("en" أو "ar") - الافتراضي "en"
- `paymentOperation`: نوع العملية ("Pay" افتراضي)
- `returnUrl`: رابط العودة بعد الدفع
- `customer`: بيانات العميل
- `order`: تفاصيل الطلب

#### مثال على الطلب:
```json
{
  "amount": "100.00",
  "currency": "EGP",
  "timestamp": "2024-01-15T10:30:00Z",
  "merchantReferenceId": "ORDER-123",
  "signature": "generated_signature_here",
  "callbackUrl": "https://your-domain.com/api/geidea/callback",
  "returnUrl": "https://your-domain.com/payment/success",
  "language": "ar",
  "paymentOperation": "Pay"
}
```

### 2. إنشاء التوقيع (Signature)

#### الخوارزمية:
1. ربط النص: `{MerchantPublicKey}{OrderAmount}{OrderCurrency}{MerchantReferenceId}{timeStamp}`
2. تنسيق المبلغ: رقم عشري بمنزلتين (مثال: 100.00)
3. تشفير: SHA-256 HMAC باستخدام API Password
4. تحويل: Base64

#### مثال على الكود:
```typescript
function generateSignature(
  merchantPublicKey: string,
  amount: number,
  currency: string,
  merchantReferenceId: string,
  apiPassword: string,
  timestamp: string
): string {
  const amountStr = amount.toFixed(2);
  const data = `${merchantPublicKey}${amountStr}${currency}${merchantReferenceId}${timestamp}`;
  return crypto
    .createHmac('sha256', apiPassword)
    .update(data)
    .digest('base64');
}
```

### 3. تحميل مكتبة جيديا

#### الرابط الصحيح حسب البيئة:
- **مصر**: `https://www.merchant.geidea.net/hpp/geideaCheckout.min.js`
- **السعودية**: `https://www.ksamerchant.geidea.net/hpp/geideaCheckout.min.js`
- **الإمارات**: `https://payments.geidea.ae/hpp/geideaCheckout.min.js`

#### مثال على التحميل:
```html
<script src="https://www.merchant.geidea.net/hpp/geideaCheckout.min.js"></script>
```

### 4. تهيئة جيديا تشيك آوت

#### إنشاء كائن الدفع:
```javascript
const payment = new GeideaCheckout(onSuccess, onError, onCancel);
```

#### دوال الاستدعاء:
```javascript
// نجاح الدفع
const onSuccess = (data) => {
  console.log('Payment successful:', {
    responseCode: data.responseCode,
    responseMessage: data.responseMessage,
    orderId: data.orderId,
    reference: data.reference
  });
};

// خطأ في الدفع
const onError = (data) => {
  console.error('Payment error:', {
    responseCode: data.responseCode,
    responseMessage: data.responseMessage,
    detailedResponseMessage: data.detailedResponseMessage
  });
};

// إلغاء الدفع
const onCancel = (data) => {
  console.log('Payment cancelled:', {
    responseCode: data.responseCode,
    responseMessage: data.responseMessage
  });
};
```

### 5. بدء عملية الدفع

#### الوضع المنبثق (Popup Mode):
```javascript
payment.startPayment(sessionId);
```

#### الوضع المدمج (Drop-in Mode):
```javascript
payment.startPayment(sessionId, null, "checkout-container");
```

#### الوضع التوجيهي (Redirection Mode):
```javascript
window.open(`https://www.merchant.geidea.net/hpp/checkout/${sessionId}`, "_blank");
```

## إعدادات البيئة

### متغيرات البيئة المطلوبة:
```env
# جيديا - مصر
GEIDEA_MERCHANT_PUBLIC_KEY=your_merchant_public_key
GEIDEA_API_PASSWORD=your_api_password
GEIDEA_BASE_URL=https://api.merchant.geidea.net
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# جيديا - السعودية
GEIDEA_BASE_URL=https://api.ksamerchant.geidea.net

# جيديا - الإمارات
GEIDEA_BASE_URL=https://api.geidea.ae
```

### روابط API حسب البيئة:
- **مصر**: `https://api.merchant.geidea.net/payment-intent/api/v2/direct/session`
- **السعودية**: `https://api.ksamerchant.geidea.net/payment-intent/api/v2/direct/session`
- **الإمارات**: `https://api.geidea.ae/payment-intent/api/v2/direct/session`

## معالجة الاستجابة

### استجابة إنشاء الجلسة:
```json
{
  "session": {
    "id": "session-id-here",
    "amount": 100.00,
    "currency": "EGP",
    "callbackUrl": "https://your-domain.com/api/geidea/callback",
    "returnUrl": "https://your-domain.com/payment/success",
    "expiryDate": "2024-01-15T10:45:00Z",
    "status": "Initiated",
    "merchantReferenceId": "ORDER-123"
  },
  "responseCode": "000",
  "responseMessage": "Success",
  "detailedResponseMessage": "The operation was successful"
}
```

### استجابة الدفع:
```json
{
  "responseCode": "000",
  "responseMessage": "Success",
  "detailedResponseCode": "000",
  "detailedResponseMessage": "Payment successful",
  "orderId": "geidea-order-id",
  "reference": "geidea-reference-id"
}
```

## الأمان

### ⚠️ تحذيرات مهمة:
1. **لا تعرض API Password في الواجهة الأمامية**
2. **استخدم server-to-server API calls فقط**
3. **تأكد من استخدام HTTPS في الإنتاج**
4. **تحقق من صحة التوقيع في كل طلب**

### أفضل الممارسات:
- استخدم Basic Authentication مع Merchant Public Key و API Password
- تحقق من صحة التوقيع في كل استجابة
- استخدم HTTPS لجميع الاتصالات
- احتفظ بالمفاتيح في متغيرات البيئة الآمنة

## رموز الاستجابة

### رموز النجاح:
- `000`: نجح العملية
- `001`: تم قبول الطلب

### رموز الخطأ الشائعة:
- `100`: خطأ في المعايير
- `101`: خطأ في التوقيع
- `102`: خطأ في المفاتيح
- `103`: خطأ في العملة
- `104`: خطأ في المبلغ

## الدعم

### في حالة المشاكل:
1. تحقق من صحة المفاتيح
2. تأكد من استخدام البيئة الصحيحة
3. تحقق من صحة التوقيع
4. راجع سجلات الأخطاء
5. اتصل بدعم جيديا

### روابط مفيدة:
- [لوحة تحكم جيديا](https://merchant.geidea.net/)
- [وثائق جيديا الرسمية](https://docs.geidea.net/)
- [دعم جيديا](https://www.geidea.net/support) 
